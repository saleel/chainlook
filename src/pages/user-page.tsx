import { useNavigate, useParams } from 'react-router-dom';
import ElementList from '../components/element-list';
import API from '../data/api';
import Widget from '../domain/widget';
import usePromise from '../hooks/use-promise';
import { deleteTokenAndUser } from '../utils/auth';

function UserPage() {
  const { username } = useParams();

  const navigate = useNavigate();

  const [usersWidgets, { isFetching: isFetchingWidgets }] = usePromise<Widget[]>(
    () => API.getWidgetsByUser(username as string),
    {
      defaultValue: [],
      dependencies: [username],
      conditions: [username],
    },
  );

  const [usersDashboards, { isFetching: isFetchingDashboards }] = usePromise<Widget[]>(
    () => API.getDashboardsByUser(username as string),
    {
      defaultValue: [],
      dependencies: [username],
      conditions: [username],
    },
  );

  function onLogoutClick() {
    deleteTokenAndUser();
    navigate('/');
    window.location.reload();
  }

  if (isFetchingDashboards || isFetchingWidgets) {
    return <div>Loading...</div>;
  }

  return (
    <div className='page user-page'>
      <div className='dashboard-header'>
        <div className='dashboard-title'>
          <h2>{username}</h2>
        </div>

        <div className='dashboard-actions'>
          <button onClick={onLogoutClick} className='button is-small'>
            Logout
          </button>
        </div>
      </div>

      <div className='columns'>
        <div className='column'>
          <ElementList
            title={`Widgets created by @${username}`}
            elements={usersWidgets}
            type='widget'
          />
        </div>

        <div className='column'>
          <ElementList
            title={`Dashboards created by @${username}`}
            elements={usersDashboards}
            type='dashboard'
          />
        </div>
      </div>
    </div>
  );
}

export default UserPage;
