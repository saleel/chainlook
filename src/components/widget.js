import React from 'react';
import { getWidget, getWidgetData } from '../data-service';
import usePromise from '../hooks/use-promise';
import Chart from './chart';
import Table from './table';
import Metric from './metric';
import PieChart from './pie-chart';

function Widget(props) {
  const { id, config: defaultConfig } = props;

  try {
    const [
      { widgetConfig: config, widgetData: data } = {},
      { isFetching: isFetchingData, error: errorData },
    ] = usePromise(
      async () => {
        let widgetConfig = defaultConfig;

        if (!widgetConfig) {
          widgetConfig = await getWidget(id);
        }

        const widgetData = await getWidgetData(widgetConfig);

        return { widgetConfig, widgetData };
      },
      {
        dependencies: [id, defaultConfig],
        conditions: [id || defaultConfig],
      // cacheKey: JSON.stringify(config.data),
      },
    );

    if (errorData) {
      throw errorData;
    }

    if (isFetchingData) {
      return <div>Loading</div>;
    }

    if (!data) {
      return <div>No data</div>;
    }

    // eslint-disable-next-line no-inner-declarations
    function renderWidget() {
      if (config.type === 'chart') {
        return (
          <Chart
            data={data}
            config={config.chart}
          />
        );
      }

      if (config.type === 'pieChart') {
        return (
          <PieChart
            data={data}
            config={config.pieChart}
          />
        );
      }

      if (config.type === 'table') {
        return (
          <Table
            data={data}
            config={config.table}
          />
        );
      }

      if (config.type === 'metric') {
        return (
          <Metric
            data={data}
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
    // eslint-disable-next-line no-console
    console.error(error);

    return (
      <div className="widget widget-error">
        <h4 className="widget-title">
          {defaultConfig?.title ?? id}
        </h4>
        <div className="widget-body">
          <div>Error rendering Widget</div>
          {error.message}
        </div>
      </div>
    );
  }
}

export default Widget;
