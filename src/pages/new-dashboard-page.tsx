import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import API from '../data/api';
import Store from '../data/store';
import { AuthContext } from '../context/auth-context';
import Dashboard from '../domain/dashboard';
import { useDebouncedCallback } from 'use-debounce';
import DashboardEditor from '../components/dashboard-editor';

function NewDashboardPage() {
  const navigate = useNavigate();
  const { openConnectModal } = useConnectModal();

  const { isAuthenticated } = React.useContext(AuthContext);

  // Save Dashboard being created as draft in local storage (with a debounce)
  const saveDraft = useDebouncedCallback((d) => Store.saveDashboardDraft(d), 1000);

  React.useEffect(() => {
    document.title = 'New Dashboard - ChainLook';
  }, []);

  async function onPublish(dashboard: Dashboard) {
    if (!isAuthenticated) {
      openConnectModal && openConnectModal();
      return;
    }

    const created = await API.createDashboard(dashboard);
    Store.deleteDashboardDraft();
    navigate(`/dashboards/${created.user.username}:${created.slug}`);
  }

  return (
    <div className='page new-dashboard-page'>
      <DashboardEditor
        dashboard={Store.getDashboardDraft()}
        onChange={saveDraft}
        onPublish={onPublish}
      />
    </div>
  );
}

export default NewDashboardPage;
