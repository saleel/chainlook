import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WidgetView from '../components/widget-view';
import { getWidget } from '../data/api';
import { saveWidgetLocally } from '../data/store';
import usePromise from '../hooks/use-promise';

function WidgetPage() {
  const navigate = useNavigate();
  const { widgetId } = useParams();

  const [widget, { isFetching, error }] = usePromise(() => getWidget(widgetId as string), {
    dependencies: [widgetId],
    conditions: [widgetId],
  });

  React.useEffect(() => {
    if (widget) {
      document.title = `${widget.title} - ChainLook`;
    }
  }, [widget]);

  const onForkClick = React.useCallback(async () => {
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
        <div className="flex-row">
          <div role="button" tabIndex={0} className="icon-button pt-1" onClick={onForkClick} title="Make a copy of this widget and edit">
            <i className="icon-clone" />
          </div>
        </div>
      </div>

      <WidgetView widget={widget} />

      <a className="link view-source mr-2 pt-1" title="View source">
            View Source
          </a>

    </div>
  );
}

export default WidgetPage;
