import API from "../data/api";
import usePromise from "../hooks/use-promise";
import Chart from "./widgets/chart";
import Table from "./widgets/table";
import Metric from "./widgets/metric";
import PieChart from "./widgets/pie-chart";
import Widget from "../domain/widget";
import { Link } from "react-router-dom";
import {
  IoPersonOutline,
  IoPricetagOutline,
  IoOpenOutline,
} from "react-icons/io5";

function WidgetView(props: { widget: Widget }) {
  const { widget } = props;

  const [data, { isFetching, error }] = usePromise(
    () => API.fetchDataForWidget(widget.definition, {}),
    {
      dependencies: [widget.definition],
      conditions: [widget && widget.definition],
    }
  );

  if (isFetching) {
    return <div className="widget p-4">Loading</div>;
  }

  if (error) {
    return (
      <div className="widget p-4">
        Error while fetching data: {error.message}
      </div>
    );
  }

  if (widget?.definition?.data && !data) {
    return <div className="widget p-4">No data</div>;
  }

  const { title, definition, tags } = widget || {};

  // eslint-disable-next-line no-inner-declarations
  function renderWidget() {
    try {
      if (error) throw error;

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

  const author = widget?.user?.username || "";
  const isWidgetPage = window.location.toString().includes(widget.id);

  return (
    <div className={`widget widget-${definition.type}`}>
      <div className="widget-header">

        <div className="is-flex">
          <h4 className="widget-title">
            <span>{widget?.title || "Untitled"}</span>
          </h4>

          {!isWidgetPage && (
            <Link
              to={`/widgets/${widget?.id}`}
              target="_blank"
              className="ml-3 widget-info-item"
              data-tooltip="Open the widget in a new page"
            >
              <IoOpenOutline size={18} />
            </Link>
          )}
        </div>

        <div className="is-flex">
          {tags?.length > 0 && (
            <div
              data-tooltip={`Tags: ${tags.join(", ")}`}
              className="mr-3 widget-info-item"
            >
              <IoPricetagOutline size={18} />
            </div>
          )}

          {author && (
            <div
              data-tooltip={`Created by ${author}`}
              className="mr-1 widget-info-item"
            >
              <IoPersonOutline size={18} />
            </div>
          )}
        </div>

      </div>

      <div className="widget-body">{renderWidget()}</div>
    </div>
  );
}

export default WidgetView;
