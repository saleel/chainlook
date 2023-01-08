const Aggregations = {
  sum: (items, key) => items.reduce((acc, item) => acc + Number(item[key]), 0),
};

export default Aggregations;
