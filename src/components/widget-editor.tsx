import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useDebouncedCallback } from 'use-debounce';

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

function WidgetEditor(props) {
  const { definition, onChange } = props;

  const [widgetJson, setWidgetJson] = React.useState();

  React.useEffect(() => {
    setWidgetJson(JSON.stringify(definition, null, 2));
  }, [definition]);

  const debounced = useDebouncedCallback(
    (newJson) => {
      try {
        onChange(JSON.parse(newJson));
      } catch (e) {
        // Ignore
      }
    },
    500,
  );

  return (
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
            enableSchemaRequest: true,
            schemas: [{
              fileMatch: ['*'],
              uri: 'https://chainlook.xyz/schemas/widget.json',
            }],
          });
        }}
      />
      <a className="view-schema link" href="/schemas/widget.json" target="_blank">
        View Schema
      </a>
    </div>
  );
}

export default WidgetEditor;
