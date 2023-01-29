import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import { useDebouncedCallback } from 'use-debounce';
import Modal from './modal';
import { fetchDataFromHTTP } from '../data/utils/network';

// @ts-ignore
self.MonacoEnvironment = {
	getWorker(_: any, label: string) {
		if (label === 'json') {
			return new jsonWorker();
		}
		return new editorWorker();
	}
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

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


function WidgetEditor(props: { definition: object, onChange: (d: object) => void}) {
  const { definition, onChange } = props;

  const [widgetJson, setWidgetJson] = React.useState<string>();
  const [examplesModalOpen, setExamplesModalOpen] = React.useState<boolean>(false);

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

  async function onChangeExample(url: string) {
      const definition = await fetchDataFromHTTP({ url });
      if (definition) {
        onChange(definition);
      }
      setExamplesModalOpen(false)
  }


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
              uri: `${window.origin}/schemas/widget.json`,
            }],
          });
        }}
      />

      <div className='widget-editor-links'>
        <button className="link mr-3" onClick={() => setExamplesModalOpen(true)}>
          Load Example
        </button>
        <a className="link" href="/schemas/widget.json" target="_blank">
          View Schema
        </a>
      </div>

      <Modal isOpen={examplesModalOpen} title="Load an example" height="200px" onRequestClose={() => setExamplesModalOpen(false)}>
        <div className="new-widget-example mb-4">
          <label htmlFor="example" className="mr-3">Example:</label>

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
      </Modal>

    </div>
  );
}

export default WidgetEditor;
