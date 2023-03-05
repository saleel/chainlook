import { WidgetDataSource } from '../../domain/widget';
import { fetchDataFromIPFS } from '../../utils/network';

// Filters and variables not required for IPFS as only entire data can be fetched
export default async function fetchWidgetDataFromIPFS(config: Partial<WidgetDataSource>) {
  if (!config || !config.cid) {
    throw new Error('No config provided for IPFS provider');
  }

  return fetchDataFromIPFS(config.cid);
}
