/* eslint-disable react/no-array-index-key */
import React from 'react';
import ReactModal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/dashboard';
import {
  getAllWidgets, getDashboard, getLocalDashboard, publishToIPFS, saveDashboardLocally,
} from '../data-service';
import usePromise from '../hooks/use-promise';

function NewDashboardPage() {
  const fromId = new URL(window.location).searchParams?.get('fromId');

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [dashboardConfig, setDashboardJson] = React.useState();

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
    setDashboardJson(fromDashboardConfig);
  }, [fromDashboardConfig]);

  const [allLocalWidgets] = usePromise(() => getAllWidgets(), {
    dependencies: [isModalOpen],
    conditions: [isModalOpen],
    defaultValue: [],
  });

  async function onPublishToIPFSClick() {
    const widgetCID = await publishToIPFS(dashboardConfig);
    navigate(`/dashboard/${widgetCID}`);
  }

  function onSelectWidget(widgetConfig) {
    setDashboardJson((ex) => ({
      ...ex,
      widgets: [...ex.widgets, {
        widget: widgetConfig,
        layout: {
          x: 0, y: 0, w: 4, h: 4,
        },
      }],
    }));

    setIsModalOpen(false);
    saveDashboardLocally(dashboardConfig);
  }

  function onLayoutChange(allLayouts) {
    setDashboardJson((ex) => ({
      ...ex,
      widgets: ex.widgets.map((wi, index) => {
        const layout = allLayouts.find((l) => l.i === index.toString());
        const {
          x, y, w, h,
        } = layout;

        return {
          ...wi,
          layout: {
            x, y, w, h,
          },
        };
      }),
    }));

    saveDashboardLocally(dashboardConfig);
  }

  if (!dashboardConfig || isFetching) {
    return (<div>Loading</div>);
  }

  if (error) {
    return (<div>{error.message}</div>);
  }

  return (
    <div className="page new-dashboard-page">

      <div className="new-dashboard-actions">
        <button type="button" className="button btn-add-widget" onClick={() => setIsModalOpen(true)}>
          Add Widget
        </button>
        <button type="button" className="button btn-add-widget" onClick={onPublishToIPFSClick}>
          Publish to IPFS
        </button>
      </div>

      {dashboardConfig && (
        // eslint-disable-next-line react/jsx-no-bind
        <Dashboard config={dashboardConfig} isEditable onLayoutChange={onLayoutChange} />
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
            <div key={widget.name} tabIndex={0} role="button" className="add-widget-item" onClick={() => onSelectWidget(widget)}>
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
