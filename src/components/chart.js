import {
  Line, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const COLORS = ['var(--blue-500)', 'var(--green-300)', 'var(--yellow-500)'];

function Chart(props) {
  const {
    data, xAxisKey, yAxisKeys, xAxisFormatter, yAxisFormatter, yAxisLabels = [],
  } = props;


  return (
    <ResponsiveContainer>
      <ComposedChart
        data={data}
        margin={{
          top: 5, right: 5, left: -15, bottom: 0,
        }}
      >
        <XAxis dataKey={xAxisKey} tickFormatter={xAxisFormatter} />
        <YAxis tickFormatter={yAxisFormatter} domain={['auto', 'auto']} />
        <Tooltip labelFormatter={xAxisFormatter} formatter={yAxisFormatter} />

        {yAxisKeys.map((yAxisKey, i) => (
          <Line
            key={yAxisKey}
            name={yAxisLabels[i] || yAxisKey}
            type="monotone"
            strokeLinecap="round"
            strokeWidth={2}
            dataKey={yAxisKey}
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
