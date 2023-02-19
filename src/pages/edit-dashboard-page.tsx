import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import API from '../data/api';
import Store from '../data/store';
import { AuthContext } from '../context/auth-context';
import Dashboard from '../domain/dashboard';
import { useDebouncedCallback } from 'use-debounce';
import DashboardEditor from '../components/dashboard-editor';
import usePromise from '../hooks/use-promise';

function EditDashboardPage() {
  const navigate = useNavigate();
  const { id: dashboardId } = useParams();
  const { openConnectModal } = useConnectModal();

  const { isAuthenticated } = React.useContext(AuthContext);

  const [dashboard, { isFetching, error }] = usePromise<Dashboard>(
    () => API.getDashboard(dashboardId as string),
    {
      dependencies: [dashboardId],
      conditions: [dashboardId],
    },
  );

  React.useEffect(() => {
    if (dashboard) {
      document.title = `Edit ${dashboard.title} - ChainLook`;
    }
  }, [dashboard]);

  async function onPublish(dashboard: Dashboard) {
    if (!isAuthenticated) {
      openConnectModal && openConnectModal();
      return;
    }

    await API.editDashboard(dashboard);
    navigate(`/dashboards/${dashboard.user.username}:${dashboard.slug}`);
  }

  if (isFetching) {
    return <div className='page dashboard-page'>Loading</div>;
  }

  if (error) {
    return <div className='page dashboard-page'>{error.message}</div>;
  }

  return (
    <div className='page new-dashboard-page'>
      {dashboard && <DashboardEditor dashboard={dashboard} onPublish={onPublish} />}
    </div>
  );
}

export default EditDashboardPage;
