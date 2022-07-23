import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Widget from '../components/widget';
import { getWidget, saveWidgetLocally } from '../data-service';
import usePromise from '../hooks/use-promise';

function WidgetPage() {
  const navigate = useNavigate();
  const { widgetId } = useParams();

  const [widgetConfig, { isFetching, error }] = usePromise(() => getWidget(widgetId), {
    dependencies: [widgetId],
    conditions: [widgetId],
  });

  const onForkClick = React.useCallback(async () => {
    await saveWidgetLocally(widgetConfig);
    navigate('/widget/new'); // TODO: a hack for now - new widget page will load the most recent local widget
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
          <a className="link view-source mr-2 pt-1" href={`https://ipfs.io/ipfs/${widgetId}`} target="_blank" rel="noreferrer" title="View source">
            <i className="icon-code" />
          </a>

          <div role="button" tabIndex={0} className="icon-button pt-1" onClick={onForkClick} title="Copy this dashbord locally and edit">
            <i className="icon-clone" />
          </div>
        </div>
      </div>

      <Widget config={widgetConfig} />

      {widgetConfig && (
        <div className="mt-4 link delay">
          <Link to={`/widget/new?fromId=${widgetId}`}>
            Create a new Widget by editing this
          </Link>
        </div>
      )}

    </div>
  );
}

export default WidgetPage;
