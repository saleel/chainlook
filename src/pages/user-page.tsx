import React from 'react';
import ElementList from '../components/element-list';
import { AuthContext } from '../context/auth-context';
import API from '../data/api';
import Store from '../data/store';
import Widget from '../domain/widget';
import usePromise from '../hooks/use-promise';

function UserPage() {
  const { user } = React.useContext(AuthContext);

  const [usersWidgets, { isFetching: isFetchingWidgets }] = usePromise<Widget[]>(() => API.getWidgetsByUser(user!.id), {
    defaultValue: [],
    dependencies: [user],
    conditions: [user],
  });

  const [usersDashboards, { isFetching: isFetchingDashboards }] = usePromise<Widget[]>(
    () => API.getDashboardsByUser(user!.id),
    {
      defaultValue: [],
      dependencies: [user],
      conditions: [user],
    },
  );

  if (!user) {
    return <div>You are not logged in</div>;
  }

  if (isFetchingDashboards || isFetchingWidgets) {
    return <div>Loading...</div>;
  }

  return (
    <div className='page user-page'>
      <div className='dashboard-header'>
        <div className='dashboard-title'>
          <h2>{user?.username}</h2>

          <div className='dashboard-info mt-1'>
            <span className='tag mr-2'>{user?.address}</span>
          </div>
        </div>
      </div>

      <div className='columns'>
        <div className='column'>
          <ElementList title={`Widgets created by @${user?.username}`} elements={usersWidgets} type='widget' />
        </div>

        <div className='column'>
          <ElementList title={`Dashboards created by @${user?.username}`} elements={usersDashboards} type='dashboard' />
        </div>
      </div>
    </div>
  );
}

export default UserPage;
