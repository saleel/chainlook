import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WidgetView from '../components/widget-view';
import { getWidget } from '../data/api';
import { saveWidgetLocally } from '../data/store';
import usePromise from '../hooks/use-promise';

function WidgetPage() {
  const navigate = useNavigate();
  const { widgetId } = useParams();

  const [widget, { isFetching, error }] = usePromise(() => getWidget(widgetId), {
    dependencies: [widgetId],
    conditions: [widgetId],
  });

  React.useEffect(() => {
    if (widget) {
      document.title = `${widget.title} - ChainLook`;
    }
  }, [widget]);

  const onForkClick = React.useCallback(async () => {
    await saveWidgetLocally(widget);
    navigate('/widget/new'); // TODO: a hack for now - new widget page will load the most recent local widget
  }, [widget]);

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

      <WidgetView definition={widget.definition} title="hello" />

    </div>
  );
}

export default WidgetPage;
