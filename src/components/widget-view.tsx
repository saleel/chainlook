import { fetchDataForWidget } from "../data/api";
import usePromise from "../hooks/use-promise";
import Chart from "./widgets/chart";
import Table from "./widgets/table";
import Text from "./widgets/text";
import Metric from "./widgets/metric";
import PieChart from "./widgets/pie-chart";
import Widget from "../domain/widget";

function WidgetView(props: { widget: Widget }) {
  const { widget } = props;

  const [data, { isFetching, error }] = usePromise(
    () => fetchDataForWidget(widget.definition, {}),
    {
      dependencies: [widget.definition],
      conditions: [widget && widget.definition],
    }
  );

  if (isFetching) {
    return <div className="widget p-4">Loading</div>;
  }

  if (error) {
    return <div className="widget p-4">Error while fetching data: {error.message}</div>;
  }

  if (widget?.definition?.data && !data) {
    return <div className="widget p-4">No data</div>;
  }

  const { title, definition, tags } = widget || {};

  // eslint-disable-next-line no-inner-declarations
  function renderWidget() {
    try {
      if (error) throw error;

      if (definition.type === "text") {
        return <Text config={definition.text} />;
      }

      if (definition.type === "chart") {
        return <Chart data={data} config={definition.chart} />;
      }

      if (definition.type === "pieChart") {
        return <PieChart data={data} config={definition.pieChart} />;
      }

      if (definition.type === "table") {
        return <Table data={data} config={definition.table} />;
      }

      if (definition.type === "metric") {
        return <Metric data={data} config={definition.metric} />;
      }

      return null;
    } catch {
      return (
        <>
          <div>Error rendering Widget</div>
          {error.message}
        </>
      );
    }
  }

  if (!definition) {
    return null;
  }

  return (
    <div className={`widget widget-${definition.type}`}>
      <div className="widget-header">
        <h4 className="widget-title">{title}</h4>
        <div className="is-flex">
          <div className="widget-tags">{tags?.join(', ')}</div>
        </div>
      </div>
      
      <div className="widget-body">{renderWidget()}</div>
    </div>
  );
}

export default WidgetView;
