import Formatters, { applyFormatting } from '../../data/modifiers/formatters';
import { WidgetDefinition } from '../../domain/widget';

type Props = {
  data: any[];
  config: WidgetDefinition['table'];
};

function Table(props: Props) {
  const { data = [], config } = props;
  const columns = config!.columns || [];

  try {
    return (
      <div className='table-container'>
        <table className='table'>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.dataKey}>
                  {column.label || Formatters.camelCaseToTitle(column.dataKey)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((datum, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={i}>
                {columns.map((column) => {
                  let value = datum[column.dataKey];

                  if (column.format) {
                    value = applyFormatting(value, column.format);
                  }

                  return <td key={column.dataKey}>{String(value)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } catch (error) {
    return <div className='error'>Error: {(error as Error).message}</div>;
  }
}

export default Table;
