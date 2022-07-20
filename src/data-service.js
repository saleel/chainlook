import axios from 'axios';
import { Web3Storage } from 'web3.storage';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import get from 'lodash/get';
import set from 'lodash/set';
import aggregations from './helpers/aggregations';
import sampleDashboard from './examples/dashboard.json';

const web3Storage = new Web3Storage({ token: process.env.REACT_APP_WEB3_STORAGE_API_KEY });

export function getDashboard(dashboardId) {
  if (dashboardId === 'sample') {
    return sampleDashboard;
  }
}

export function getWidget(widgetId) {
  const response = axios({
    method: 'get',
    baseURL: 'https://ipfs.io/ipfs/',
    url: widgetId,
  });

  console.log(response);

  return JSON.parse(response.data);
}

export async function getGraphData({
  subGraphId, entity, fields, filters, group,
}) {
  const fieldsObject = {};
  fields.forEach((field) => set(fieldsObject, field, true));

  const queryObj = {
    query: {
      [entity]: {
        __args: filters,
        ...fieldsObject,
      },
    },
  };

  const query = jsonToGraphQLQuery(queryObj, { pretty: true });

  // console.log(query);

  const { data: response } = await axios({
    url: `https://api.thegraph.com/subgraphs/name/${subGraphId}`,
    method: 'POST',
    data: {
      query,
    },
  });

  let result = response.data?.[entity];

  if (group && group.key) {
    const uniqueMap = {};

    result.forEach((item) => {
      const uniqueKey = get(item, group.key);
      if (!uniqueMap[uniqueKey]) {
        uniqueMap[uniqueKey] = [];
      }
      uniqueMap[uniqueKey].push(item);
    });

    result = Object.entries(uniqueMap).reduce((acc, [_, items]) => {
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

export async function getWidgetData(widget) {
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

export async function publishWidgetToIPFS(widgetConfig) {
  const rootCid = await web3Storage.put([{
    name: `ChainLook: ${widgetConfig.type} - ${widgetConfig.title}`,
    stream: () => new ReadableStream({
      start(controller) {
        controller.enqueue(JSON.stringify(widgetConfig, null, 2));
        controller.close();
      },
    }),
  }]);

  const res = await web3Storage.get(rootCid);
  const files = await res.files();

  return files[0]?.cid;
}

export async function saveWidgetLocally() {
  alert();
}
