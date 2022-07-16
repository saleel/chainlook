import { formatters } from "../helpers/formatters";

function Table(props) {
  const {
    data = [], config: { columns } = { columns: {} }
  } = props;

  return (
    <table className="table">
      <thead>
        <tr className="">
          {Object.entries(columns).map(([key, params]) => (
            <th key={key}>{params.label || key}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((d, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={i}>
            {Object.entries(columns).map(([colName, params]) => {

              let value = d[colName];
              if (params.transform) {
                value = formatters[params.transform](value);
              }

              return (
                <td key={colName}>{value}</td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
