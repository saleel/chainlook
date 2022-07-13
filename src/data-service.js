import axios from 'axios'


export function getDashboard(dashboardId) {
  return {
    title: 'Uniswap V2',
    rows: [
      {
        elements: [{
          type: 'widget',
          widgetId: 'chart',
          width: 6,
        }, {
          type: 'widget',
          widgetId: 'table',
          width: 6,
        }],
      }, {
        elements: [{
          type: 'text',
          text: 'Hello',
          width: 3,
        }],
      },
    ],
  }
}

export function getWidget(widgetId) {
  if (widgetId === 'chart') {
    return {
      title: 'Last 10 days liquidity',
      type: 'line-chart',
      chart: {
        xAxis: {
          key: "date",
          transform: "unixDate"
        },
        yAxis: {
          transform: "roundedNumber"
        },
        dataKeys: {
          dailyVolumeETH: {
            label: "Daily Volume",
            transform: "unixDate",
          }
        }
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

  if (widgetId === 'table') {
    return {
      title: 'Last 10 days liquidity',
      type: 'table',
      table: {
        columns: {
          date: {
            label: 'Date',
            transform: 'unixDate'
          },
          dailyVolumeETH: {
            label: 'Daily Volume',
            transform: 'roundedNumber'
          }
        }
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

export async function getWidgetData(widget) {
  let data = [];

  if (widget.data.source === 'the-graph') {
    let fields = [];
    if (widget.type === 'line-chart') {
      fields = [widget.chart.xAxis?.key, ...Object.keys(widget.chart.dataKeys)];
    }

    if (widget.type === 'table') {
      fields = [...Object.keys(widget.table.columns)];
    }

    if (!fields.length) {
      throw new Error("Invalid widget type or no fields to fetch");
    }

    data = await getGraphData({
      subGraphId: widget.data.subGraphId,
      entity: widget.data.entity,
      fields: fields,
      filters: widget.data.filters,
    });
  }

  return data;
}
