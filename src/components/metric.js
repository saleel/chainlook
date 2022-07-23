import formatters from '../helpers/formatters';

function Metric(props) {
  const {
    data, config,
  } = props;

  const { dataKey, unit, format } = config;

  let value = Array.isArray(data) ? data[0]?.[dataKey] : data[dataKey];
  if (format && typeof formatters[format] === 'function') {
    value = formatters[format](value);
  }

  return (
    <div className="metric">
      <div className="metric-value">{value}</div>
      <div className="metric-unit">{unit}</div>
    </div>
  );
}

export default Metric;
