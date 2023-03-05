import { applyFormatting } from '../../data/modifiers/formatters';
import { WidgetDefinition } from '../../domain/widget';

type Props = {
  data: any[];
  config: WidgetDefinition['metric'];
};

function Metric(props: Props) {
  try {
    const { data, config } = props;

    const { dataKey, unit, format } = config!;

    let value = Array.isArray(data) ? data[0]?.[dataKey] : data[dataKey];
    if (format) {
      value = applyFormatting(value, format);
    }

    return (
      <div className='metric'>
        <div className='metric-value'>{value}</div>
        <div className='metric-unit'>{unit}</div>
      </div>
    );
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
}

export default Metric;
