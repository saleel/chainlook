import {
  ResponsiveContainer, PieChart as RechartPieChart, Pie,
} from 'recharts';
import formatters from '../helpers/formatters';

const COLORS = ['var(--blue-500)', 'var(--green-300)', 'var(--yellow-500)'];

function PieChart(props) {
  const {
    data = [], config: { dataKey, nameKey, transform },
  } = props;

  const formattedData = data.map((d) => ({
    ...d,
    [dataKey]: transform ? Math.round(formatters[transform](d[dataKey])) : Math.round(d[dataKey]),
  }));

  return (
    <ResponsiveContainer>
      <RechartPieChart width={730} height={250}>
        <Pie
          data={formattedData}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={125}
          fill={COLORS[0]}
          label
        />
      </RechartPieChart>
    </ResponsiveContainer>
  );
}

export default PieChart;
