import { connect } from '@tableland/sdk';
import { applyVariables } from '../utils/widget-parsing';

export default async function fetchWidgetDataFromTableland(config, fieldsRequired, variables) {
  const { network, tableName, ...restConfig } = config;
  const { orderBy, orderDirection, skip, first, filters } = applyVariables(restConfig, variables);

  const tableland = await connect({ network });

  let whereQuery = Object.entries(filters || {})
    .map(([key, value]) => `${key} = ${value}`)
    .join(' AND ');

  if (whereQuery) {
    whereQuery = ` WHERE ${whereQuery}`;
  } else {
    whereQuery = '';
  }

  let filtersQuery = '';
  if (orderBy) {
    filtersQuery += `ORDER BY ${orderBy}`;

    if (orderDirection) {
      filtersQuery += ` ${orderDirection}`;
    }
  }

  if (first) {
    filtersQuery += ` LIMIT ${first}`;
  }

  if (skip) {
    filtersQuery += ` OFFSET ${skip}`;
  }

  const query = `SELECT ${fieldsRequired.join(
    ', ',
  )} FROM ${tableName} ${whereQuery} ${filtersQuery};`;

  const result = await tableland.read(query);

  return Object.values(result);
}
