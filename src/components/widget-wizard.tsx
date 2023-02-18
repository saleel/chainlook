import React from "react";
import set from "lodash/set";
import API from "../data/api";
import {
  getQueriesFromGraphQlSchema,
  getReturnEntityForQuery,
} from "../data/utils/graphql";
import usePromise from "../hooks/use-promise";
import { WidgetDefinition } from "../domain/widget";

const DEFAULT_DEFINITION: WidgetDefinition = {
  type: "table",
  data: {
    source: {
      provider: "graph",
      subgraphId: "",
      entity: "",
    },
  },
};

function WidgetWizard(props: { onSubmit: (widget: WidgetDefinition) => void }) {
  const [widgetDefinition, setWidgetDefinition] =
    React.useState<WidgetDefinition>(DEFAULT_DEFINITION);
  const [widgetType, setWidgetType] = React.useState<string>("");

  const subgraphId = widgetDefinition?.data?.source.subgraphId ?? "";

  const [schema] = usePromise(() => API.getSubgraphSchema(subgraphId), {
    conditions: [subgraphId],
    dependencies: [subgraphId],
  });

  const selectedEntityName = widgetDefinition?.data?.source.entity ?? "";
  const entities = getQueriesFromGraphQlSchema(schema);
  const selectedEntity = getReturnEntityForQuery(schema, selectedEntityName);

  function onSubmit(e: any) {
    e.preventDefault();
    props.onSubmit(widgetDefinition);
  }

  function updateWidgetDefinition(path: string, value: any) {
    setWidgetDefinition((e) => {
      return set({ ...e }, path, value);
    });
  }

  function renderFieldSelector(
    label: string,
    value: string,
    onChange: (field: string) => void
  ) {
    return (
      <div className="field mb-5">
        <label className="label">{label}</label>
        <div className="select">
          <select onChange={(e) => onChange(e.target.value)} value={value}>
            <option>Select</option>
            {selectedEntity.fields.map((field: any) => (
              <option key={field.name} value={field.name}>
                {field.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-wizard h-100">
      <form
        className="is-flex is-flex-direction-column is-justify-content-space-between h-100"
        onSubmit={onSubmit}
      >
        <div>
          <div className="field mb-5">
            <label className="label">Widget type</label>
            <div className="select">
              <select
                onChange={(e) => {
                  const _type = e.target.value;
                  setWidgetType(_type);
                  if (_type.startsWith("chart")) {
                    updateWidgetDefinition("type", "chart");
                  } else {
                    updateWidgetDefinition("type", _type);
                  }
                }}
                value={widgetType}
              >
                <option value="">Select</option>
                <option value="table">Table</option>
                <option value="chart.line">Line Chart</option>
                <option value="chart.bar">Bar Chart</option>
                <option value="chart.area">Area Chart</option>
                <option value="pieChart">Pie Chart</option>
                <option value="metric">Metric</option>
              </select>
            </div>
          </div>

          <div className="field mb-5">
            <label className="label">Subgraph ID</label>
            <div className="control">
              <input
                type="text"
                className="input"
                value={subgraphId}
                placeholder="Enter Subgraph ID to query"
                onChange={(e) =>
                  updateWidgetDefinition(
                    "data.source.subgraphId",
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {subgraphId && entities && (
            <div className="field mb-5">
              <label className="label">Entity</label>
              <div className="select">
                <select
                  onChange={(e) =>
                    updateWidgetDefinition("data.source.entity", e.target.value)
                  }
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
          )}

          {selectedEntity && widgetType.startsWith("chart") && (
            <>
              {renderFieldSelector(
                "X Axis",
                widgetDefinition?.chart?.xAxis?.dataKey ?? "",
                (field) => updateWidgetDefinition("chart.xAxis.dataKey", field)
              )}
              {renderFieldSelector(
                "Y Axis",
                widgetDefinition?.chart?.[`${widgetType.split(".")[1]}s[0]`]
                  ?.dataKey ?? "",
                (field) =>
                  updateWidgetDefinition(
                    `chart.${widgetType.split(".")[1]}s[0].dataKey`,
                    field
                  )
              )}
            </>
          )}

          {selectedEntity && widgetType.startsWith("pieChart") && (
            <>
              {renderFieldSelector(
                "Data Key",
                widgetDefinition?.pieChart?.dataKey ?? "",
                (field) => updateWidgetDefinition("pieChart.dataKey", field)
              )}
              {renderFieldSelector(
                "Name Key",
                widgetDefinition?.pieChart?.nameKey ?? "",
                (field) => updateWidgetDefinition("pieChart.nameKey", field)
              )}
            </>
          )}

          {selectedEntity && widgetType.startsWith("table") && (
            <>
              {renderFieldSelector(
                "Columns",
                widgetDefinition?.chart?.xAxis ?? "",
                (field) => updateWidgetDefinition("chart.xAxis", field)
              )}
            </>
          )}

          {selectedEntity && widgetType.startsWith("metric") && (
            <>
              {renderFieldSelector(
                "Data Key",
                widgetDefinition?.metric?.dataKey ?? "",
                (field) => updateWidgetDefinition("metric.dataKey", field)
              )}
            </>
          )}
        </div>

        <button
          type="submit"
          className="button is-normal mt-5"
          disabled={!selectedEntity}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default WidgetWizard;
