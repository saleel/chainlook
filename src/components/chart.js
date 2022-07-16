import {
  Line, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Area,
} from 'recharts';
import formatters from '../helpers/formatters';

const COLORS = ['var(--blue-500)', 'var(--green-300)', 'var(--yellow-500)'];

function Chart(props) {
  const {
    data = [], config: {
      xAxis, yAxis, lines = {}, areas = {}, bars = {},
    },
  } = props;

  return (
    <ResponsiveContainer>
      <ComposedChart
        data={data}
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

        {Object.entries(areas).map(([key, params], i) => (
          <Area
            key={key}
            name={params.label || key}
            type="monotone"
            dataKey={key}
            fill={COLORS[i]}
            legendType="none"
          />
        ))}

        {Object.entries(lines).map(([key, params], i) => (
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

        {Object.entries(bars).map(([key, params], i) => (
          <Bar
            key={key}
            name={params.label || key}
            type="monotone"
            dataKey={key}
            legendType="none"
            fill={COLORS[i]}
          />
        ))}

      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default Chart;
