/* eslint-disable react/no-array-index-key */
import React from 'react';
import { useParams } from 'react-router-dom';
import Widget from '../components/widget';
import Text from '../components/text';
import { getDashboard } from '../data-service';
import usePromise from '../hooks/use-promise';

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
      <h2 className="dashboard-title">
        This is dashboard page
        {' '}
        {dashboard.title}
      </h2>

      {dashboard.rows.map((row, rowIndex) => (
        <div key={rowIndex} className="columns">
          {row.elements.map((element, elIndex) => {
            const widthClass = `is-${element.width}`;

            if (element.type === 'widget') {
              return (
                <div key={`${rowIndex}_${elIndex}`} className={`column ${widthClass}`}>
                  <Widget id={element.widgetId} />
                </div>
              );
            }

            if (element.type === 'text') {
              return (
                <div key={`${rowIndex}_${elIndex}`} className={`column ${widthClass}`}>
                  <Text config={element.text} />
                </div>
              );
            }

            return null;
          })}
        </div>
      ))}

    </div>
  );
}

export default Dashboard;
