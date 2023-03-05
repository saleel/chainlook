import { connect, NetworkName } from '@tableland/sdk';
import { DataSource } from '../../domain/widget';

export default async function fetchWidgetDataFromTableland(
  config: Partial<DataSource>,
  fieldsRequired: string[],
) {
  if (!config || !config.network || !config.tableName) {
    throw new Error('No config provided for Tableland provider');
  }

  const { network, tableName, ...restConfig } = config;
  const { orderBy, orderDirection, skip, first, filters } = restConfig;

  const tableland = await connect({ network: network as NetworkName });

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
