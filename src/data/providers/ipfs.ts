import { fetchDataFromIPFS } from '../../utils/network';

// Filters and variables not required for IPFS as only entire data can be fetched
export default async function fetchWidgetDataFromIPFS(config) {
  return fetchDataFromIPFS(config.cid);
}
