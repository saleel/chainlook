import API from '../data/api';
import Store from '../data/store';
import usePromise from '../hooks/use-promise';
import Chart from './widgets/chart';
import Table from './widgets/table';
import Metric from './widgets/metric';
import PieChart from './widgets/pie-chart';
import Widget from '../domain/widget';
import { Link, useNavigate } from 'react-router-dom';
import { IoPersonOutline, IoOpenOutline, IoGitNetworkOutline, IoRefresh } from 'react-icons/io5';
import React from 'react';

function WidgetView(props: { widget: Widget; showActions?: boolean }) {
  const { widget, showActions = true } = props;

  const navigate = useNavigate();

  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = React.useState(false);

  const [data, { isFetching, error, reFetch }] = usePromise(() => API.fetchDataForWidget(widget.definition, {}), {
    dependencies: [widget.definition],
    conditions: [widget && widget.definition],
  });

  React.useEffect(() => {
    let interval: NodeJS.Timer;

    if (isAutoRefreshEnabled) {
      interval = setInterval(() => {
        reFetch();
      }, 10000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isAutoRefreshEnabled]);

  if (isFetching && !isAutoRefreshEnabled) {
    return <div className='widget p-4'>Loading</div>;
  }

  if (error) {
    return <div className='widget p-4'>Error while fetching data: {error.message}</div>;
  }

  if (widget?.definition?.data && !data) {
    return <div className='widget p-4'>No data</div>;
  }

  function onForkClick() {
    if (Store.getWidgetDraft()) {
      if (
        !confirm(
          'You already have an unsaved widget that is being edited. Forking this will discard your changes. Would you like to continue?',
        )
      ) {
        return;
      }
    }

    Store.saveWidgetDraft({
      ...widget,
      forkId: widget.id,
      forkVersion: widget.version,
      id: '',
      user: { id: '', address: '' },
    });

    navigate('/widgets/new');
  }

  const { definition } = widget || {};

  // eslint-disable-next-line no-inner-declarations
  function renderWidget() {
    try {
      if (error) throw error;

      if (definition.type === 'chart') {
        return <Chart data={data} config={definition.chart} />;
      }

      if (definition.type === 'pieChart') {
        return <PieChart data={data} config={definition.pieChart} />;
      }

      if (definition.type === 'table') {
        return <Table data={data} config={definition.table} />;
      }

      if (definition.type === 'metric') {
        return <Metric data={data} config={definition.metric} />;
      }

      return null;
    } catch {
      return (
        <>
          <div>Error rendering Widget</div>
          {error.message}
        </>
      );
    }
  }

  if (!definition) {
    return null;
  }

  const author = widget?.user?.username || '';
  const isWidgetPage = window.location.toString().includes(widget.id);

  return (
    <div className={`widget widget-${definition.type}`}>
      <div className='widget-header'>
        <div className='is-flex'>
          <h4 className='widget-title'>
            <span>{widget?.title || 'Untitled'}</span>
          </h4>

          {showActions && !isWidgetPage && widget?.id && (
            <Link
              to={`/widgets/${widget?.id}`}
              target='_blank'
              className='ml-3 widget-action-item'
              data-tooltip='Open the widget in a new page'
            >
              <IoOpenOutline size={18} />
            </Link>
          )}
        </div>

        {showActions && (
          <div className='is-flex pl-1'>
            <button
              type='button'
              onClick={onForkClick}
              data-tooltip={`Fork - Make a copy of this widget and customize it`}
              className='ml-4 icon-button widget-action-item'
            >
              <IoGitNetworkOutline size={17} />
            </button>

            {author && (
              <div data-tooltip={`Created by ${author}`} className='ml-4 widget-action-item'>
                <IoPersonOutline size={18} />
              </div>
            )}

            <button
              type='button'
              onClick={() => setIsAutoRefreshEnabled((e) => !e)}
              data-tooltip={`Auto refresh this widget every 10 seconds`}
              className='ml-4 icon-button widget-action-item'
              style={{ width: '15px' }}
            >
              {isAutoRefreshEnabled ? <div className='blink-dot mb-1'></div> : <IoRefresh size={17} />}
            </button>
          </div>
        )}
      </div>

      <div className='widget-body'>{renderWidget()}</div>
    </div>
  );
}

export default WidgetView;
