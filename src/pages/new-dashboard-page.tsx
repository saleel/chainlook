import React from "react";
import { useNavigate } from "react-router-dom";
import { useConnectModal } from '@rainbow-me/rainbowkit';
import DashboardView from "../components/dashboard-view";
import Modal from "../components/modal";
import usePromise from "../hooks/use-promise";
import API from "../data/api";
import Store from "../data/store";
import { AuthContext } from "../context/auth-context";
import Dashboard, { DashboardDefinition } from "../domain/dashboard";
import Widget from "../domain/widget";
import User from "../domain/user";
import { cleanString, slugify } from "../utils";
import { useDebouncedCallback } from "use-debounce";

type Element = DashboardDefinition["elements"][0];

const minDimensions = {
  table: { width: 4, height: 3 },
  chart: { width: 2, height: 2 },
  pieChart: { width: 2, height: 2 },
  metric: { width: 2, height: 1 },
};

const DEFAULT_DASHBOARD: Dashboard = new Dashboard({
  id: "",
  title: "",
  slug: "",
  definition: { title: "", elements: [] },
  tags: [],
  starred: 0,
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: new User({ id: "", username: "", address: "" }),
});

function NewDashboardPage() {
  const navigate = useNavigate();

  const { openConnectModal } = useConnectModal();

  const { user, isAuthenticated } = React.useContext(AuthContext);

  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = React.useState(false);
  const [isAddTextModalOpen, setIsAddTextModalOpen] = React.useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = React.useState(false);
  const [dashboard, setDashboard] = React.useState<Dashboard>(Store.getDashboardDraft() || DEFAULT_DASHBOARD);

  React.useEffect(() => {
    document.title = "New Dashboard - ChainLook";
  }, []);

  const saveDraft = useDebouncedCallback(d => Store.saveDashboardDraft(d), 1000);

  React.useEffect(() => {
    saveDraft(dashboard);
  }, [dashboard]);

  const [widgetOfUser] = usePromise<Widget[]>(
    () => API.getWidgetsForUser(user?.id as string),
    {
      conditions: [user?.id],
      defaultValue: [],
    }
  );

  async function onPublishFormSubmit(e: any) {
    e.preventDefault();

    if (!isAuthenticated) {
      openConnectModal && openConnectModal();
      return;
    }

    const submitButton = e.target.querySelector("button[type=submit]");

    try {
      submitButton.disabled = true;

      const created = await API.createDashboard(dashboard);

      Store.deleteDashboardDraft();
      setIsPublishModalOpen(false);
      navigate(`/dashboard/${created.user.username}/${created.slug}`);
    } finally {
      submitButton.disabled = false;
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
        widget: {
          definition,
          id: widget.id,
          title: widget.title,
          tags: widget.tags,
          user: widget.user,
          version: widget.version,
        },
        layout: {
          i: existing.length,
          x: 0,
          y: 0,
          w: width,
          h: height,
        },
      },
    ]);

    setIsAddWidgetModalOpen(false);
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

    setIsAddTextModalOpen(false);
  }

  const { elements } = dashboard.definition;

  return (
    <div className="page new-dashboard-page">
      <div className="dashboard-actions">
        <button
          type="button"
          className="button is-normal"
          disabled={dashboard.definition.elements.length === 0}
          onClick={() => {
            if (window.confirm("Are you sure you want to clear all the items from the dashboard?")) {
              setDashboard(DEFAULT_DASHBOARD);
            }
          }}
        >
          Reset
        </button>
        <button
          type="button"
          className="button is-normal"
          onClick={() => setIsAddTextModalOpen(true)}
        >
          Add Text
        </button>
        <button
          type="button"
          className="button is-normal"
          onClick={() => setIsAddWidgetModalOpen(true)}
        >
          Add Widget
        </button>
        <button
          type="button"
          className="button is-normal"
          disabled={dashboard.definition.elements.length === 0}
          onClick={() => setIsPublishModalOpen(true)}
        >
          Save
        </button>
      </div>

      {elements.length > 0 ? (
        <DashboardView
          dashboard={dashboard}
          isEditable
          onLayoutChange={onLayoutChange}
          onRemoveWidgetClick={onRemoveElement}
        />
      ) : (
        <div className="mt-5 text-center message">
          Start creating dashboard by adding Widgets
        </div>
      )}

      <Modal
        isOpen={isAddWidgetModalOpen}
        onRequestClose={() => setIsAddWidgetModalOpen(false)}
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
                : "You need to sign in to see your created widgets."}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isAddTextModalOpen}
        onRequestClose={() => setIsAddTextModalOpen(false)}
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

      <Modal
        title="Publish Dashboard"
        isOpen={isPublishModalOpen}
        onRequestClose={() => setIsPublishModalOpen(false)}
      >
        <form onSubmit={onPublishFormSubmit}>

          <div className="field">
            <label className="label">Title</label>
            <div className="control">
              <input
                type="text"
                className="input"
                placeholder="Enter widget title"
                required
                value={cleanString(dashboard.title)}
                onChange={(e) => {
                  setDashboard((ex) => ({ 
                    ...ex, 
                    title: e.target.value,
                    slug: slugify(e.target.value),
                    definition: {
                      ...ex.definition,
                      title: e.target.value,
                    }
                  }));
                }}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Slug</label>
            <div className="control">
              <input
                type="text"
                className="input"
                placeholder="Enter slug to be used in the URL for the dashboard"
                required
                value={dashboard.slug}
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                onChange={(e) => setDashboard((ex) => ({ ...ex, slug: e.target.value }))}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Tags</label>
            <input
              type="text"
              className="input"
              placeholder="Enter tags separated by comma"
              value={dashboard.tags}
              required
              onChange={(e) => setDashboard((ex) => ({ ...ex, tags: e.target.value.split(',') }))}
            />
          </div>

          <button type="submit" className="button mt-4">
            Publish
          </button>

        </form>
      </Modal>

    </div>
  );
}

export default NewDashboardPage;
