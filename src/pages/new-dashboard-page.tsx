/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/no-array-index-key */
import React, { ReactEventHandler } from "react";
import { useNavigate } from "react-router-dom";
import DashboardView from "../components/dashboard-view";
import Modal from "../components/modal";
import usePromise from "../hooks/use-promise";
import API from "../data/api";
import {
  getAllWidgets,
  getLocalDashboard,
  removeLocalDashboards,
  saveDashboardLocally,
} from "../data/store";
import { AuthContext } from "../context/auth-context";
import Dashboard, { DashboardDefinition } from "../domain/dashboard";
import Widget, { WidgetDefinition } from "../domain/widget";
import User from "../domain/user";

type Element = DashboardDefinition["elements"][0];

const minDimensions = {
  table: { width: 4, height: 3 },
  chart: { width: 2, height: 2 },
  pieChart: { width: 2, height: 2 },
  metric: { width: 2, height: 1 },
};

function NewDashboardPage() {
  const navigate = useNavigate();

  const { user } = React.useContext(AuthContext);

  const [isNewWidgetModalOpen, setIsNewWidgetModalOpen] = React.useState(false);
  const [isNewTextModalOpen, setIsNewTextModalOpen] = React.useState(false);
  const [dashboard, setDashboard] = React.useState<Dashboard>(
    new Dashboard({
      id: "",
      title: "",
      slug: "",
      definition: { title: "", elements: [] },
      tags: [],
      starred: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: user || new User({ id: "", username: "", address: "" }),
    })
  );

  React.useEffect(() => {
    document.title = "New Dashboard - ChainLook";
  }, []);

  React.useEffect(() => {
    if (dashboard) {
      saveDashboardLocally(dashboard);
    }
  }, [dashboard]);

  const [widgetOfUser] = usePromise<Widget[]>(
    () => API.getWidgetsForUser(user?.id as string),
    {
      conditions: [user?.id],
      defaultValue: [],
    }
  );

  async function onPublishClick(e) {
    if (!dashboard.title) {
      onEditTitleClick();

      if (!dashboard.title) {
        return;
      }
    }

    try {
      e.target.disabled = true;
      await removeLocalDashboards(); // Remove local draft

      const created = await API.createDashboard(dashboard);
      navigate(`/dashboard/${created.id}`);
    } finally {
      e.target.disabled = false;
    }
  }

  function updateElements(fn: (ex: Element[]) => Element[]) {
    setDashboard((ex) => {
      const newElements = fn(ex.definition.elements);

      return {
        ...ex,
        definition: {
          ...ex.definition,
          elements: newElements,
        },
      };
    });
  }

  function onAddWidget(widget: Widget) {
    const { definition } = widget;

    let width = 4;
    let height = 4;

    if (definition?.type === "metric") {
      width = 1;
      height = 1;
    }

    updateElements((existing) => [
      ...existing,
      {
        widget,
        layout: {
          i: existing.length,
          x: 0,
          y: 0,
          w: width,
          h: height,
        },
      },
    ]);

    setIsNewWidgetModalOpen(false);
  }

  function onLayoutChange(allLayouts: any[]) {
    updateElements((existing) =>
      existing.map((el, index) => {
        const layout = allLayouts.find((l) => l.i === index.toString());
        const { i, x, y, w, h } = layout;

        if (el.widget) {
          const minDimensionForWidget =
            minDimensions[el.widget!.definition!.type];

          if (w < minDimensionForWidget.width) {
            layout.w = minDimensionForWidget.width;
          }

          if (h < minDimensionForWidget.height) {
            layout.h = minDimensionForWidget.height;
          }
        }

        return {
          ...el,
          layout: {
            i,
            x,
            y,
            w,
            h,
          },
        };
      })
    );
  }

  function onRemoveElement(removedWidget: Element) {
    updateElements((existing) =>
      existing.filter((w) => w.layout.i !== removedWidget.layout.i)
    );
  }

  function onNewTextFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const message = formData.get("message") as string;

    updateElements((existing) => [
      ...existing,
      {
        text: {
          title,
          message,
        },
        layout: {
          i: existing.length,
          x: 0,
          y: 0,
          w: 2,
          h: 1,
        },
      },
    ]);

    setIsNewTextModalOpen(false);
  }

  function onEditTitleClick() {
    // eslint-disable-next-line no-alert
    const newTitle = window.prompt(
      "Enter the title for the dashboard",
      dashboard?.title
    );
    if (newTitle) {
      setDashboard((ex) => ({ ...ex, title: newTitle }));
    }
  }

  const { elements } = dashboard.definition;

  return (
    <div className="page new-dashboard-page">
      <div className="dashboard-actions">
        <h2 className="dashboard-title">{dashboard.title || 'Untitled Dashboard'}</h2>

        <div>
          <button
            type="button"
            className="button is-normal"
            onClick={onEditTitleClick}
          >
            Edit Title
          </button>
          <button
            type="button"
            className="button is-normal"
            onClick={() => setIsNewTextModalOpen(true)}
          >
            Add Text
          </button>
          <button
            type="button"
            className="button is-normal"
            onClick={() => setIsNewWidgetModalOpen(true)}
          >
            Add Widget
          </button>
          <button
            type="button"
            className="button is-normal"
            onClick={onPublishClick}
          >
            Publish
          </button>
        </div>
      </div>

      {elements.length > 0 && (
        <DashboardView
          dashboard={dashboard}
          isEditable
          onLayoutChange={onLayoutChange}
          onRemoveWidgetClick={onRemoveElement}
        />
      )}

      {elements.length === 0 && (
        <div className="mt-4">Start creating dashboard by Adding Widgets</div>
      )}

      <Modal
        isOpen={isNewWidgetModalOpen}
        onRequestClose={() => setIsNewWidgetModalOpen(false)}
        title="Add Widget"
      >
        <div>
          {widgetOfUser.length > 0 ? (
            widgetOfUser.map((widget) => (
              <div
                key={widget.id}
                tabIndex={0}
                role="button"
                className="add-widget-item"
                onClick={() => onAddWidget(widget)}
              >
                {widget.definition?.type} - {widget.title}
              </div>
            ))
          ) : (
            <div>
              {user
                ? "You have not created any widgets yet."
                : "You need to login to see your created widgets."}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isNewTextModalOpen}
        onRequestClose={() => setIsNewTextModalOpen(false)}
        title="Add Text"
      >
        <form onSubmit={onNewTextFormSubmit}>
          <input
            name="title"
            className="form-input"
            type="text"
            placeholder="Title"
          />
          <textarea
            name="message"
            className="form-input"
            placeholder="Message"
          />

          <button className="button mt-4" type="submit">
            Submit
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default NewDashboardPage;
