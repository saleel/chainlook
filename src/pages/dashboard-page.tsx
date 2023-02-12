/* eslint-disable react/no-array-index-key */
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardView from "../components/dashboard-view";
import { AuthContext } from "../context/auth-context";
import API from "../data/api";
import usePromise from "../hooks/use-promise";

function DashboardPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { user } = React.useContext(AuthContext);

  const [dashboard, { isFetching, error }] = usePromise(
    () => API.getDashboard(id as string),
    {
      dependencies: [id],
      conditions: [id],
    }
  );

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
    return <div className="page dashboard-page">Loading</div>;
  }

  if (error) {
    return <div className="page dashboard-page">{error.message}</div>;
  }

  const isDashboardOwner = dashboard?.user?.id === user?.id;

  return (
    <div className="page dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h2>{dashboard?.title}</h2>

          <div className="dashboard-info mt-1">
            {dashboard.user && (
              <span className="tag mr-2">👤 {dashboard.user?.username}</span>
            )}

            {dashboard.tags?.map((tag: string) => (
              <span key={tag} className="tag mr-2">#{tag}</span>
            ))}
          </div>
        </div>

        <div className="dashboard-actions">
          {isDashboardOwner && (
            <Link
              className="button is-normal"
              to={`/dashboards/${dashboard.id}/edit`}
              title="Edit the dashboard"
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
