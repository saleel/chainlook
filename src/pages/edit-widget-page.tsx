import React from "react";
import { useParams } from "react-router-dom";
import WidgetView from "../components/widget-view";
import { getWidget, newWidget, publishToIPFS as saveWidget } from "../data/api";
import usePromise from "../hooks/use-promise";
import WidgetEditor from "../components/widget-editor";
import Widget from "../domain/widget";

function EditWidgetPage() {
  const { widgetId } = useParams();

  const [editingWidget, setEditingWidget] = React.useState<Widget | null>(null);

  const [widget, { isFetching, error }] = usePromise<Widget>(
    () => getWidget(widgetId as string),
    {
      dependencies: [widgetId],
      conditions: [widgetId],
    }
  );

  React.useEffect(() => {
    if (!widget) return;

    setEditingWidget(widget);
    document.title = `Edit Widget ${widget.title} - ChainLook`;
  }, [widget]);

  function updateWidget(key: string, value: string | object) {
    setEditingWidget((existing) => ({ ...(existing as Widget), [key]: value }));
  }

  async function onSaveClick(e: any) {
    e.target.disabled = true;

    try {
      await newWidget(widget);
    } finally {
      e.target.disabled = false;
    }
  }

  if (isFetching || !editingWidget) {
    return <div>Loading</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  const { definition, title, tags } = editingWidget;

  return (
    <div className="page create-widget-page">
      <h2 className="section-title">Create new widget</h2>

      <div className="create-widget-container">
        <div className="create-widget-section">
          <WidgetEditor
            onChange={(d) => updateWidget("definition", d)}
            definition={definition}
          />

          <form className="create-widget-helper">
            <div className="field">
              <label className="label">Title</label>
              <div className="control">
                <input
                  type="text"
                  className="input"
                  placeholder="Enter widget title"
                  value={title}
                  onChange={(e) => updateWidget("title", e.target.value)}
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
                onChange={(e) =>
                  updateWidget("tags", e.target.value.split(","))
                }
              />
            </div>
            <hr />
            <button type="button" onClick={onSaveClick} className="button">
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

export default EditWidgetPage;
