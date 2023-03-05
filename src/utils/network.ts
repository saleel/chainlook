import axios from 'axios';
import { IPFS_GATEWAY } from '../constants';

export async function fetchDataFromHTTP(config) {
  const response = await axios(config);
  return response.data;
}

export async function fetchDataFromIPFS(cid) {
  const data = await fetchDataFromHTTP({
    method: 'get',
    baseURL: IPFS_GATEWAY,
    url: `/ipfs/${cid}`,
  });

  return data;
}

export async function fetchDataFromIPNS(cid) {
  const data = await fetchDataFromHTTP({
    method: 'get',
    baseURL: IPFS_GATEWAY,
    url: `/ipns/${cid}`,
  });

  return data;
}
