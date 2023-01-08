import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getWidget, fetchDataForWidget } from '../data/api';
import { saveWidgetLocally } from '../data/store';
import usePromise from '../hooks/use-promise';
import Chart from './chart';
import Table from './table';
import Text from './text';
import Metric from './metric';
import PieChart from './pie-chart';

function Widget(props) {
  const { id, config: defaultConfig, enableFork } = props;

  const navigate = useNavigate();

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

        const widgetData = widgetConfig.data ? await fetchDataForWidget(widgetConfig) : null;

        return { widgetConfig, widgetData };
      },
      {
        dependencies: [id, defaultConfig],
        conditions: [id || defaultConfig],
      // cacheKey: JSON.stringify(config.data),
      },
    );

    const onForkClick = React.useCallback(async () => {
      await saveWidgetLocally(config);
      navigate('/widget/new'); // TODO: a hack for now - new widget page will load the most recent local widget
    }, [config]);

    if (errorData) {
      throw errorData;
    }

    if (isFetchingData) {
      return <div className="widget p-4">Loading</div>;
    }

    if (config?.data && !data) {
      return <div className="widget p-4">No data</div>;
    }

    // eslint-disable-next-line no-inner-declarations
    function renderWidget() {
      if (config.type === 'text') {
        return (
          <Text
            config={config.text}
          />
        );
      }

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

    if (!config) {
      return null;
    }

    return (
      <div className={`widget widget-${config.type}`}>
        <h4 className="widget-title">
          {config.title}

          {enableFork && (
            <div role="button" tabIndex={0} className="icon-button" onClick={onForkClick} title="Copy this widget locally and edit">
              <i className="icon-clone" />
            </div>
          )}
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
      <div className="widget">
        <h4 className="widget-title">
          {defaultConfig?.title ?? id}
        </h4>
        <div className="widget-body p-4">
          <div>Error rendering Widget</div>
          {error.message}
        </div>
      </div>
    );
  }
}

export default Widget;
