/* eslint-disable react/no-array-index-key */
import { useConnectModal } from '@rainbow-me/rainbowkit';
import React from 'react';
import { IoCalendarClearOutline, IoPerson, IoStar } from 'react-icons/io5';
import { Link, useParams } from 'react-router-dom';
import DashboardView from '../components/dashboard-view';
import { AuthContext } from '../context/auth-context';
import API from '../data/api';
import Dashboard from '../domain/dashboard';
import usePromise from '../hooks/use-promise';
import { formatDate } from '../utils/time';

function DashboardPage() {
  // const navigate = useNavigate();
  const { id } = useParams();
  const { openConnectModal } = useConnectModal();

  const [isStarred, setIsStarred] = React.useState(false);
  const [starCount, setStarCount] = React.useState(0);
  const { user, isAuthenticated } = React.useContext(AuthContext);

  const [dashboard, { isFetching, error }] = usePromise<Dashboard>(
    () => API.getDashboard(id as string),
    {
      dependencies: [id],
      conditions: [id],
    },
  );

  const [starredDashboards, { isFetching: isFetchingStarred }] = usePromise<Dashboard[]>(
    () => API.getStarredDashboards(user!.id),
    {
      dependencies: [user],
      conditions: [user],
    },
  );

  React.useEffect(() => {
    if (dashboard) {
      document.title = `${dashboard.title} by ${dashboard.user.username} - ChainLook`;
      setStarCount(dashboard.starCount);
    }
  }, [dashboard]);

  React.useEffect(() => {
    if (starredDashboards && dashboard) {
      setIsStarred(starredDashboards.some((d) => d.id === dashboard.id));
    }
  }, [starredDashboards, dashboard]);

  // const onForkClick = React.useCallback(async () => {
  //   // await saveDashboardLocally(dashboard);
  //   navigate('/dashboards/new'); // TODO: a hack for now - new widget page will load the most recent local widget
  // }, [dashboard]);

  async function onStarClick() {
    if (!isAuthenticated && openConnectModal) {
      openConnectModal();
      return;
    }

    setIsStarred(!isStarred);
    setStarCount(isStarred ? starCount - 1 : starCount + 1);

    await API.starDashboard(dashboard.id, !isStarred);
  }

  if (isFetching) {
    return <div className='page dashboard-page'>Loading</div>;
  }

  if (error) {
    return <div className='page dashboard-page'>{error.message}</div>;
  }

  const isDashboardOwner = dashboard?.user?.id === user?.id;

  return (
    <div className='page dashboard-page'>
      <div className='dashboard-header'>
        <div className='dashboard-title'>
          <h2>{dashboard?.title}</h2>

          <div className='dashboard-info mt-1'>
            {dashboard.user && (
              <Link to={`/users/${dashboard.user.username}`} className='tag mr-2'>
                <span className='tag mr-2'>
                  <IoPerson size={10} />
                  <span className='ml-3'>{dashboard.user?.username}</span>
                </span>
              </Link>
            )}

            {dashboard.createdOn && (
              <span
                className='tag mr-2'
                data-tooltip={`This dashboard was created on ${formatDate(
                  dashboard.createdOn,
                )} and was last updated on ${formatDate(dashboard.updatedOn)}`}
              >
                <IoCalendarClearOutline size={10} />
                <span className='ml-3'>{formatDate(dashboard.createdOn)}</span>
              </span>
            )}

            {dashboard.tags?.map((tag: string) => (
              <span key={tag} className='tag mr-2'>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className='dashboard-actions'>
          {/* <button className='button is-normal'>Share</button> */}

          {!isFetchingStarred && (
            <button
              className={'button is-normal' + (isStarred ? ' is-active' : '')}
              style={{ minWidth: '5rem', justifyContent: 'space-between' }}
              onClick={onStarClick}
            >
              <IoStar size={16} className='mr-3' />
              {starCount}
            </button>
          )}

          {isDashboardOwner && (
            <Link
              className='button is-normal'
              to={`/dashboards/${dashboard.id}/edit`}
              title='Edit the dashboard'
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      <DashboardView dashboard={dashboard} />
    </div>
  );
}

export default DashboardPage;
