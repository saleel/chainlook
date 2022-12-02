import axios from 'axios';
// import { Web3Storage } from 'web3.storage';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import Loki from 'lokijs';
import LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter';
import get from 'lodash/get';
import set from 'lodash/set';
import { connect } from '@tableland/sdk';
import aggregations from './helpers/aggregations';
import sampleDashboard from './examples/uniswap-v3.json';
import ipfsSampleDashboard from './examples/ipfs-dashboard.json';
import variables from './helpers/variables';

const GRAPH_HOSTED_SERVICE_URL = 'https://api.thegraph.com/subgraphs/name';
const GRAPH_API_KEY = '8c912c4609257d267b52da9834913c0b';
const GRAPH_API_URL = `https://gateway.thegraph.com/api/${GRAPH_API_KEY}`;

// eslint-disable-next-line max-len
// const web3Storage = new Web3Storage({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGMzZDVhZjA0OUEwYTUzMDEwNTdkNWQ0OWIwRDBjN2EwRTU5NkEyNDkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTgzNTI1OTY2MDMsIm5hbWUiOiJjaGFpbmxvb2stYmV0YSJ9.I2VbgwchzhiJwHQzjXjKa1NSXoAtg5QAwmaTrdPjnIU' });

const adapter = new LokiIndexedAdapter();
let dbReady = false;
const db = new Loki('chainlook.db', {
  adapter,
  autoload: true,
  autosave: true,
  autosaveInterval: 1000,
  autoloadCallback: (err) => {
    if (!err) {
      dbReady = true;
    }
  },
});

async function getJsonFromIPFS(cid) {
  const response = await axios({
    method: 'get',
    baseURL: 'https://ipfs.io/ipfs/',
    url: cid,
  });

  return response.data;
}

async function getJsonFromIPNS(path) {
  const response = await axios({
    method: 'get',
    baseURL: 'https://ipfs.io/ipns/',
    url: path,
  });

  return response.data;
}

export async function getDashboard(protocol, id) {
  // Easier for local dev
  if (id === 'sample') {
    return sampleDashboard;
  }

  if (id === 'ipfssample') {
    return ipfsSampleDashboard;
  }

  if (protocol === 'ipfs') {
    return getJsonFromIPFS(id);
  }

  if (protocol === 'ipns') {
    return getJsonFromIPNS(id);
  }

  // Raw ID assumed to be IPFS CID for the time being
  return getJsonFromIPFS(id);
}

export async function getWidget(widgetId) {
  return getJsonFromIPFS(widgetId);
}

export async function getGraphData({
  subGraphId, entity, fields, filters, group,
}) {
  const fieldsObject = {};
  fields.forEach((field) => set(fieldsObject, field, true));

  // Replace variables with actual values
  const updatedFilters = { ...filters };
  Object.keys(updatedFilters?.where || {}).forEach((whereKey) => {
    const whereValue = updatedFilters.where[whereKey];

    if (typeof whereValue === 'string' && whereValue.startsWith('$')) {
      updatedFilters.where[whereKey] = variables[whereValue]();
    }
  });

  const queryObj = {
    query: {
      [entity]: {
        __args: updatedFilters,
        ...fieldsObject,
      },
    },
  };

  const query = jsonToGraphQLQuery(queryObj, { pretty: true });

  // console.log(query);

  let url = `${GRAPH_API_URL}/subgraphs/id/${subGraphId}`;

  // Hit the hosted service if the subGraphId is in user/subgraph format
  // TODO: improve this logic
  if (subGraphId.includes('/')) {
    url = `${GRAPH_HOSTED_SERVICE_URL}/${subGraphId}`;
  }

  const { data: response } = await axios({
    url,
    method: 'POST',
    data: {
      query,
    },
  });

  let result = response.data?.[entity];

  if (!result) {
    return null;
  }

  if (group && group.key && result.length) {
    const uniqueMap = {};

    result.forEach((item) => {
      const uniqueKey = get(item, group.key);
      if (!uniqueMap[uniqueKey]) {
        uniqueMap[uniqueKey] = [];
      }
      uniqueMap[uniqueKey].push(item);
    });

    result = Object.entries(uniqueMap).reduce((acc, [, items]) => {
      const aggregated = { ...items[0] }; // Start with first item and update all values

      // No need to aggregate if len = 1
      if (items.length > 1) {
        Object.keys(group.aggregations).forEach((fieldToAggregate) => {
          const aggregationFunction = aggregations[group.aggregations[fieldToAggregate]];
          const aggregatedValue = aggregationFunction(items, fieldToAggregate);
          set(aggregated, fieldToAggregate, aggregatedValue);
        });
      }

      acc.push(aggregated);

      return acc;
    }, []);
  }

  return result;
}

