import React from 'react';
import {
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Area,
} from 'recharts';
import Formatters from '../../data/modifiers/formatters';
import { WidgetDefinition } from '../../domain/widget';

const COLORS = ['var(--blue-500)', 'var(--green-300)', 'var(--yellow-500)'];

type Props = {
  data: any[];
  config: WidgetDefinition['chart'];
};

function Chart(props: Props) {
  try {
    const { data = [], config } = props;

    const { xAxis, yAxis, lines = [], areas = [], bars = [] } = config!;

    const xAxisFormatter = xAxis.format
      ? (input: any) => Formatters[xAxis.format as keyof typeof Formatters](input)
      : null;
    const yAxisFormatter = yAxis?.format
      ? (input: any) => Formatters[yAxis?.format as keyof typeof Formatters](input)
      : null;

    const dataKeys = [...lines, ...areas, ...bars].map((c) => c.dataKey);
    let maxData = 0;

    for (const datum of data) {
      for (const dataKey of dataKeys) {
        const value = Number(datum[dataKey]);
        if (value > maxData) {
          maxData = value;
        }
      }
    }

    return (
      <ResponsiveContainer>
        <ComposedChart data={data}>
          <XAxis
            dataKey={xAxis.dataKey}
            {...(xAxisFormatter && { tickFormatter: xAxisFormatter })}
            reversed={xAxis.reversed}
          />

          <YAxis
            {...(yAxisFormatter && { tickFormatter: yAxisFormatter })}
            type='number'
            domain={[0, maxData * 1.1]}
          />

          <Tooltip
            labelFormatter={xAxisFormatter || Formatters['camelCaseToTitle']}
            {...(yAxisFormatter && { formatter: yAxisFormatter })}
          />

          {areas.map((area, i) => (
            <Area
              key={area.dataKey}
              name={area.label || area.dataKey}
              type='monotone'
              dataKey={area.dataKey}
              fill={COLORS[i]}
              legendType='none'
            />
          ))}

          {lines.map((line, i) => (
            <Line
              key={line.dataKey}
              name={line.label || line.dataKey}
              type='monotone'
              strokeLinecap='round'
              strokeWidth={2}
              dataKey={line.dataKey}
              stroke={COLORS[i]}
              dot={false}
              legendType='none'
            />
          ))}

          {bars.map((bar, i) => (
            <Bar
              key={bar.dataKey}
              name={bar.label || bar.dataKey}
              type='monotone'
              dataKey={bar.dataKey}
              legendType='none'
              fill={COLORS[i]}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    );
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
}

export default React.memo(Chart);
