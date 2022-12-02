/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useDebouncedCallback } from 'use-debounce';
import { Link } from 'react-router-dom';
import Widget from '../components/widget';
import templateUniswapTopPoolsTable from '../examples/widget-table-uniswap-top-pools.json';
import templateUniswapUsageLineChart from '../examples/widget-line-chart-uniswap-usage.json';
import templateIPFS from '../examples/widget-bar-chart-ipfs.json';
import templateTableland from '../examples/widget-table-tableland.json';
import templateMetric from '../examples/widget-metric-uniswap-pools.json';
import templateAreaChart from '../examples/widget-area-uniswap-daily-volume.json';
import {
  getAllWidgets, getWidget, publishToIPFS, saveWidgetLocally,
} from '../data-service';
import usePromise from '../hooks/use-promise';
import widgetSchema from '../schema/widget.json';

const templates = [{
  title: 'Line Chart - Uniswap usage trend',
  config: templateUniswapUsageLineChart,
}, {
  title: 'Table - Uniswap top pools (incl. grouping)',
  config: templateUniswapTopPoolsTable,
}, {
  title: 'Area Chart - Uniswap daily volume',
  config: templateAreaChart,
}, {
  title: 'Metric - Uniswap total pools',
  config: templateMetric,
}, {
  title: 'Bar Chart - Data from IPFS (json)',
  config: templateIPFS,
}, {
  title: 'Table - Data from Tableland',
  config: templateTableland,
}];

function NewWidgetPage() {
  const fromId = new URL(window.location.toString().replace('/#/', '/')).searchParams?.get('fromId');

  const defaultJson = templates[0].config;

  const [fromWidgetConfig, { isFetching, error }] = usePromise(async () => {
    if (fromId) {
      return getWidget(fromId);
    }

    const localWidgets = await getAllWidgets();
    if (localWidgets.length > 0) {
      return localWidgets[localWidgets.length - 1];
    }

    return defaultJson;
  }, {
    dependencies: [fromId],
    conditions: [],
  });

  const [message, setMessage] = React.useState();
  const [widgetJson, setWidgetJson] = React.useState();
  const [validWidgetConfig, setValidWidgetConfig] = React.useState(defaultJson);

  React.useEffect(() => {
    document.title = 'New Widget - ChainLook';
  }, []);

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

  async function onPublishToIPFSClick(e) {
    e.target.disabled = true;

    await saveWidgetLocally(validWidgetConfig);
    const widgetCID = await publishToIPFS(validWidgetConfig);

    setMessage(
      <>
        Widget published to IPFS.
        {' '}
        <Link to={`/widget/${widgetCID}`}>View</Link>
      </>,
    );

    e.target.disabled = false;
  }

  async function onSaveLocallyClick() {
    await saveWidgetLocally(validWidgetConfig);

    setMessage(
      <>
        Widget saved locally. You can use it while creating dashboards.
      </>,
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
      <h2 className="section-title">
        Create new widget
      </h2>

      <div className="create-widget-container">

        <div className="new-widget-template mb-4">
          <label htmlFor="template" className="mr-3">Load an example:</label>

          <select
            name="template"
            id="template"
            onChange={(e) => {
              const newConfig = templates[e.target.value]?.config;

              if (newConfig) {
                setValidWidgetConfig(newConfig);
                setWidgetJson(JSON.stringify(newConfig, null, 2));
              }
            }}
          >
            <option value="select">Select</option>
            {templates.map((template, index) => (
              <option key={template.title} value={index}>{template.title}</option>
            ))}
          </select>
        </div>

        <div className="create-widget-section">
          <div className="create-widget-editor">
            <MonacoEditor
              width="100%"
              height="100%"
              language="json"
              theme="vs-light"
              value={widgetJson}
              options={{
                fontSize: 14,
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
            <a className="view-schema link" href="/schema/widget.json" target="_blank">
              View Schema
            </a>
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
