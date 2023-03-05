import Widget from "../domain/widget";
import API from "../data/api";
import Aggregations from "../data/modifiers/aggregations";
import Formatters from "../data/modifiers/formatters";
import Transformers from "../data/modifiers/transformers";
import { getQueriesAndFieldsFromGraphQlSchema } from "./graphql";

function addModifiersAsEnums(widgetSchema: { $defs: any }) {
  if (widgetSchema) {
    widgetSchema.$defs.formatter.enum = Object.keys(Formatters);
    widgetSchema.$defs.transformer.enum = Object.keys(Transformers);
    widgetSchema.$defs.aggregation.enum = Object.keys(Aggregations);
    widgetSchema.$defs.dynamicFieldOperation.enum = ['sum', 'subtract', 'multiply'];
  }

  return widgetSchema;
}


export async function enrichWidgetSchema(currSchema: { $defs: any }, { dataSource, dataSources } ) {
  addModifiersAsEnums(currSchema);

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