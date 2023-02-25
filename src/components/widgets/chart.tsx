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

const COLORS = ['var(--blue-500)', 'var(--green-300)', 'var(--yellow-500)'];

function Chart(props) {
  try {
    const {
      data = [],
      config: { xAxis, yAxis, lines = [], areas = [], bars = [] },
    } = props;

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
            {...(Formatters[xAxis.format] && { tickFormatter: Formatters[xAxis.format] })}
            reversed={xAxis.reversed}
          />

          <YAxis
            {...(Formatters[yAxis?.format] && { tickFormatter: Formatters[yAxis.format] })}
            type='number'
            domain={[0, maxData * 1.1]}
          />

          <Tooltip
            {...(Formatters[xAxis.format] && {
              labelFormatter: Formatters[xAxis.format || 'camelCaseToTitle'],
            })}
            {...(Formatters[yAxis?.format] && { formatter: Formatters[yAxis.format] })}
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
    return <div>{error.message}</div>;
  }
}

export default React.memo(Chart);
