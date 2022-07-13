import axios from 'axios'


export function getDashboard(dashboardId) {
  return {
    title: 'Uniswap V2',
    elements: [{
      type: 'widget',
      widgetId: 'chart',
      width: 6,
      row: 1,
    }, {
      type: 'widget',
      widgetId: 'table',
      width: 6,
      row: 1,
    },
    {
      type: 'text',
      text: 'Hello',
      width: 3,
      row: 2,
    }]
  }
}

export function getWidget(widgetId) {
  if (widgetId === 'chart') {
    return {
      title: 'Last 10 days liquidity',
      type: 'line-chart',
      config: {
        xAxisKey: "date",
        yAxisKeys: ['dailyVolumeETH']
      },
      data: {
        source: 'the-graph',
        subGraphId: 'uniswap/uniswap-v2',
        entity: 'uniswapDayDatas',
        filters: {
          orderDirection: 'desc', orderBy: 'date', skip: 1, first: 20,
        },
      }
    }
  }
}

export async function getGraphData({
  subGraphId, entity, fields, filters,
}) {
  let filtersQuery = '';
  if (filters) {
    filtersQuery = Object.keys(filters).map((k) => `${k}: ${filters[k]}`).join(', ');
    filtersQuery = `(${filtersQuery})`;
  }

  const query = `
    {
      ${entity} ${filtersQuery} {
        ${fields.join('\n')}
      }
    }
  `;

  // console.log({ query });

  const { data: response } = await axios({
    url: `https://api.thegraph.com/subgraphs/name/${subGraphId}`,
    method: 'POST',
    data: {
      query,
    },
  });

  return response.data?.[entity];
}