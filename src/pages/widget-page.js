import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Widget from '../components/widget';
import { getWidget } from '../data-service';
import usePromise from '../hooks/use-promise';

function WidgetPage() {
  const { widgetId } = useParams();

  const [widgetConfig, { isFetching, error }] = usePromise(() => getWidget(widgetId), {
    dependencies: [widgetId],
    conditions: [widgetId],
  });

  React.useEffect(() => {
    if (widgetConfig) {
      document.title = `${widgetConfig.title} - ChainLook`;
    }
  }, [widgetConfig]);

  if (isFetching) {
    return (<div>Loading</div>);
  }

  if (error) {
    return (<div>{error.message}</div>);
  }

  return (
    <div className="page widget-page">

      <div className="widget-actions">
        <div />
        <div className="flex-row">
          <a className="link mr-2 pt-1" href={`https://ipfs.io/ipfs/${widgetId}`} target="_blank" rel="noreferrer" title="View source">
            <i className="icon-code" />
          </a>

          <Link className="link icon-button pt-1" to={`/widget/new?fromId=${widgetId}`} title="Copy this dashbord locally and edit">
            <i className="icon-clone" />
          </Link>
        </div>
      </div>

      <Widget config={widgetConfig} />

    </div>
  );
}

export default WidgetPage;
