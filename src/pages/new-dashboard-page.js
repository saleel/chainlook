/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/dashboard';
import Modal from '../components/modal';
import {
  getAllWidgets, getDashboard, getLocalDashboard, publishToIPFS, removeLocalDashboards, saveDashboardLocally,
} from '../data-service';
import usePromise from '../hooks/use-promise';

function NewDashboardPage() {
  const fromId = new URL(window.location.toString().replace('/#/', '/')).searchParams?.get('fromId');

  const navigate = useNavigate();
  const [isNewWidgetModalOpen, setIsNewWidgetModalOpen] = React.useState(false);
  const [isNewTextModalOpen, setIsNewTextModalOpen] = React.useState(false);
  const [dashboardConfig, setDashboardConfig] = React.useState();

  React.useEffect(() => {
    document.title = 'New Dashboard - ChainLook';
  }, []);

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
    dependencies: [isNewWidgetModalOpen],
    conditions: [isNewWidgetModalOpen],
    defaultValue: [],
  });

  async function onPublishToIPFSClick(e) {
    e.target.disabled = true;

    const widgetCID = await publishToIPFS(dashboardConfig);
    await removeLocalDashboards(); // Remove local draft

    e.target.disabled = false;

    // Wait for 2 seconds for IPFS publishing
    await new Promise((resolve) => { setTimeout(resolve, 2000); });

    // Redirect to new dashboard
    navigate(`/dashboard/${widgetCID}`);
  }

  function onSelectWidget(widgetConfig) {
    let width = 4;
    let height = 4;
    let minWidth = 1;
    let minHeight = 1;

    if (widgetConfig?.type === 'metric') {
      width = 1;
      height = 1;
    }

    if (widgetConfig?.type === 'table') {
      minWidth = 4;
      minHeight = 3;
    }

    if (widgetConfig?.type === 'chart' || widgetConfig?.type === 'pieChart') {
      minWidth = 2;
      minHeight = 2;
    }

    setDashboardConfig((ex) => ({
      ...ex,
      widgets: [...ex.widgets, {
        widget: widgetConfig,
        layout: {
          i: ex.widgets.length, x: 0, y: 0, w: width, h: height, minW: minWidth, minH: minHeight,
        },
      }],
    }));

    setIsNewWidgetModalOpen(false);
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

  function onNewTextFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const title = formData.get('title');
    const message = formData.get('message');

    setDashboardConfig((ex) => ({
      ...ex,
      widgets: [...ex.widgets, {
        widget: {
          type: 'text',
          title,
          text: { message },
        },
        layout: {
          i: ex.widgets.length, x: 0, y: 0, w: 2, h: 1,
        },
      }],
    }));

    setIsNewTextModalOpen(false);
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
          <button type="button" className="button btn-add-widget" onClick={() => setIsNewTextModalOpen(true)}>
            Add Text Widget
          </button>
          <button type="button" className="button btn-add-widget" onClick={() => setIsNewWidgetModalOpen(true)}>
            Add Widget
          </button>
          <button type="button" className="button btn-add-widget" onClick={onPublishToIPFSClick}>
            Publish
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

      <Modal
        isOpen={isNewWidgetModalOpen}
        onRequestClose={() => setIsNewWidgetModalOpen(false)}
        title="Add Widget"
      >
        <div>
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
      </Modal>

      <Modal
        isOpen={isNewTextModalOpen}
        onRequestClose={() => setIsNewTextModalOpen(false)}
        title="Add Text Widget"
      >
        <form onSubmit={onNewTextFormSubmit}>
          <input name="title" className="form-input" type="text" placeholder="Title" />
          <textarea name="message" className="form-input" type="text" placeholder="Message" />

          <button className="button mt-4" type="submit">Submit</button>
        </form>
      </Modal>

    </div>
  );
}

export default NewDashboardPage;
