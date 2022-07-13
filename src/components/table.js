function Table(props) {
  const {
    data = [], columns = [], labels = {},
  } = props;

  console.log(
    {
      data, columns
    }
  )

  return (
    <table className="table price-table">
      <thead>
        <tr className="">
          {columns.map((f) => (
            <th key={f}>{labels[f] || f}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((d, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr>
            {columns.map((fieldName) => (
              <td key={fieldName}>{d[fieldName]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
