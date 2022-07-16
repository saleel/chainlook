import axios from 'axios';

export function getDashboard(dashboardId) {
  return {
    title: 'Uniswap V2',
    rows: [
      {
        elements: [{
          type: 'text',
          text: {
            title: 'Hello',
            message: 'This is an awesome dashboard',
          },
          width: 4,
        }, {
          type: 'widget',
          widgetId: 'metric1',
          width: 4,
        }, {
          type: 'widget',
          widgetId: 'metric2',
          width: 4,
        }],
      },
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
      },
      {
        elements: [{
          type: 'widget',
          widgetId: 'pieChart',
          width: 6,
        }],
      },
    ],
  };
}

export function getWidget(widgetId) {
  if (widgetId === 'chart') {
    return {
      title: 'Last 10 days liquidity',
      type: 'chart',
      chart: {
        xAxis: {
          key: 'date',
          transform: 'unixDate',
        },
        yAxis: {
          transform: 'roundedNumber',
        },
        lines: {
          dailyVolumeETH: {
            label: 'Daily Volume',
            transform: 'roundedNumber',
          },
          totalVolumeETH: {
            label: 'Daily Volume',
            transform: 'roundedNumber',
          },
        },
      },
      data: {
        source: 'the-graph',
        subGraphId: 'uniswap/uniswap-v2',
        entity: 'uniswapDayDatas',
        filters: {
          orderDirection: 'desc', orderBy: 'date', skip: 1, first: 20,
        },
      },
    };
  }

  if (widgetId === 'pieChart') {
    return {
      title: 'Last 10 days liquidity',
      type: 'pieChart',
      pieChart: {
        dataKey: 'dailyVolumeETH',
        nameKey: 'date',
      },
      data: {
        source: 'the-graph',
        subGraphId: 'uniswap/uniswap-v2',
        entity: 'uniswapDayDatas',
        filters: {
          orderDirection: 'desc', orderBy: 'date', skip: 1, first: 4,
        },
      },
    };
  }

  if (widgetId === 'table') {
    return {
      title: 'Last 10 days liquidity',
      type: 'table',
      table: {
        columns: {
          date: {
            label: 'Date',
            transform: 'unixDate',
          },
          dailyVolumeETH: {
            label: 'Daily Volume',
            transform: 'roundedNumber',
          },
        },
      },
      data: {
        source: 'the-graph',
        subGraphId: 'uniswap/uniswap-v2',
        entity: 'uniswapDayDatas',
        filters: {
          orderDirection: 'desc', orderBy: 'date', skip: 1, first: 20,
        },
      },
    };
  }

  if (widgetId === 'metric1') {
    return {
      title: 'ETH Daily Volume',
      type: 'metric',
      metric: {
        key: 'dailyVolumeETH',
        unit: 'USD',
        transform: 'roundedNumber',
      },
      data: {
        source: 'the-graph',
        subGraphId: 'uniswap/uniswap-v2',
        entity: 'uniswapDayDatas',
        filters: {
          orderDirection: 'desc', orderBy: 'date', first: 1,
        },
      },
    };
  }

  if (widgetId === 'metric2') {
    return {
      title: 'USD Daily Volume',
      type: 'metric',
      metric: {
        key: 'dailyVolumeUSD',
        unit: 'USD',
        transform: 'roundedNumber',
      },
      data: {
        source: 'the-graph',
        subGraphId: 'uniswap/uniswap-v2',
        entity: 'uniswapDayDatas',
        filters: {
          orderDirection: 'desc', orderBy: 'date', first: 1,
        },
      },
    };
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
    if (widget.type === 'chart') {
      fields = [
        widget.chart.xAxis?.key,
        ...Object.keys(widget.chart.lines || {}),
        ...Object.keys(widget.chart.bars || {}),
        ...Object.keys(widget.chart.areas || {}),
      ];
    }

    if (widget.type === 'pieChart') {
      fields = [widget.pieChart.dataKey, widget.pieChart.nameKey];
    }

    if (widget.type === 'table') {
      fields = [...Object.keys(widget.table.columns)];
    }

    if (widget.type === 'metric') {
      fields = [widget.metric.key];
    }

    if (!fields.length) {
      throw new Error(`Invalid widget type ${widget.type} or no fields to fetch`);
    }

    data = await getGraphData({
      subGraphId: widget.data.subGraphId,
      entity: widget.data.entity,
      fields,
      filters: widget.data.filters,
    });
  }

  return data;
}
