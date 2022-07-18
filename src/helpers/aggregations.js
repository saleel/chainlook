import get from 'lodash/get';

const aggregations = {
  sum: (items, key) => items.reduce((acc, item) => acc + Number(get(item, key)), 0),
};

export default aggregations;
