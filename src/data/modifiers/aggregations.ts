const Aggregations = {
  sum: (items: any[], key: string) => items.reduce((acc, item) => acc + Number(item[key]), 0),
};

export default Aggregations;
