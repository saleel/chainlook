import {
  Line, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatters } from '../helpers/formatters';

const COLORS = ['var(--blue-500)', 'var(--green-300)', 'var(--yellow-500)'];

function Chart(props) {
  const {
    data = [], config: { xAxis, yAxis, dataKeys }
  } = props;


  return (
    <ResponsiveContainer>
      <ComposedChart
        data={data}
        margin={{
          top: 5, right: 5, left: -15, bottom: 0,
        }}
      >
        <XAxis
          dataKey={xAxis.key}
          {...xAxis.transform && { tickFormatter: formatters[xAxis.transform] }}
        />

        <YAxis
          {...yAxis.transform && { tickFormatter: formatters[yAxis.transform] }}
          domain={['auto', 'auto']}
        />

        <Tooltip
          {...xAxis.transform && { labelFormatter: formatters[xAxis.transform] }}
          {...yAxis.transform && { formatter: formatters[yAxis.transform] }}
        />

        {Object.entries(dataKeys).map(([key, params], i) => (
          <Line
            key={key}
            name={params.label || key}
            type="monotone"
            strokeLinecap="round"
            strokeWidth={2}
            dataKey={key}
            stroke={COLORS[i]}
            dot={false}
            legendType="none"
          />
        ))}

      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default Chart;
