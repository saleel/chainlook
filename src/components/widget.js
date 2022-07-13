import React from 'react';
import { getGraphData, getWidget, getWidgetData } from '../data-service';
import usePromise from '../hooks/use-promise';
import Chart from './chart';
import Table from './table';

function Widget(props) {
  const { id } = props;

  const [widget, { isFetching: isFetchingWidget, error: errorWidget }] = usePromise(() => getWidget(id), {
    dependencies: [id],
    conditions: [id],
  });

  const [widgetData, { isFetching: isFetchingData, error: errorData }] = usePromise(() => getWidgetData(widget), {
    dependencies: [widget],
    conditions: [widget],
  });

  // console.log({ widget, widgetData, isFetchingWidget, isFetchingData })

  if (!widgetData) {
    return null;
  }

  if (errorData || errorWidget) {
    return <div>Error</div>;
  }

  if (isFetchingWidget || isFetchingData) {
    return <div>Loading</div>;
  }

  if (widget.type === 'line-chart') {
    return (
      <div className="widget widget-chart">
        <Chart
          data={widgetData}
          config={widget.chart}
        />
      </div>
    );
  }

  if (widget.type === 'table') {
    return (
      <div className="widget widget-table">
        <Table
          data={widgetData}
          config={widget.table}
        />
      </div>
    );
  }
 
}

export default React.memo(Widget);
