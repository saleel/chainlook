import get from 'lodash/get';

const Aggregations = {
  sum: (items, key) => items.reduce((acc, item) => acc + Number(get(item, key)), 0),
};

export default Aggregations;
