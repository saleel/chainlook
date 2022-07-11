import React from 'react';
import { getGraphData } from '../data-service';
import usePromise from '../hooks/use-promise';
import Chart from './chart';

function Widget() {
  const [result, { isFetching, error }] = usePromise(() => getGraphData({
    subGraphId: 'uniswap/uniswap-v2',
    entity: 'uniswapDayDatas',
    fields: ['id', 'date', 'dailyVolumeETH'],
    filters: {
      orderDirection: 'desc', orderBy: 'date', skip: 1, first: 20,
    },
  }), {
    dependencies: [],
    conditions: [],
  });

  console.log({ result, isFetching })

  if (!result) {
    return null;
  }

  if (error) {
    return "error";
  }

  if (isFetching) {
    return "Loading";
  }

  return (
    <div className="widget widget-chart">
      <Chart
        data={result}
        xAxisKey="date"
        yAxisKeys={['dailyVolumeETH']}
        xAxisFormatter={(d) => new Date(d * 1000)}
        yAxisFormatter={(d) => Number(d).toFixed(1)}
      />
    </div>
  );
}

export default React.memo(Widget);
