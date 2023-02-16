import React from "react";
import ElementList from "../components/element-list";
import { AuthContext } from "../context/auth-context";
import API from "../data/api";
import Store from "../data/store";
import Widget from "../domain/widget";
import usePromise from "../hooks/use-promise";

function UserPage() {
  const { user } = React.useContext(AuthContext);

  const [usersWidgets, { isFetching: isFetchingWidgets }] = usePromise<
    Widget[]
  >(() => API.getWidgetsByUser(user!.id), {
    defaultValue: [],
    dependencies: [user],
    conditions: [user],
  });

  const [usersDashboards, { isFetching: isFetchingDashboards }] = usePromise<
    Widget[]
  >(() => API.getDashboardsByUser(user!.id), {
    defaultValue: [],
    dependencies: [user],
    conditions: [user],
  });

  function onAPIFormSubmit(e: any) {
    e.preventDefault();

    const apiKey = e.target.apiKey.value;
    Store.setTheGraphAPIKey(apiKey);
    
    alert("API key saved successfully. This key will be used for all future queries to TheGraph network.");
  }

  if (!user) {
    return <div>You are not logged in</div>;
  }

  if (isFetchingDashboards || isFetchingWidgets) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page user-page">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h2>{user?.username}</h2>

          <div className="dashboard-info mt-1">
            <span className="tag mr-2">{user?.address}</span>
          </div>
        </div>
      </div>

      <div className="columns">
        <div className="column">
          <ElementList
            title={`Widgets created by @${user?.username}`}
            elements={usersWidgets}
            type="widget"
          />
        </div>

        <div className="column">
          <ElementList
            title={`Dashboards created by @${user?.username}`}
            elements={usersDashboards}
            type="dashboard"
          />
        </div>
      </div>

      <hr />

      <div className="section mb-6">
        <div className="section-title">TheGraph API Key</div>
        <p>
          You can set your own API key to query TheGraph. This will be used when
          you render a widget that use subgraphs from TheGraph decentralized
          network.
        </p>
        <p>
          This wont be used for subgraphs built on top of the hosted service, or
          other data sources.
          <a
            href="https://thegraph.com/docs/en/querying/managing-api-keys/"
            target="_blank"
          >
            Learn more
          </a>
        </p>
        <p>
          Your keys are only saved on your local storage. They are not sent to
          Chainlook servers. The key will be lost if you clear your browser storage.
        </p>

        <form className="mt-4" onSubmit={onAPIFormSubmit}>
          <div className="field">
            <label className="label">TheGraph API Key</label>
            <div className="control">
              <input
                id="apiKey"
                className="input"
                type="text"
                defaultValue={Store.getTheGraphAPIKey() || ''}
              />
            </div>
          </div>

          <button className="button mt-3">Save</button>
        </form>
      </div>
    </div>
  );
}

export default UserPage;
