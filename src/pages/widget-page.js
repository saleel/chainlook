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

  if (isFetching) {
    return (<div>Loading</div>);
  }

  if (error) {
    return (<div>{error.message}</div>);
  }

  return (
    <div className="page widget-page">

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
