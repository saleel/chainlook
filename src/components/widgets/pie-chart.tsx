import { ResponsiveContainer, PieChart as RechartPieChart, Pie } from 'recharts';
import { applyFormatting } from '../../data/modifiers/formatters';
import { WidgetDefinition } from '../../domain/widget';

const COLORS = ['var(--blue-500)', 'var(--green-300)', 'var(--yellow-500)'];

type Props = {
  data: any[];
  config: WidgetDefinition['pieChart'];
};

function PieChart(props: Props) {
  try {
    const { data = [], config } = props;

    const { dataKey, nameKey, format } = config!;

    const formattedData = data.map((d) => ({
      ...d,
      [dataKey]: format ? applyFormatting(d[dataKey], format) : d[dataKey],
    }));

    return (
      <ResponsiveContainer>
        <RechartPieChart width={730} height={250}>
          <Pie
            data={formattedData}
            dataKey={dataKey}
            nameKey={nameKey}
            cx='50%'
            cy='50%'
            outerRadius={125}
            fill={COLORS[0]}
            label={(item) => `${item.name}: ${item.value}`}
          />
        </RechartPieChart>
      </ResponsiveContainer>
    );
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
}

export default PieChart;
