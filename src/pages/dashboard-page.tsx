/* eslint-disable react/no-array-index-key */
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardView from '../components/dashboard-view';
import API from '../data/api';
import usePromise from '../hooks/use-promise';

function DashboardPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [dashboard, { isFetching, error }] = usePromise(() => API.getDashboard(id as string), {
    dependencies: [id],
    conditions: [id],
  });

  React.useEffect(() => {
    if (dashboard) {
      document.title = `${dashboard.title} - ChainLook`;
    }
  }, [dashboard]);

  // const onForkClick = React.useCallback(async () => {
  //   // await saveDashboardLocally(dashboard);
  //   navigate('/dashboard/new'); // TODO: a hack for now - new widget page will load the most recent local widget
  // }, [dashboard]);

  if (isFetching) {
    return (<div className="page dashboard-page">Loading</div>);
  }

  if (error) {
    return (<div className="page dashboard-page">{error.message}</div>);
  }

  return (
    <div className="page dashboard-page">

      <div className="dashboard-header">
        <h2 className="dashboard-title">
          {dashboard?.title}
        </h2>
      </div>

      <DashboardView dashboard={dashboard} />

    </div>
  );
}

export default DashboardPage;
