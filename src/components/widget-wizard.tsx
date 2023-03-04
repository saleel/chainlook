import React from 'react';
import set from 'lodash/set';
import get from 'lodash/get';
import { MultiSelect } from 'react-multi-select-component';
import API from '../data/api';
import { getQueriesAndFieldsFromGraphQlSchema } from '../data/utils/graphql';
import usePromise from '../hooks/use-promise';
import { WidgetDefinition } from '../domain/widget';
import { getFormatterForField } from '../data/utils/widget-parsing';

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

  const subgraphId = widgetDefinition?.data?.source.subgraphId ?? '';

  const [subgraphQueries, { isFetching, error }] = usePromise(
    () => API.getSubgraphSchema(subgraphId).then(getQueriesAndFieldsFromGraphQlSchema),
    {
      conditions: [subgraphId],
      dependencies: [subgraphId],
      defaultValue: {},
    },
  );

  const widgetType = widgetDefinition?.type ?? '';
  const selectedEntityName = widgetDefinition?.data?.source.entity ?? '';
  const queryNames = Object.keys(subgraphQueries);
  const fieldsInSelectedQuery = subgraphQueries[selectedEntityName] || [];

  const isValid =
    widgetDefinition?.table?.columns?.length > 0 ||
    widgetDefinition?.chart?.xAxis?.dataKey ||
    widgetDefinition?.pieChart?.dataKey ||
    widgetDefinition?.metric?.dataKey;

  function onFormSubmit(e: any) {
    e.preventDefault();
    onSubmit(widgetDefinition as WidgetDefinition);
    setWidgetDefinition(DEFAULT_DEFINITION);
  }

  function updateWidgetDefinition(path: string, value: any) {
    setWidgetDefinition((e) => {
      return set({ ...e }, path, value);
    });
  }

  function getFormatter(fieldName: string) {
    return getFormatterForField(
      fieldName,
      fieldsInSelectedQuery.find((f) => f.name === fieldName)!.type,
    );
  }

  function renderFieldSelector(label: string, path: string, formatterPath?: string) {
    const value = get(widgetDefinition, path, '');
    const onChange = (e) => {
      const fieldName = e.target.value;
      updateWidgetDefinition(path, fieldName);

      if (formatterPath) {
        const formatter = getFormatter(fieldName);
        if (formatter) {
          updateWidgetDefinition(formatterPath, formatter);
        }
      }
    };

    return (
      <div className='field mb-5'>
        <label className='label'>{label}</label>

        <div className='select'>
          <select onChange={onChange} value={value}>
            <option>Select</option>
            {fieldsInSelectedQuery.map((field) => (
              <option key={field.name} value={field.name}>
                {field.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  function renderMultiFieldSelector(
    label: string,
    path: string,
    keyName: string,
    formatterPath?: string,
  ) {
    const fields = fieldsInSelectedQuery as { name: string }[];
    const value = get(widgetDefinition, path, []).map((s: any) => ({
      label: s[keyName],
      value: s[keyName],
    }));

    const onChange = (values: any[]) => {
      const fieldConfig = [];

      for (const v of values) {
        const { value: fieldName } = v;

        let formatter;
        if (formatterPath && !formatterPath.includes('.')) {
          formatter = getFormatter(fieldName);
        }

        fieldConfig.push({
          [keyName]: v.value,
          ...(formatter && { [formatterPath as string]: formatter }),
        });
      }

      updateWidgetDefinition(path, fieldConfig);

      // If the formatter path is fullPath, update at the exact path instead (used for charts)
      if (formatterPath && formatterPath.includes('.')) {
        const lastField = values[values.length - 1]?.value;
        const formatter = getFormatter(lastField);
        if (formatter) {
          updateWidgetDefinition(formatterPath, formatter);
        }
      }
    };

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
      <form
        className='is-flex is-flex-direction-column is-justify-content-space-between h-100'
        onSubmit={onFormSubmit}
      >
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

          {error && <div>Error: {error.message}</div>}

          {!isFetching && subgraphId && queryNames.length > 0 && (
            <div className='columns'>
              <div className='column is-one-third'>
                <div className='field'>
                  <label className='label'>Entity / Query</label>
                  <div className='select w-100'>
                    <select
                      onChange={(e) => updateWidgetDefinition('data.source.entity', e.target.value)}
                      value={selectedEntityName}
                    >
                      <option>Select</option>
                      {queryNames.map((queryName) => (
                        <option key={queryName} value={queryName}>
                          {queryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {fieldsInSelectedQuery && (
                <>
                  <div className='column is-one-third'>
                    <div className='field'>
                      <label className='label'>Order by</label>

                      <div className='select w-100'>
                        <select
                          onChange={(e) =>
                            updateWidgetDefinition('data.source.orderBy', e.target.value)
                          }
                          value={widgetDefinition?.data?.source?.orderBy}
                        >
                          <option>Select</option>
                          {fieldsInSelectedQuery.map((field) => (
                            <option key={field.nameForFilter} value={field.nameForFilter}>
                              {field.nameForFilter}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className='column is-one-third'>
                    <div className='field'>
                      <label className='label'>Order direction</label>
                      <div className='select w-100'>
                        <select
                          onChange={(e) =>
                            updateWidgetDefinition('data.source.orderDirection', e.target.value)
                          }
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

                  <div className='column is-one-third'>
                    <div className='field'>
                      <label className='label'>Limit</label>
                      <div className='control'>
                        <input
                          type='number'
                          className='input'
                          value={widgetDefinition?.data?.source.limit ?? ''}
                          placeholder='Number of items'
                          onChange={(e) =>
                            updateWidgetDefinition('data.source.limit', Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {fieldsInSelectedQuery.length > 0 && <hr />}

          {fieldsInSelectedQuery.length > 0 && (
            <div className='field mb-5'>
              <label className='label'>Widget type</label>
              <div className='select'>
                <select
                  onChange={(e) => updateWidgetDefinition('type', e.target.value)}
                  value={widgetType}
                >
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
              {renderFieldSelector('X Axis', 'chart.xAxis.dataKey', 'chart.xAxis.format')}
              {renderMultiFieldSelector('Lines', 'chart.lines', 'dataKey', 'chart.yAxis.format')}
              {renderMultiFieldSelector('Bars', 'chart.bars', 'dataKey', 'chart.yAxis.format')}
              {renderMultiFieldSelector('Areas', 'chart.areas', 'dataKey', 'chart.yAxis.format')}
            </>
          )}

          {widgetType === 'pieChart' && (
            <>
              {renderFieldSelector('Name Key', 'pieChart.nameKey')}
              {renderFieldSelector('Data Key', 'pieChart.dataKey', 'pieChart.format')}
            </>
          )}

          {widgetType === 'table' &&
            renderMultiFieldSelector('Columns', 'table.columns', 'dataKey', 'format')}

          {widgetType === 'metric' &&
            renderFieldSelector('Data Key', 'metric.dataKey', 'metric.format')}
        </div>

        <button type='submit' className='button is-normal mt-5' disabled={!isValid}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default WidgetWizard;
