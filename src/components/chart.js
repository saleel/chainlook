import {
  Line, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, Area,
} from 'recharts';
import formatters from '../helpers/formatters';

const COLORS = ['var(--blue-500)', 'var(--green-300)', 'var(--yellow-500)'];

function Chart(props) {
  const {
    data = [], config: {
      xAxis, yAxis, lines = [], areas = [], bars = [],
    },
  } = props;

  return (
    <ResponsiveContainer>
      <ComposedChart
        data={data}
      >
        <XAxis
          dataKey={xAxis.dataKey}
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

        {areas.map((area, i) => (
          <Area
            key={area.dataKey}
            name={area.label || area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            fill={COLORS[i]}
            legendType="none"
          />
        ))}

        {lines.map((line, i) => (
          <Line
            key={line.dataKey}
            name={line.label || line.dataKey}
            type="monotone"
            strokeLinecap="round"
            strokeWidth={2}
            dataKey={line.dataKey}
            stroke={COLORS[i]}
            dot={false}
            legendType="none"
          />
        ))}

        {bars.map((bar, i) => (
          <Bar
            key={bar.dataKey}
            name={bar.label || bar.dataKey}
            type="monotone"
            dataKey={bar.dataKey}
            legendType="none"
            fill={COLORS[i]}
          />
        ))}

      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default Chart;
