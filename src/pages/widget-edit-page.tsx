import React from 'react';
import { Link, useParams } from 'react-router-dom';
import WidgetView from '../components/widget-view';
import { getAllWidgets, saveWidgetLocally } from '../data/store';
import { getWidget, newWidget, publishToIPFS as saveWidget } from '../data/api';
import usePromise from '../hooks/use-promise';
import { fetchDataFromHTTP } from '../data/utils/network';
import WidgetEditor from '../components/widget-editor';

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
  const { widgetId } = useParams();
  const isNewWidgetMode = widgetId === 'new';

  const [isFetchingExample, setIsFetchingExample] = React.useState(false);
  const [widgetTitle, setWidgetTitle] = React.useState('');
  const [widgetTags, setWidgetTags] = React.useState([]);
  const [widgetDefinition, setWidgetDefinition] = React.useState({});

  React.useEffect(() => {
    (async() => {

    })
    if (!isNewWidgetMode) {
      const widget = await getWidget(widgetId);
      setWidgetTitle(widget.title);
      setWidgetTags(widget.tags);
      return widget.definition;
    }
  }, [widgetId]);

  React.useEffect(() => {
    document.title = 'New Widget - ChainLook';
  }, []);


  // async function onChangeExample(url) {
  //   setIsFetchingExample(true);

  //   try {
  //     const config = await fetchDataFromHTTP({ url });
  //     if (config) {
  //       setValidWidgetConfig(config);
  //       setWidgetJson(JSON.stringify(config, null, 2));
  //     }
  //   } catch (e) {
  //     // eslint-disable-next-line no-console
  //     console.error(e);
  //   }

  //   setIsFetchingExample(false);
  // }

          {/*
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
        </div> */}

  async function onSaveClick(e) {
    e.target.disabled = true;

    await saveWidgetLocally(validWidgetConfig);
    await newWidget({ title: widgetTitle, tags: widgetTags.split(',').filter(Boolean), definition: validWidgetConfig });

    e.target.disabled = false;
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
{/* 
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
        </div> */}

        {!isFetchingExample && (
          <>
            <div className="create-widget-section">
              <WidgetEditor 

              <div className="create-widget-helper">

                <form>
                  <div className="field">
                    <label className="label">Title</label>
                    <div className="control">
                      <input
                        type="text"
                        className="input"
                        placeholder="Enter widget title"
                        value={widgetTitle}
                        onChange={(e) => setWidgetTitle(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Tags</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Enter tags separated by comma"
                      value={widgetTags}
                      onChange={(e) => setWidgetTags(e.target.value)}
                    />
                  </div>

                  <hr />

                  <button type="button" onClick={onSaveClick} className="button">
                    Save
                  </button>
                </form>

              </div>
            </div>

            <hr />

            <div className="create-widget-preview">
              <div className="section-title">
                Preview
              </div>

              <WidgetView config={validWidgetConfig} />
            </div>
          </>
        )}

      </div>

    </div>
  );
}

export default NewWidgetPage;
