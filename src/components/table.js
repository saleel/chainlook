import formatters from '../helpers/formatters';

function Table(props) {
  const {
    data = [], config: { columns = [] },
  } = props;

  return (
    <table className="table">
      <thead>
        <tr className="">
          {columns.map((column) => (
            <th key={column.dataKey}>{column.label || column.key}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((d, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={i}>
            {columns.map((column) => {
              let value = d[column.dataKey];

              if (column.transform) {
                value = formatters[column.transform](value);
              }

              return (
                <td key={column.dataKey}>{value}</td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
