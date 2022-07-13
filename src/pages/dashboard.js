import React from "react";
import { useParams } from "react-router-dom";
import Widget from "../components/widget";
import { getDashboard } from "../data-service";
import usePromise from "../hooks/use-promise";

function Dashboard() {
  const { dashboardId } = useParams();

  const [dashboard, { isFetching, error }] = usePromise(() => getDashboard(dashboardId), {
    dependencies: [dashboardId],
    conditions: [dashboardId],
  });

  if (isFetching) {
    return (<div>Loading</div>);
  }

  if (error) {
    return (<div>{error.message}</div>);
  }

  return (
    <div className="page dashboard-page">
      <h2>
        This is dashboard page {dashboard.title}
      </h2>

      {dashboard.rows.map(row => (
        <div className="columns">
          {row.elements.map(element => {
            const widthClass = `is-${element.width}`

            if (element.type === 'widget') {
              return (
                <div key={element.id} className={`column ${widthClass}`}>
                  <Widget id={element.widgetId} />
                </div>
              );
            }
          })}
        </div>
      ))}

    </div>
  )
}

export default Dashboard;
