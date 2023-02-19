import React from 'react';
import set from 'lodash/set';
import get from 'lodash/get';
import { MultiSelect } from 'react-multi-select-component';
import API from '../data/api';
import { getQueriesFromGraphQlSchema, getReturnEntityForQuery } from '../data/utils/graphql';
import usePromise from '../hooks/use-promise';
import { WidgetDefinition } from '../domain/widget';

const DEFAULT_DEFINITION: Partial<WidgetDefinition> = {
  data: {
    source: {
      provider: 'graph',
      subgraphId: '',
      entity: '',
    },
  },
};

type WidgetWizardProps = {
  onSubmit: (widget: WidgetDefinition) => void;
};

function WidgetWizard(props: WidgetWizardProps) {
  const { onSubmit } = props;

  const [widgetDefinition, setWidgetDefinition] = React.useState(DEFAULT_DEFINITION);

  const subgraphId = widgetDefinition?.data?.source.subgraphId ?? 'as';

  const [schema, { isFetching }] = usePromise(() => API.getSubgraphSchema(subgraphId), {
    conditions: [subgraphId],
    dependencies: [subgraphId],
  });

  const widgetType = widgetDefinition?.type ?? '';
  const selectedEntityName = widgetDefinition?.data?.source.entity ?? '';
  const entities = getQueriesFromGraphQlSchema(schema);
  const selectedEntity = getReturnEntityForQuery(schema, selectedEntityName);

  function onFormSubmit(e: any) {
    e.preventDefault();
    onSubmit(widgetDefinition as WidgetDefinition);
  }

  function updateWidgetDefinition(path: string, value: any) {
    setWidgetDefinition((e) => {
      return set({ ...e }, path, value);
    });
  }

  function renderFieldSelector(label: string, path: string) {
    const fields = selectedEntity.fields as { name: string }[];
    const value = get(widgetDefinition, path, '');
    const onChange = (e) => updateWidgetDefinition(path, e.target.value);

    return (
      <div className='field mb-5'>
        <label className='label'>{label}</label>

        <div className='select'>
          <select onChange={onChange} value={value}>
            <option>Select</option>
            {fields.map((field) => (
              <option key={field.name} value={field.name}>
                {field.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  function renderMultiFieldSelector(label: string, path: string, keyName: string) {
    const fields = selectedEntity.fields as { name: string }[];
    const value = get(widgetDefinition, path, []).map((s: any) => ({
      label: s[keyName],
      value: s[keyName],
    }));
    const onChange = (values: any[]) =>
      updateWidgetDefinition(
        path,
        values.map((v) => ({ [keyName]: v.value })),
      );

    return (
      <div className='field mb-5'>
        <label className='label'>{label}</label>
        <MultiSelect
          options={fields.map((f) => ({ label: f.name, value: f.name }))}
          value={value}
          onChange={onChange}
          hasSelectAll={false}
          labelledBy={label}
          overrideStrings={{
            selectSomeItems: 'Select fields to be rendered as ' + label.toLowerCase(),
          }}
        />
      </div>
    );
  }

  return (
    <div className='widget-wizard h-100'>
      <form className='is-flex is-flex-direction-column is-justify-content-space-between h-100' onSubmit={onFormSubmit}>
        <div>
          <div className='field mb-5'>
            <label className='label'>Subgraph ID</label>
            <div className='control'>
              <input
                type='text'
                className='input'
                value={subgraphId}
                placeholder='Enter Subgraph ID to query - Hosted service or Decentralized network'
                onChange={(e) => updateWidgetDefinition('data.source.subgraphId', e.target.value)}
              />
            </div>
          </div>

          {isFetching && <div>Loading...</div>}

          {!isFetching && subgraphId && entities && (
            <div className='columns'>
              <div className='column is-one-third'>
                <div className='field'>
                  <label className='label'>Entity / Query</label>
                  <div className='select'>
                    <select
                      onChange={(e) => updateWidgetDefinition('data.source.entity', e.target.value)}
                      value={selectedEntityName}
                    >
                      <option>Select</option>
                      {entities.map((entity: any) => (
                        <option key={entity.name} value={entity.name}>
                          {entity.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {selectedEntity && (
                <>
                  <div className='column' style={{ marginBottom: '-2rem' }}>
                    {renderFieldSelector('Order by', 'data.source.orderBy')}
                  </div>

                  <div className='column'>
                    <div className='field'>
                      <label className='label'>Order direction</label>
                      <div className='select'>
                        <select
                          onChange={(e) => updateWidgetDefinition('data.source.orderDirection', e.target.value)}
                          value={widgetDefinition?.data?.source.orderDirection ?? ''}
                        >
                          <option>Select</option>
                          <option key={'asc'} value={'asc'}>
                            Ascending
                          </option>
                          <option key={'desc'} value={'desc'}>
                            Descending
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className='column'>
                    <div className='field'>
                      <label className='label'>Limit</label>
                      <div className='control'>
                        <input
                          type='number'
                          className='input'
                          value={widgetDefinition?.data?.source.limit ?? ''}
                          placeholder='Number of items'
                          onChange={(e) => updateWidgetDefinition('data.source.limit', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {selectedEntity && <hr />}

          {selectedEntity && (
            <div className='field mb-5'>
              <label className='label'>Widget type</label>
              <div className='select'>
                <select onChange={(e) => updateWidgetDefinition('type', e.target.value)} value={widgetType}>
                  <option value=''>Select</option>
                  <option value='table'>Table</option>
                  <option value='metric'>Metric (Display a single key metric)</option>
                  <option value='chart'>Chart (Line chart, Bar chart, Area Chart)</option>
                  <option value='pieChart'>Pie Chart</option>
                </select>
              </div>
            </div>
          )}

          {widgetType === 'chart' && (
            <>
              {renderFieldSelector('X Axis', 'chart.xAxis.dataKey')}
              {renderMultiFieldSelector('Lines', 'chart.lines', 'dataKey')}
              {renderMultiFieldSelector('Bars', 'chart.bars', 'dataKey')}
              {renderMultiFieldSelector('Areas', 'chart.areas', 'dataKey')}
            </>
          )}

          {widgetType === 'pieChart' && (
            <>
              {renderFieldSelector('Name Key', 'pieChart.nameKey')}
              {renderFieldSelector('Data Key', 'pieChart.dataKey')}
            </>
          )}

          {widgetType === 'table' && renderMultiFieldSelector('Columns', 'table.columns', 'dataKey')}

          {widgetType === 'metric' && renderFieldSelector('Data Key', 'metric.dataKey')}
        </div>

        <button type='submit' className='button is-normal mt-5' disabled={!selectedEntity}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default WidgetWizard;
