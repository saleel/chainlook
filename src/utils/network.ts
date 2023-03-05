import axios, { AxiosRequestConfig } from 'axios';
import { IPFS_GATEWAY } from '../constants';

export async function fetchDataFromHTTP(config: AxiosRequestConfig) {
  const response = await axios(config);
  return response.data;
}

export async function fetchDataFromIPFS(cid: string) {
  const data = await fetchDataFromHTTP({
    method: 'get',
    baseURL: IPFS_GATEWAY,
    url: `/ipfs/${cid}`,
  });

  return data;
}

export async function fetchDataFromIPNS(cid: string) {
  const data = await fetchDataFromHTTP({
    method: 'get',
    baseURL: IPFS_GATEWAY,
    url: `/ipns/${cid}`,
  });

  return data;
}
