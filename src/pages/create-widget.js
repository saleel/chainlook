/* eslint-disable react/no-array-index-key */
import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { useParams } from 'react-router-dom';
import widgetSchema from '../schema/widget.json';
import Widget from '../components/widget';
import Text from '../components/text';
import { getDashboard } from '../data-service';
import usePromise from '../hooks/use-promise';

const defaultJson = JSON.stringify(
  {
    title: 'Last 10 days liquidity',
    type: 'table',
    table: {
      columns: [{
        dataKey: 'dailyVolumeETH',
        label: 'Daily Volume',
        transform: 'roundedNumber',
      }, {
        dataKey: 'totalVolumeETH',
        label: 'Total Volume',
        transform: 'roundedNumber',
      },
      ],
    },
    data: {
      subGraphId: 'uniswap/uniswap-v2',
      entity: 'uniswapDayDatas',
      filters: {
        orderDirection: 'desc', orderBy: 'date', skip: 1, first: 20,
      },
    },
  },
  null,
  2,
);

function CreateWidgetPage() {
  const [widgetJson, setWidgetJson] = React.useState(defaultJson);
  const [validWidgetConfig, setValidWidgetConfig] = React.useState(JSON.parse(defaultJson));

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
              console.log(newValue);
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

export default CreateWidgetPage;
