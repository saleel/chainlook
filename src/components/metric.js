import formatters from '../helpers/formatters';

function Metric(props) {
  const {
    data, config,
  } = props;

  const { dataKey, unit, transform } = config;

  let value = Array.isArray(data) ? data[0]?.[dataKey] : data[dataKey];
  if (transform) {
    value = formatters[transform](value);
  }

  return (
    <div className="metric">
      <div className="metric-value">{value}</div>
      <div className="metric-unit">{unit}</div>
    </div>
  );
}

export default Metric;
