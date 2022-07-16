import React from 'react';
import { getWidget, getWidgetData } from '../data-service';
import usePromise from '../hooks/use-promise';
import Chart from './chart';
import Table from './table';
import Metric from './metric';

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

  if (!widgetData) {
    return null;
  }

  if (errorData || errorWidget) {
    return <div>Error</div>;
  }

  if (isFetchingWidget || isFetchingData) {
    return <div>Loading</div>;
  }

  function renderWidget() {
  if (widget.type === 'chart') {
      return (
        <Chart
          data={widgetData}
          config={widget.chart}
        />
      );
    }

    if (widget.type === 'table') {
      return (
        <Table
          data={widgetData}
          config={widget.table}
        />
      );
    }

    if (widget.type === 'metric') {
      return (
        <Metric
          data={widgetData}
          config={widget.metric}
        />
      );
    }
  }


  return (
    <div className={`widget widget-${widget.type}`}>
      <h4 className='widget-title'>
        {widget.title}
      </h4>

      <div className='widget-body'>
        {renderWidget()}
      </div>
    </div>
  );

}

export default React.memo(Widget);