export function getDataFieldsForWidget(widget) {
  let fields = [];

  if (!widget?.type) {
    return fields;
  }

  if (widget.type === 'chart') {
    fields = [
      widget.chart.xAxis?.dataKey,
      ...(widget.chart.lines || []).map((d) => d.dataKey),
      ...(widget.chart.bars || []).map((d) => d.dataKey),
      ...(widget.chart.areas || []).map((d) => d.dataKey),
    ].filter(Boolean);
  }

  if (widget.type === 'pieChart') {
    fields = [widget.pieChart.dataKey, widget.pieChart.nameKey];
  }

  if (widget.type === 'table') {
    fields = widget.table.columns.map((d) => d.dataKey);
  }

  if (widget.type === 'metric') {
    fields = [widget.metric.dataKey];
  }

  return fields;
}

async function getWidgetDataFromGraph(widget) {
  let data = [];
  const fields = getDataFieldsForWidget(widget);

  if (!fields.length) {
    throw new Error(`Invalid widget type ${widget.type} or no fields to fetch`);
  }

  data = await getGraphData({
    subGraphId: widget.data.subGraphId,
    entity: widget.data.entity,
    fields,
    filters: widget.data.filters,
    group: widget.data.group,
  });

  return data;
}

async function getWidgetDataFromTableLand(widget) {
  const fields = getDataFieldsForWidget(widget);

  if (!fields.length) {
    throw new Error(`Invalid widget type ${widget.type} or no fields to fetch`);
  }

  const tableland = await connect({ network: widget.data.network });
  const { filters = {} } = widget.data;

  let whereQuery = Object.entries(filters?.where || {})
    .map(([key, value]) => `${key} = ${value}`)
    .join(' AND ');

  if (whereQuery) {
    whereQuery = ` WHERE ${whereQuery}`;
  } else {
    whereQuery = '';
  }

  let filtersQuery = '';
  if (filters.orderBy) {
    filtersQuery += `ORDER BY ${filters.orderBy}`;

    if (filters.orderDirection) {
      filtersQuery += ` ${filters.orderDirection}`;
    }
  }

  if (filters.limit) {
    filtersQuery += ` LIMIT ${filters.limit}`;
  }

  if (filters.first) {
    filtersQuery += ` OFFSET ${filters.first}`;
  }

  const query = `SELECT ${fields.join(', ')} FROM ${widget.data.tableName} ${whereQuery} ${filtersQuery};`;

  const result = await tableland.read(query);

  return Object.values(result);
}

export async function getWidgetData(widget) {
  if (widget.data.source === 'ipfs') {
    return getJsonFromIPFS(widget.data.cid);
  }

  if (widget.data.source === 'graph') {
    return getWidgetDataFromGraph(widget);
  }

  if (widget.data.source === 'tableland') {
    return getWidgetDataFromTableLand(widget);
  }

  return [];
}

export async function publishToIPFS(jsonData) {
  // const rootCid = await web3Storage.put([{
  //   name: ['ChainLook: ', jsonData.type, jsonData.title].filter(Boolean).join(' '),
  //   stream: () => new ReadableStream({
  //     start(controller) {
  //       controller.enqueue(JSON.stringify(jsonData, null, 2));
  //       controller.close();
  //     },
  //   }),
  // }]);

  // const res = await web3Storage.get(rootCid);
  // const files = await res.files();

  // return files[0]?.cid;
}

async function getLocalDbCollection(collectionName) {
  if (!dbReady) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (dbReady) {
          resolve();
          clearInterval(interval);
        }
      });
    });
  }

  let collection = db.getCollection(collectionName);

  if (collection === null) {
    db.addCollection(collectionName);
    collection = db.getCollection(collectionName);
  }

  return collection;
}

export async function saveWidgetLocally(widgetConfig) {
  const widgetsDb = await getLocalDbCollection('widgets');

  // Remove existing one - TODO: improve the logic
  widgetsDb.findAndRemove({ title: widgetConfig.title, type: widgetConfig.type });

  widgetsDb.insert({ ...widgetConfig, createdAt: new Date().getTime() });
}

export async function getAllWidgets() {
  const widgetsDb = await getLocalDbCollection('widgets');

  return widgetsDb.find({}).map((w) => ({
    ...w,
    createdAt: undefined,
    $loki: undefined,
    meta: undefined,
  }));
}

export async function removeLocalDashboards() {
  const dashboardDb = await getLocalDbCollection('dashboard');

  dashboardDb.findAndRemove({}); // clear everything - using as singleton
}

export async function saveDashboardLocally(dashboardConfig) {
  await removeLocalDashboards(); // clear everything - using as singleton

  const dashboardDb = await getLocalDbCollection('dashboard');
  dashboardDb.insert({ ...dashboardConfig, createdAt: new Date().getTime() });
}

export async function getLocalDashboard() {
  const dashboardDb = await getLocalDbCollection('dashboard');
  const firstItem = dashboardDb.find({})?.map((w) => ({
    ...w,
    createdAt: undefined,
    $loki: undefined,
    meta: undefined,
  }))?.[0];

  if (!firstItem) {
    return null;
  }

  return firstItem;
}
