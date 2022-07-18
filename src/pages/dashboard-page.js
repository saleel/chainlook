/* eslint-disable react/no-array-index-key */
import React from 'react';
import { useParams } from 'react-router-dom';
import Dashboard from '../components/dashboard';
import { getDashboard } from '../data-service';
import usePromise from '../hooks/use-promise';

function DashboardPage() {
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

      <Dashboard config={dashboard} />

    </div>
  );
}

export default DashboardPage;
