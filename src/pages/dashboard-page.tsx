/* eslint-disable react/no-array-index-key */
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Dashboard from '../components/dashboard';
import API from '../data/api';
import { saveDashboardLocally } from '../data/store';
import usePromise from '../hooks/use-promise';

function DashboardPage() {
  const navigate = useNavigate();
  const { protocol, id } = useParams();

  const [dashboard, { isFetching, error }] = usePromise(() => API.getDashboard(protocol, id), {
    dependencies: [protocol, id],
    conditions: [id],
  });

  React.useEffect(() => {
    if (dashboard) {
      document.title = `${dashboard.title} - ChainLook`;
    }
  }, [dashboard]);

  const onForkClick = React.useCallback(async () => {
    await saveDashboardLocally(dashboard);
    navigate('/dashboard/new'); // TODO: a hack for now - new widget page will load the most recent local widget
  }, [dashboard]);

  if (isFetching) {
    return (<div className="page dashboard-page">Loading</div>);
  }

  if (error) {
    if (error.message.includes('404')) {
      return (
        <div className="page dashboard-page">
          No dashboard found with this CID. If this is a newly created dashboard it would take some time be available on IPFS.
          <br />
          Please reload this page after few seconds.
        </div>
      );
    }

    return (<div className="page dashboard-page">{error.message}</div>);
  }

  return (
    <div className="page dashboard-page">

      <div className="dashboard-actions">
        <h2 className="dashboard-title">
          {dashboard?.title}
        </h2>

        <div className="flex-row">
          <a className="link view-source mr-2 pt-1" href={`https://ipfs.io/${protocol ? `/${protocol}` : 'ipfs'}/${id}`} target="_blank" rel="noreferrer" title="View source">
            <i className="icon-code" />
          </a>

          <div role="button" tabIndex={0} className="icon-button pt-1" onClick={onForkClick} title="Copy this dashboard locally and edit">
            <i className="icon-clone" />
          </div>
        </div>
      </div>

      <Dashboard config={dashboard} />

    </div>
  );
}

export default DashboardPage;
