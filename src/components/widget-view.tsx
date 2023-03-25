import API from '../data/api';
import Store from '../data/store';
import usePromise from '../hooks/use-promise';
import Chart from './widgets/chart';
import Table from './widgets/table';
import Metric from './widgets/metric';
import PieChart from './widgets/pie-chart';
import Widget from '../domain/widget';
import { Link, useNavigate } from 'react-router-dom';
import { IoOpenOutline, IoRefresh, IoDownloadOutline } from 'react-icons/io5';
import React from 'react';
import html2canvas from 'html2canvas';

function WidgetView(props: { widget: Widget; showActions?: boolean }) {
  const { widget, showActions = true } = props;

  const navigate = useNavigate();

  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = React.useState(false);

  const [data, { isFetching, error, reFetch }] = usePromise(
    () => API.fetchDataForWidget(widget.definition, {}),
    {
      dependencies: [widget.definition],
      conditions: [widget && widget.definition],
    },
  );

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

  function onDownloadClick(e: any) {
    // Save dom element with class widget as an image
    html2canvas(e.target.closest('.widget')!, {}).then((canvas) => {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${widget?.title}.png`;
      a.click();
    });
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
        </div>

        <div className='is-flex pl-1'>
          {showActions && (
            <>
              {!isWidgetPage && widget?.id && (
                <Link
                  to={`/widgets/${widget?.id}`}
                  target='_blank'
                  className='icon-button widget-action-item mr-4'
                  data-tooltip='Open the widget in a new page'
                >
                  <IoOpenOutline size={18} />
                </Link>
              )}

              <button
                type='button'
                onClick={onDownloadClick}
                data-tooltip={`Download this widget as an image`}
                className='mr-4 icon-button widget-action-item'
              >
                <IoDownloadOutline size={18} />
              </button>

              <button
                type='button'
                onClick={() => setIsAutoRefreshEnabled((e) => !e)}
                data-tooltip={`Auto refresh this widget every 10 seconds`}
                className='mr-2 icon-button'
              >
                {isAutoRefreshEnabled ? (
                  <div className='blink-dot mb-1'></div>
                ) : (
                  <IoRefresh className='widget-action-item' size={17} />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className='widget-body'>{renderWidget()}</div>
    </div>
  );
}

export default WidgetView;
