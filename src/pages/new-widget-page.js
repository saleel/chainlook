/* eslint-disable react/no-array-index-key */
import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useDebouncedCallback } from 'use-debounce';
import { Link } from 'react-router-dom';
import widgetSchema from '../schema/widget.json';
import Widget from '../components/widget';
import defaultJson from '../examples/widget.json';
import { publishWidgetToIPFS, saveWidgetLocally } from '../data-service';

function NewWidgetPage() {
  const [widgetJson, setWidgetJson] = React.useState(JSON.stringify(defaultJson, null, 2));
  const [validWidgetConfig, setValidWidgetConfig] = React.useState(defaultJson);
  const [publishedWidgetCID, setPublishedWidgetCID] = React.useState();

  const debounced = useDebouncedCallback(
    (newJson) => {
      try {
        setValidWidgetConfig(JSON.parse(newJson));
      } catch (e) {
        // Ignore
      }
    },
    500,
  );

  async function onPublishToIPFSClick() {
    const widgetCID = await publishWidgetToIPFS(validWidgetConfig);
    setPublishedWidgetCID(widgetCID);
  }

  async function onSaveLocallyClick() {
    await saveWidgetLocally(validWidgetConfig);
  }

  let message;
  if (publishedWidgetCID) {
    message = (
      <>
        Widget published to IPFS.
        {' '}
        <Link to={`/widget/${publishedWidgetCID}`}>View</Link>
      </>
    );
  }

  return (
    <div className="page create-widget-page">
      <h2 className="dashboard-title">
        Create new widget
      </h2>

      <div className="create-widget-container">

        <div className="create-widget-section">
          <div className="create-widget-editor">
            <MonacoEditor
              width="100%"
              height="100%"
              language="json"
              theme="vs-light"
              value={widgetJson}
              options={{
                minimap: {
                  enabled: false,
                },
              }}
              onChange={(newValue) => {
                setWidgetJson(newValue);
                debounced(newValue);
              }}
              editorWillMount={(monaco) => {
                monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                  validate: true,
                  schemas: [{
                    fileMatch: ['*'],
                    schema: widgetSchema,
                  }],
                });
              }}
            />
          </div>

          <div className="create-widget-helper">

            <button type="button" onClick={onPublishToIPFSClick} className="button">
              Publish
            </button>

            <button type="button" onClick={onSaveLocallyClick} className="button">
              Save Locally
            </button>

            {message && (
              <div className="message">
                {message}
              </div>
            )}

          </div>
        </div>

        <hr />

        <div className="create-widget-preview">
          <div className="section-title">
            Preview
          </div>

          <Widget config={validWidgetConfig} />
        </div>

      </div>

    </div>
  );
}

export default NewWidgetPage;
