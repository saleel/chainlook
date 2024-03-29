import Variables from '../data/modifiers/variables';
import API from '../data/api';
import GroupAggregations from '../data/modifiers/group';
import Formatters from '../data/modifiers/formatters';
import Transformers from '../data/modifiers/transformers';
import { getQueriesAndFieldsFromGraphQlSchema } from './graphql';
import DynamicFieldOperations from '../data/modifiers/dynamic-fields';
import { DataSource, WidgetDefinition } from '../domain/widget';

// Get fields required from data source for the widget tp render
export function getFieldNamesRequiredForWidget(widgetDefinition: WidgetDefinition) {
  if (!widgetDefinition.data) {
    return [];
  }

  let displayFields: string[] = [];

  if (widgetDefinition.type === 'chart') {
    displayFields = [
      widgetDefinition.chart!.xAxis?.dataKey,
      ...(widgetDefinition.chart!.lines || []).map((d) => d.dataKey),
      ...(widgetDefinition.chart!.bars || []).map((d) => d.dataKey),
      ...(widgetDefinition.chart!.areas || []).map((d) => d.dataKey),
    ].filter(Boolean);
  }

  if (widgetDefinition.type === 'pieChart') {
    displayFields = [widgetDefinition.pieChart!.dataKey, widgetDefinition.pieChart!.nameKey];
  }

  if (widgetDefinition.type === 'table') {
    displayFields = widgetDefinition.table!.columns.map((d) => d.dataKey);
  }

  if (widgetDefinition.type === 'metric') {
    displayFields = [widgetDefinition.metric!.dataKey];
  }

  // Include all fields mentioned in join and group
  const fieldsRequiredForJoin = [
    ...new Set(Object.entries(widgetDefinition.data?.join ?? {}).flat()),
  ];

  const fieldsRequiredForGroup = [
    widgetDefinition.data?.group?.key,
    ...Object.keys(widgetDefinition.data?.group?.aggregations ?? {}),
  ];

  const fieldsRequiredForDynamicFields =
    Object.values(widgetDefinition.data.dynamicFields || {})
      .map((d: any) => d?.fields)
      ?.flat() || [];

  const allFields = [
    ...displayFields,
    ...fieldsRequiredForJoin,
    ...fieldsRequiredForGroup,
    ...fieldsRequiredForDynamicFields,
  ].filter(Boolean);

  const uniqueFields = [...new Set(allFields)];

  return uniqueFields;
}

// Apply dynamic variable values to the given object recursively
export function applyVariables(dataSource: any, runtimeVariables: Record<string, any>) {
  const updatedObject: any = { ...dataSource };
  const dataSourceKeys = Object.keys(dataSource) as (keyof DataSource)[];

  dataSourceKeys.forEach((key) => {
    let value = dataSource[key];

    // Apply variables recursively to nested objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      updatedObject[key] = applyVariables(value, runtimeVariables);
    }

    if (typeof value === 'string' && value.startsWith('$')) {
      // Apply variable if present
      const variablesFunction = Variables[value as keyof typeof Variables];
      if (variablesFunction) {
        updatedObject[key] = variablesFunction();
        return;
      }

      // Look for a runtime variable (runTimeVariables they don't start with $)
      // Values of runTimeVariables are not functions, but the actual value
      const variableKey = value.slice(1);
      if (variableKey in runtimeVariables) {
        updatedObject[key] = runtimeVariables[variableKey];
        return;
      }

      throw Error(`Cannot resolve variable named ${value}`);
    }
  });

  return updatedObject;
}

// Return a suitable formatter for the field based on name and type
export function getFormatterForField(name: string, type: string) {
  const fieldName = name.toLowerCase();

  if (fieldName.includes('timestamp') || fieldName.includes('date')) {
    return 'localeDate';
  }

  if ((fieldName.includes('amount'), fieldName.includes('usd'))) {
    return 'currencyUSD';
  }

  if (type === 'BigInt') {
    return 'roundedNumber';
  }

  if (type === 'BigDecimal') {
    return 'bigDecimal';
  }
}

// Add enums to widget schema based on data source
export async function enrichWidgetSchema(schema: { $defs: any }, definition: WidgetDefinition) {
  if (!schema || !schema.$defs) {
    return schema;
  }

  schema.$defs.formatter.enum = Object.keys(Formatters);
  schema.$defs.transformer.enum = Object.keys(Transformers);
  schema.$defs.aggregation.enum = Object.keys(GroupAggregations);
  schema.$defs.dynamicFieldOperation.enum = Object.keys(DynamicFieldOperations);

  const { data } = definition;
  const { source, sources, dynamicFields } = data || {};

  schema.$defs.field.enum = [];

  // Add dynamic fields to fields
  if (dynamicFields) {
    const dynamicFieldNames = Object.keys(dynamicFields);
    schema.$defs.field.enum.push(...dynamicFieldNames);
  }

  try {
    // Only one data source
    if (source && source.subgraphId) {
      const { subgraphId, query } = source;

      const subgraphSchema = await API.getSubgraphSchema(subgraphId);
      const subgraphQueries = getQueriesAndFieldsFromGraphQlSchema(subgraphSchema);

      // Set options for query
      schema.$defs.dataSource.properties.query.enum = Object.keys(subgraphQueries);

      const fieldNames = (subgraphQueries[query as string] || []).map((s) => s.name);
      const orderByFields = (subgraphQueries[query as string] || []).map((s) => s.nameForFilter);

      // Set fields names
      schema.$defs.field.enum.push(...fieldNames);
      schema.$defs.dataSource.properties.orderBy.enum = orderByFields;
    }

    // Has multiple data sources
    if (sources) {
      let fieldNames: string[] = []; // to store fields from all data sources

      for (const [sourceName, source] of Object.entries(sources)) {
        if (!source.subgraphId) continue;

        const { subgraphId, query } = source;

        const subgraphSchema = await API.getSubgraphSchema(subgraphId);
        const subgraphQueries = getQueriesAndFieldsFromGraphQlSchema(subgraphSchema);

        // Field name should be prefixed with data source name
        const fieldsInSelectedQuery = (subgraphQueries[query as string] || []).map(
          (s) => `${sourceName}.${s.name}`,
        );
        fieldNames = fieldNames.concat(fieldsInSelectedQuery);
      }

      schema.$defs.field.enum.push(...fieldNames);
    }
  } catch (error) {
    console.error('Error while enriching schema', error);
  }

  return schema;
}
