/* eslint-disable react/no-array-index-key */
import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useDebouncedCallback } from 'use-debounce';
import { Link } from 'react-router-dom';
import widgetSchema from '../schema/widget.json';
import Widget from '../components/widget';
import defaultJson from '../examples/widget.json';
import { getWidget, publishWidgetToIPFS, saveWidgetLocally } from '../data-service';
import usePromise from '../hooks/use-promise';

function NewWidgetPage() {
  const fromId = new URL(window.location).searchParams?.get('fromId');

  const [fromWidgetConfig, { isFetching, error }] = usePromise(async () => {
    if (fromId) {
      return getWidget(fromId);
    }

    return defaultJson;
  }, {
    dependencies: [fromId],
    conditions: [],
  });

  const [widgetJson, setWidgetJson] = React.useState();
  const [validWidgetConfig, setValidWidgetConfig] = React.useState(defaultJson);
  const [publishedWidgetCID, setPublishedWidgetCID] = React.useState();

  React.useEffect(() => {
    setValidWidgetConfig(fromWidgetConfig);
    setWidgetJson(JSON.stringify(fromWidgetConfig, null, 2));
  }, [fromWidgetConfig]);

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

  if (isFetching) {
    return (<div>Loading</div>);
  }

  if (error) {
    return (<div>{error.message}</div>);
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
