import GlobalVariables from '../data/modifiers/variables';
import API from '../data/api';
import GroupAggregations from '../data/modifiers/group';
import Formatters from '../data/modifiers/formatters';
import Transformers from '../data/modifiers/transformers';
import { getQueriesAndFieldsFromGraphQlSchema } from './graphql';
import DynamicFieldOperations from '../data/modifiers/dynamic-fields';

/**
 * Parse widget configuration and return the fields required in `source.dataKey` format
 *
 * @param {*} widget
 * @returns {string[]}
 */
export function getFieldNamesRequiredForWidget(widget) {
  let displayFields = [];

  if (widget.type === 'chart') {
    displayFields = [
      widget.chart.xAxis?.dataKey,
      ...(widget.chart.lines || []).map((d) => d.dataKey),
      ...(widget.chart.bars || []).map((d) => d.dataKey),
      ...(widget.chart.areas || []).map((d) => d.dataKey),
    ].filter(Boolean);
  }

  if (widget.type === 'pieChart') {
    displayFields = [widget.pieChart.dataKey, widget.pieChart.nameKey];
  }

  if (widget.type === 'table') {
    displayFields = widget.table.columns.map((d) => d.dataKey);
  }

  if (widget.type === 'metric') {
    displayFields = [widget.metric.dataKey];
  }

  // Include all fields mentioned in join and group
  const fieldsRequiredForJoin = [...new Set(Object.entries(widget.data?.join ?? {}).flat())];
  const fieldsRequiredForGroup = widget.data.group?.dataKey ?? [];
  const fieldsRequiredForDynamicFields =
    Object.values(widget.data.dynamicFields || {})
      .map((d: any) => d?.fields)
      ?.flat() || [];

  return [
    ...displayFields,
    ...fieldsRequiredForJoin,
    ...fieldsRequiredForGroup,
    ...fieldsRequiredForDynamicFields,
  ];
}

/**
 * Apply variable values for object values starting with $
 *
 * @param {*} object Object to be modified
 * @param {*} variables Variables object containing current values.  Keys don't need to start with $
 */
export function applyVariables(object, variables) {
  const updatedObject = { ...object };

  Object.keys(object).forEach((key) => {
    let value = object[key];

    if (typeof value === 'string' && value.startsWith('$')) {
      const variableKey = value.slice(1);

      // Keys in `globalVariables` start with $, and values are function start return the current value
      if (GlobalVariables[value]) {
        value = GlobalVariables[value]();
      } else if (variableKey in variables) {
        value = variables[variableKey];
      } else {
        throw Error(`Cannot resolve variable named ${value}`);
      }

      updatedObject[key] = value;
    }

    // Apply variables recursively to nested objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      updatedObject[key] = applyVariables(value, variables);
    }
  });

  return updatedObject;
}

// Return a suitable formatter for the field based on name and type
export function getFormatterForField(name: string, type: string) {
  const fieldName = name.toLowerCase();

  if (fieldName.includes('timestamp') || fieldName.includes('date')) {
    return 'dateMMMdd';
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
export async function enrichWidgetSchema(currSchema: { $defs: any }, { dataSource, dataSources }) {
  if (!currSchema || !currSchema.$defs) {
    return currSchema;
  }

  currSchema.$defs.formatter.enum = Object.keys(Formatters);
  currSchema.$defs.transformer.enum = Object.keys(Transformers);
  currSchema.$defs.aggregation.enum = Object.keys(GroupAggregations);
  currSchema.$defs.dynamicFieldOperation.enum = Object.keys(DynamicFieldOperations);

  // Only one data source
  if (dataSource && dataSource.subgraphId) {
    const { subgraphId, entity } = dataSource;

    const subgraphSchema = await API.getSubgraphSchema(subgraphId);
    const subgraphQueries = getQueriesAndFieldsFromGraphQlSchema(subgraphSchema);

    // Set options for query
    currSchema.$defs.dataSource.properties.entity.enum = Object.keys(subgraphQueries);

    const fieldNames = (subgraphQueries[entity] || []).map((s) => s.name);
    const orderByFields = (subgraphQueries[entity] || []).map((s) => s.nameForFilter);

    // Set fields names
    currSchema.$defs.field.enum = fieldNames;
    currSchema.$defs.dataSource.properties.orderBy.enum = orderByFields;
  }

  // Has multiple data sources
  if (dataSources) {
    let fieldNames: string[] = []; // to store fields from all data sources

    for (const [sourceName, source] of Object.entries(dataSources)) {
      if (!source.subgraphId) continue;

      const { subgraphId, entity } = source;

      const subgraphSchema = await API.getSubgraphSchema(subgraphId);
      const subgraphQueries = getQueriesAndFieldsFromGraphQlSchema(subgraphSchema);

      // Field name should be prefixed with data source name
      const fieldsInSelectedQuery = (subgraphQueries[entity] || []).map(
        (s) => `${sourceName}.${s.name}`,
      );
      fieldNames = fieldNames.concat(fieldsInSelectedQuery);
    }

    currSchema.$defs.field.enum = fieldNames;
  }

  return currSchema;
}
