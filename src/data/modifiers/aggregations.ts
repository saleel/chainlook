const Aggregations = {
  sum: (items: any[], key: string) => items.reduce((acc, item) => acc + Number(item[key]), 0),
  multiply: (items: any[], key: string) => items.reduce((acc, item) => acc * Number(item[key]), 1),
  average: (items: any[], key: string) => items.reduce((acc, item) => acc + Number(item[key]), 0) / items.length,
  count: (items: any[]) => items.length,
  min: (items: any[], key: string) => Math.min(...items.map((item) => Number(item[key]))),
  max: (items: any[], key: string) => Math.max(...items.map((item) => Number(item[key]))),
  first: (items: any[], key: string) => items[0][key],
  last: (items: any[], key: string) => items[items.length - 1][key],
};

export default Aggregations;
