/* eslint-disable react/no-array-index-key */
import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useDebouncedCallback } from 'use-debounce';
import widgetSchema from '../schema/widget.json';
import Widget from '../components/widget';
import defaultJson from '../examples/widget.json';

function NewWidgetPage() {
  const [widgetJson, setWidgetJson] = React.useState(JSON.stringify(defaultJson, null, 2));
  const [validWidgetConfig, setValidWidgetConfig] = React.useState(defaultJson);

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

  return (
    <div className="page create-widget-page">
      <h2 className="dashboard-title">
        Create new widget
      </h2>

      <div className="create-widget-container">

        <div className="create-widget-preview">
          <Widget config={validWidgetConfig} />
        </div>

        <div className="create-widget-editor">
          <MonacoEditor
            width="100%"
            height="40vh"
            language="json"
            theme="vs-light"
            value={widgetJson}
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

      </div>

    </div>
  );
}

export default NewWidgetPage;
