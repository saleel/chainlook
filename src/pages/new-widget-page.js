import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useDebouncedCallback } from 'use-debounce';
import { Link } from 'react-router-dom';
import Widget from '../components/widget';
import { getAllWidgets, saveWidgetLocally } from '../data/store';
import { getWidget, publishToIPFS } from '../data/api';
import usePromise from '../hooks/use-promise';
import { fetchDataFromHTTP } from '../data/utils/network';

const examples = [{
  title: 'Line Chart - Uniswap usage trend',
  url: '../examples/widget-line-chart-uniswap-usage.json',
}, {
  title: 'Table - Uniswap top pools (incl. grouping)',
  url: '../examples/widget-table-uniswap-top-pools.json',
}, {
  title: 'Area Chart - Uniswap daily volume',
  url: '../examples/widget-area-uniswap-daily-volume.json',
}, {
  title: 'Metric - Uniswap total pools',
  url: '../examples/widget-metric-uniswap-pools.json',
}, {
  title: 'Bar Chart - Data from IPFS (json)',
  url: '../examples/widget-bar-chart-ipfs.json',
}, {
  title: 'Table - Data from Tableland',
  url: '../examples/widget-table-tableland.json',
}];

function NewWidgetPage() {
  const fromId = new URL(window.location.toString().replace('/#/', '/')).searchParams?.get('fromId');

  const [isFetchingExample, setIsFetchingExample] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [widgetJson, setWidgetJson] = React.useState();
  const [validWidgetConfig, setValidWidgetConfig] = React.useState({});

  const [defaultWidgetConfig, { isFetching, error }] = usePromise(async () => {
    if (fromId) {
      return getWidget(fromId);
    }

    // Load most recent local widget
    const localWidgets = await getAllWidgets();
    if (localWidgets.length > 0) {
      return localWidgets[localWidgets.length - 1];
    }

    // Load example
    return fetchDataFromHTTP(examples[0].url);
  }, {
    dependencies: [fromId],
    conditions: [],
  });

  React.useEffect(() => {
    setValidWidgetConfig(defaultWidgetConfig);
    setWidgetJson(JSON.stringify(defaultWidgetConfig, null, 2));
  }, [defaultWidgetConfig]);

  React.useEffect(() => {
    document.title = 'New Widget - ChainLook';
  }, []);

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

  async function onChangeExample(url) {
    setIsFetchingExample(true);

    try {
      const config = await fetchDataFromHTTP({ url });
      if (config) {
        setValidWidgetConfig(config);
        setWidgetJson(JSON.stringify(config, null, 2));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }

    setIsFetchingExample(false);
  }

  async function onPublishClick(e) {
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

        <div className="new-widget-example mb-4">
          <label htmlFor="example" className="mr-3">Load an example:</label>

          <select
            name="example"
            id="example"
            onChange={(e) => onChangeExample(e.target.value)}
          >
            <option value="select">Select</option>
            {examples.map((example) => (
              <option key={example.title} value={example.url}>{example.title}</option>
            ))}
          </select>
        </div>

        {!isFetchingExample && (
          <>
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
                        schema: '/schemas/widget.json',
                      }],
                    });
                  }}
                />
                <a className="view-schema link" href="/schema/widget.json" target="_blank">
                  View Schema
                </a>
              </div>

              <div className="create-widget-helper">

                <button type="button" onClick={onPublishClick} className="button">
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
          </>
        )}

      </div>

    </div>
  );
}

export default NewWidgetPage;
