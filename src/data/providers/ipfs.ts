import { DataSource } from '../../domain/widget';
import { fetchDataFromIPFS } from '../../utils/network';

export default async function fetchWidgetDataFromIPFS(config: Partial<DataSource>) {
  if (!config || !config.cid) {
    throw new Error('No config provided for IPFS provider');
  }

  return fetchDataFromIPFS(config.cid);
}
