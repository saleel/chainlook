/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import ReactModal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/dashboard';
import {
  getAllWidgets, getDashboard, getLocalDashboard, publishToIPFS, removeLocalDashboards, saveDashboardLocally,
} from '../data-service';
import usePromise from '../hooks/use-promise';

function NewDashboardPage() {
  const fromId = new URL(window.location).searchParams?.get('fromId');

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [dashboardConfig, setDashboardConfig] = React.useState();

  const [fromDashboardConfig, { isFetching, error }] = usePromise(async () => {
    if (fromId) {
      return getDashboard(fromId);
    }

    const localDashboard = await getLocalDashboard();
    if (localDashboard) {
      return {
        title: localDashboard.title,
        widgets: localDashboard.widgets || [],
      };
    }

    return {
      title: 'New Dashboard',
      widgets: [],
    };
  }, {
    dependencies: [fromId],
    conditions: [],
  });

  React.useEffect(() => {
    setDashboardConfig(fromDashboardConfig);
  }, [fromDashboardConfig]);

  React.useEffect(() => {
    if (dashboardConfig) {
      saveDashboardLocally(dashboardConfig);
    }
  }, [dashboardConfig]);

  const [allLocalWidgets] = usePromise(() => getAllWidgets(), {
    dependencies: [isModalOpen],
    conditions: [isModalOpen],
    defaultValue: [],
  });

  async function onPublishToIPFSClick() {
    const widgetCID = await publishToIPFS(dashboardConfig);
    await removeLocalDashboards(); // Remove local draft

    // Redirect to new dashboard
    navigate(`/dashboard/${widgetCID}`);
  }

  function onSelectWidget(widgetConfig) {
    setDashboardConfig((ex) => ({
      ...ex,
      widgets: [...ex.widgets, {
        widget: widgetConfig,
        layout: {
          i: ex.widgets.length, x: 0, y: 0, w: 4, h: 4,
        },
      }],
    }));

    setIsModalOpen(false);
  }

  function onLayoutChange(allLayouts) {
    setDashboardConfig((ex) => ({
      ...ex,
      widgets: ex.widgets.map((wi, index) => {
        const layout = allLayouts.find((l) => l.i === index.toString());
        const {
          i, x, y, w, h,
        } = layout;

        return {
          ...wi,
          layout: {
            i, x, y, w, h,
          },
        };
      }),
    }));
  }

  function onRemoveWidgetClick(removedWidget) {
    setDashboardConfig((ex) => ({
      ...ex,
      widgets: ex.widgets.filter((w) => w.layout.i !== removedWidget.layout.i),
    }));
  }

  function onEditTitleClick() {
    // eslint-disable-next-line no-alert
    const newTitle = window.prompt('Enter the title for the dashboard', dashboardConfig?.title);
    if (newTitle) {
      setDashboardConfig((ex) => ({ ...ex, title: newTitle }));
    }
  }

  if (!dashboardConfig || isFetching) {
    return (<div>Loading</div>);
  }

  if (error) {
    return (<div>{error.message}</div>);
  }

  return (
    <div className="page new-dashboard-page">

      <div className="dashboard-actions">
        <h2 className="dashboard-title">
          {dashboardConfig?.title}
        </h2>

        <div>
          <button type="button" className="button btn-add-widget" onClick={onEditTitleClick}>
            Edit Title
          </button>
          <button type="button" className="button btn-add-widget" onClick={() => setIsModalOpen(true)}>
            Add Widget
          </button>
          <button type="button" className="button btn-add-widget" onClick={onPublishToIPFSClick}>
            Publish to IPFS
          </button>
        </div>
      </div>

      {dashboardConfig && dashboardConfig.widgets.length > 0 && (
        <Dashboard
          config={dashboardConfig}
          isEditable
          onLayoutChange={onLayoutChange}
          onRemoveWidgetClick={onRemoveWidgetClick}
        />
      )}

      {dashboardConfig && dashboardConfig.widgets.length === 0 && (
        <div className="mt-4">
          Start creating dashboard by Adding Widgets
        </div>
      )}

      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          content: {
            top: '40%',
            left: '50%',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            height: '400px',
            width: '600px',
          },
        }}
        contentLabel="Add Widget"
      >
        <h3 className="subtitle">Add Widget</h3>

        <div className="add-widget-container">
          {allLocalWidgets.length > 0 ? allLocalWidgets.map((widget) => (
            <div key={widget.title} tabIndex={0} role="button" className="add-widget-item" onClick={() => onSelectWidget(widget)}>
              {widget.type} - {widget.title}
            </div>
          )) : (
            <div>
              No widgets found. Use `New Widget` page to create a new widget.
            </div>
          )}
        </div>

        <button
          type="button"
          className="modal-close is-large"
          aria-label="close"
          onClick={() => setIsModalOpen(false)}
        />
      </ReactModal>

    </div>
  );
}

export default NewDashboardPage;
