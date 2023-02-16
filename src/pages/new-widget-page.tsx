import React from "react";
import { useNavigate } from "react-router-dom";
import WidgetView from "../components/widget-view";
import API from "../data/api";
import WidgetEditor from "../components/widget-editor";
import Widget from "../domain/widget";
import { AuthContext } from "../context/auth-context";
import User from "../domain/user";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Store from "../data/store";
import { useDebouncedCallback } from "use-debounce";
import { cleanString } from "../utils";

const DEFAULT_DEFINITION: Widget["definition"] = {
  type: "table",
  data: {
    source: {
      provider: "graph",
      subgraphId: "messari/uniswap-v3-ethereum",
      entity: "financialsDailySnapshots",
    },
  },
  table: {
    columns: [
      {
        dataKey: "timestamp",
        format: "dateMMMdd",
        label: "Date",
      },
      {
        dataKey: "dailyVolumeUSD",
        label: "Daily Volume (USD)",
        format: "number",
      },
    ],
  },
};

function NewWidgetPage() {
  const navigate = useNavigate();

  const { user, isAuthenticated } = React.useContext(AuthContext);

  const { openConnectModal } = useConnectModal();

  const [widget, setWidget] = React.useState(
    Store.getWidgetDraft() ||
      new Widget({
        id: "",
        title: "",
        tags: [],
        definition: DEFAULT_DEFINITION,
        version: 1,
        user: user || new User({ id: "", address: "" }),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
  );

  React.useEffect(() => {
    document.title = "New Widget - ChainLook";
  }, []);

  const saveDraft = useDebouncedCallback((w) => Store.saveWidgetDraft(w), 1000);

  React.useEffect(() => {
    saveDraft(widget);
  }, [widget]);

  function updateWidget(key: string, value: string | object) {
    setWidget((existing) => ({ ...existing, [key]: value }));
  }

  async function onFormSubmit(e: any) {
    e.preventDefault();

    if (!isAuthenticated) {
      openConnectModal && openConnectModal();
      return;
    }
    const submitButton = e.target.querySelector('button[type="submit"]');

    try {
      submitButton.disabled = true;
      const created = await API.createWidget(widget);

      Store.deleteWidgetDraft();
      navigate(`/widgets/${created.id}`);
    } finally {
      submitButton.disabled = false;
    }
  }

  const { definition, title, tags } = widget;

  return (
    <div className="page create-widget-page">
      <h2 className="section-title">Create new widget</h2>

      <div className="create-widget-container">
        <div className="create-widget-section">
          <WidgetEditor
            onChange={(d) => updateWidget("definition", d)}
            definition={definition}
          />

          <form className="create-widget-helper" onSubmit={onFormSubmit}>
            <div className="field">
              <label className="label">Title</label>
              <div className="control">
                <input
                  type="text"
                  className="input"
                  placeholder="Enter widget title"
                  value={cleanString(title)}
                  required
                  onChange={(e) => {
                    updateWidget("title", e.target.value)
                  }}
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Tags</label>
              <input
                type="text"
                className="input"
                placeholder="Enter tags separated by comma"
                value={tags}
                required
                onChange={(e) =>
                  updateWidget("tags", e.target.value.split(","))
                }
              />
            </div>
            <hr />
            <button type="submit" className="button">
              Save
            </button>
          </form>
        </div>

        <hr />

        <div className="create-widget-preview">
          <div className="section-title">Preview</div>

          <WidgetView widget={widget} />
        </div>
      </div>
    </div>
  );
}

export default NewWidgetPage;
