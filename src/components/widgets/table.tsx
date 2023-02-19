import Formatters from '../../data/modifiers/formatters';

function Table(props) {
  const {
    data = [],
    config: { columns = [] },
  } = props;

  try {
    return (
      <div className='table-container'>
        <table className='table'>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  // style={{ width: `${100 / columns.length}%` }}
                  key={column.dataKey}
                >
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
                    value = Formatters[column.format](value);
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
    // eslint-disable-next-line no-console
    console.error(error);

    return <div className='error'>Error: {error.message}</div>;
  }
}

export default Table;
