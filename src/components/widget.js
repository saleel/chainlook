import React from 'react';
import { getGraphData, getWidget } from '../data-service';
import usePromise from '../hooks/use-promise';
import Chart from './chart';

function Widget(props) {
  const { id } = props;

  const [widget, { isFetching: isFetchingWidget, error: errorWidget }] = usePromise(() => getWidget(id), {
    dependencies: [id],
    conditions: [id],
  });

  const [widgetData, { isFetching: isFetchingData, error: errorData }] = usePromise(() => getGraphData({
    subGraphId: widget.data.subGraphId,
    entity: widget.data.entity,
    fields: ['id', 'date', 'dailyVolumeETH'],
    filters: widget.filters,
  }), {
    dependencies: [widget],
    conditions: [widget],
  });

  console.log({ widget, widgetData, isFetchingWidget, isFetchingData })

  if (!widgetData) {
    return null;
  }

  if (errorData || errorWidget) {
    return <div>"error"</div>;
  }

  if (isFetchingWidget || isFetchingData) {
    return <div>Loading</div>;
  }

  return (
    <div className="widget widget-chart">
      <Chart
        data={widgetData}
        xAxisKey={widget.config.xAxisKey}
        yAxisKeys={widget.config.yAxisKeys}
        xAxisFormatter={(d) => new Date(d * 1000)}
        yAxisFormatter={(d) => Number(d).toFixed(1)}
      />
    </div>
  );
}

export default React.memo(Widget);
