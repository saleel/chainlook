import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import Modal from './modal';
import { fetchDataFromHTTP } from '../data/utils/network';
import usePromise from '../hooks/use-promise';
import API from '../data/api';
import { getQueriesAndFieldsFromGraphQlSchema } from '../data/utils/graphql';
import { enrichWidgetSchema } from '../data/utils/schema';

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new jsonWorker();
    }
    return new editorWorker();
  },
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

const examples = [
  {
    title: 'Line Chart - Uniswap usage trend',
    url: '../examples/widget-line-chart-uniswap-usage.json',
  },
  {
    title: 'Table - Uniswap top pools (incl. grouping)',
    url: '../examples/widget-table-uniswap-top-pools.json',
  },
  {
    title: 'Area Chart - Uniswap daily volume',
    url: '../examples/widget-area-uniswap-daily-volume.json',
  },
  {
    title: 'Metric - Uniswap total pools',
    url: '../examples/widget-metric-uniswap-pools.json',
  },
  {
    title: 'Bar Chart - Data from IPFS (json)',
    url: '../examples/widget-bar-chart-ipfs.json',
  },
  {
    title: 'Table - Data from Tableland',
    url: '../examples/widget-table-tableland.json',
  },
];

const isMacOS = navigator.userAgent.indexOf('Mac OS X') !== -1;
const ctrlBtnName = isMacOS ? 'Cmd' : 'Ctrl';
const saveButtonLabel = `${ctrlBtnName} + S`;

function formatJson(obj: object) {
  return JSON.stringify(obj, null, 2);
}

// Set JSON schema to the editor
function setWidgetSchemaInEditor(schema: object) {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    enableSchemaRequest: true,
    allowComments: false,
    schemas: [
      // @ts-ignore : uri is required but its not needed when schema is provided
      {
        fileMatch: ['*'],
        schema,
      },
    ],
  });
}

function WidgetEditor(props: { definition: object; onChange: (d: object) => void }) {
  const { definition, onChange } = props;

  const [examplesModalOpen, setExamplesModalOpen] = React.useState<boolean>(false);
  const [dataSource, setDataSource] = React.useState<any>({});
  const [dataSources, setDataSources] = React.useState<any[]>([]);

  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor>();
  const localDefinitionRef = React.useRef(definition);
  const enrichedWidgetSchemaRef = React.useRef<any>({});

  const [widgetSchema] = usePromise(() => API.getWidgetSchema());

  // Set default definition
  React.useEffect(() => {
    if (definition) {
      editorRef.current!.setValue(formatJson(definition));
    }
  }, []);

  // Update editor when definition from parent changes
  React.useEffect(() => {
    if (localDefinitionRef.current !== definition) {
      editorRef.current!.setValue(formatJson(definition));
      localDefinitionRef.current = definition;
    }
  }, [definition]);

  // Set JSON schema to the editor
  React.useEffect(() => {
    if (!widgetSchema) return;

    // Add formatter, transforms, etc.
    enrichedWidgetSchemaRef.current = enrichWidgetSchema(widgetSchema);

    (async () => {
      const currSchema = enrichedWidgetSchemaRef.current;

      // Only one data source
      if (dataSource && dataSource.subgraphId) {
        const { subgraphId, entity } = dataSource;

        const subgraphSchema = await API.getSubgraphSchema(subgraphId);
        const subgraphQueries = getQueriesAndFieldsFromGraphQlSchema(subgraphSchema);

        // Set options for query
        currSchema.$defs.dataSource.properties.entity.enum = Object.keys(subgraphQueries);

        const fieldNames = (subgraphQueries[entity] || []).map((s) => s.name);
        const orderByFields = (subgraphQueries[entity] || []).map((s) => s.nameForFilter);

        // Set fields names
        currSchema.$defs.field.enum = fieldNames;
        currSchema.$defs.dataSource.properties.orderBy.enum = orderByFields;
      }

      // Has multiple data sources
      if (dataSources) {
        let fieldNames: string[] = []; // to store fields from all data sources

        for (const [sourceName, source] of Object.entries(dataSources)) {
          const { subgraphId, entity } = source;

          const subgraphSchema = await API.getSubgraphSchema(subgraphId);
          const subgraphQueries = getQueriesAndFieldsFromGraphQlSchema(subgraphSchema);

          // Field name should be prefixed with data source name
          const fieldsInSelectedQuery = (subgraphQueries[entity] || []).map(
            (s) => `${sourceName}.${s.name}`,
          );
          fieldNames = fieldNames.concat(fieldsInSelectedQuery);
        }

        currSchema.$defs.field.enum = fieldNames;
      }

      setWidgetSchemaInEditor(currSchema);
    })();
  }, [widgetSchema, dataSource.subgraphId, dataSource.entity, dataSources]);

  async function onChangeExample(url: string) {
    const definition = await fetchDataFromHTTP({ url });
    const formatted = formatJson(definition);

    editorRef.current!.setValue(formatted);
    updateDefinition();

    setExamplesModalOpen(false);
  }

  function updateDefinition() {
    editorRef.current!.trigger('manual', 'editor.action.formatDocument', null);

    const model = editorRef.current!.getModel();
    const markers = monaco.editor.getModelMarkers({ resource: model!.uri });
    const isValid = markers.length === 0;

    if (!isValid) {
      window.alert(
        'There seems to be an error in your widget definition. Please fix it before running it.',
      );
      return;
    }

    const def = editorRef.current!.getValue();
    const parsed = JSON.parse(def);

    localDefinitionRef.current = parsed;
    onChange(parsed);
  }

  return (
    <div className='create-widget-editor'>
      <MonacoEditor
        width='100%'
        height='100%'
        language='json'
        theme='vs-light'
        options={{
          fontSize: 13,
          minimap: {
            enabled: false,
          },
        }}
        editorDidMount={(_editor) => {
          _editor.getModel()!.updateOptions({ tabSize: 2 });
          _editor.focus();

          _editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, updateDefinition);

          editorRef.current = _editor;
        }}
        onChange={(v) => {
          try {
            const parsed = JSON.parse(v);
            setDataSource(parsed.data.source);
            setDataSources(parsed.data.sources);
          } catch (e) {
            // Do nothing
          }
        }}
      />

      <div className='widget-editor-links'>
        <button className='link mr-3' onClick={() => setExamplesModalOpen(true)}>
          Load Example
        </button>
        {/* <a className='link' href={widgetSchema} target='_blank'>
          View Schema
        </a> */}
      </div>

      <div className='widget-editor-run'>
        <button className='button is-normal' onClick={updateDefinition}>
          Run
          <span>({saveButtonLabel})</span>
        </button>
      </div>

      <Modal
        isOpen={examplesModalOpen}
        title='Load an example'
        height='200px'
        onRequestClose={() => setExamplesModalOpen(false)}
      >
        <div className='new-widget-example mb-4'>
          <label htmlFor='example' className='mr-3'>
            Example:
          </label>

          <select name='example' id='example' onChange={(e) => onChangeExample(e.target.value)}>
            <option value='select'>Select</option>
            {examples.map((example) => (
              <option key={example.title} value={example.url}>
                {example.title}
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
}

export default WidgetEditor;
