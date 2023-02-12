import React from "react";
import { Link, useParams } from "react-router-dom";
import WidgetView from "../components/widget-view";
import { AuthContext } from "../context/auth-context";
import API from "../data/api";
import usePromise from "../hooks/use-promise";

function WidgetPage() {
  const { widgetId } = useParams();

  const { user } = React.useContext(AuthContext);

  const [widget, { isFetching, error }] = usePromise(
    () => API.getWidget(widgetId as string),
    {
      dependencies: [widgetId],
      conditions: [widgetId],
    }
  );

  React.useEffect(() => {
    if (widget) {
      document.title = `${widget.title} - ChainLook`;
    }
  }, [widget]);

  const isWidgetOwner = user?.id === widget?.user?.id;

  if (isFetching) {
    return <div>Loading</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div className="page widget-page">
      
      <div className="widget-actions">
        <div className="flex-row">
      
          {/* <button
            role="button"
            tabIndex={0}
            className="button is-small"
            onClick={onForkClick}
            title="Make a copy of this widget and edit"
          >
            Fork
          </button> */}

          {isWidgetOwner && (
            <Link
              className="button is-small"
              to={`/widgets/${widget.id}/edit`}
              title="Edit the widget"
            >
              Edit
            </Link>
          )}

        </div>
      </div>

      <WidgetView widget={widget} />

      {/* <a className="link view-source mr-2 pt-1" title="View source">
        View Source
      </a> */}
    </div>
  );
}

export default WidgetPage;
