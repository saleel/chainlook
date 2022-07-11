function Table(props) {
  const {
    data = [], fields = {}, labels = {},
  } = props;

  return (
    <table className="table price-table">
      <thead>
        <tr className="">
          {Object.keys(fields).map((f) => (
            <th key={f}>{labels[f] || f}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((d, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={i}>
            {Object.entries(fields).map(([fieldName, resolver]) => {
              let content = d[fieldName];
              if (typeof resolver === 'function') {
                const resolved = resolver(d[fieldName], d, i);
                if (typeof resolved === 'function') {
                  content = <resolved />;
                }
                content = resolved;
              }

              return (
                <td key={fieldName}>{content}</td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
