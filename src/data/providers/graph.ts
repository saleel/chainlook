import set from 'lodash/set';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { fetchDataFromHTTP } from '../../utils/network';
import { GRAPH_API_KEY, GRAPH_API_URL, GRAPH_HOSTED_SERVICE_URL } from '../../constants';
import Store from '../store';
import { DataSource } from '../../domain/widget';

export default async function fetchWidgetDataFromTheGraph(
  config: Partial<DataSource>,
  fieldsRequired: string[],
) {
  if (!config || !config.subgraphId || !config.entity) {
    throw new Error('No config provided for TheGraph provider');
  }

  const { subgraphId, entity, orderBy, orderDirection, skip = 0, first, filters } = config;

  const fieldsObject = {};
  fieldsRequired.forEach((field) => set(fieldsObject, field, true));

  let queryFilters = {
    orderBy,
    orderDirection,
    skip,
    first,
    where: {
      ...filters,
    },
  };

  const queryFilterKeys = Object.keys(queryFilters) as Array<keyof typeof queryFilters>;

  queryFilterKeys.forEach((k) => {
    if (queryFilters[k] === undefined) {
      delete queryFilters[k];
    }
  });

  const queryObj = {
    query: {
      [entity]: {
        __args: queryFilters,
        ...fieldsObject,
      },
    },
  };
  const query = jsonToGraphQLQuery(queryObj, { pretty: true });

  const result = await queryGraphQl(subgraphId, query);

  return result.data?.[entity] ?? null;
}

export async function queryGraphQl(subgraphId: string, query: string) {
  // Assume hosted service if the subgraphId is has in author/name format
  const isHostedService = subgraphId.includes('/');

  const apiKey = Store.getTheGraphAPIKey() || GRAPH_API_KEY;

  let url = `${GRAPH_API_URL}/${apiKey}/subgraphs/id/${subgraphId}`;
  if (isHostedService) {
    url = `${GRAPH_HOSTED_SERVICE_URL}/${subgraphId}`;
  }

  const result = await fetchDataFromHTTP({
    url,
    method: 'POST',
    data: {
      query,
    },
  });

  if (result.errors) {
    throw new Error(
      `Error while querying data from subgraph ${subgraphId} \n${JSON.stringify(result.errors)}`,
    );
  }

  return result;
}
