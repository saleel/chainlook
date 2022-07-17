import React from 'react';
import { getDataFieldsForWidget, getWidget, getWidgetData } from '../data-service';
import usePromise from '../hooks/use-promise';
import Chart from './chart';
import Table from './table';
import Metric from './metric';
import PieChart from './pie-chart';

function Widget(props) {
  try {
    const { config } = props;

    let cacheKey = `${config.data.subGraphId}_${config.data.entity}_`;
    cacheKey += getDataFieldsForWidget(config).join('_');
    cacheKey += Object.entries(config.data.filters).join('_');

    console.log(cacheKey, config);

    const [widgetData, { isFetching: isFetchingData, error: errorData }] = usePromise(() => getWidgetData(config), {
      dependencies: [config.data],
      conditions: [config.type],
      cacheKey,
    });

    if (!widgetData) {
      return null;
    }

    if (errorData) {
      throw errorData;
    }

    if (isFetchingData) {
      return <div>Loading</div>;
    }

    function renderWidget() {
      if (config.type === 'chart') {
        return (
          <Chart
            data={widgetData}
            config={config.chart}
          />
        );
      }

      if (config.type === 'pieChart') {
        return (
          <PieChart
            data={widgetData}
            config={config.pieChart}
          />
        );
      }

      if (config.type === 'table') {
        return (
          <Table
            data={widgetData}
            config={config.table}
          />
        );
      }

      if (config.type === 'metric') {
        return (
          <Metric
            data={widgetData}
            config={config.metric}
          />
        );
      }

      return null;
    }

    return (
      <div className={`widget widget-${config.type}`}>
        <h4 className="widget-title">
          {config.title}
        </h4>

        <div className="widget-body">
          {renderWidget()}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="widget-error">
        {error.message}
      </div>
    );
  }
}

export default Widget;
