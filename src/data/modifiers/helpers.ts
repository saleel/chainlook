import Transformers from './transformers';
import Aggregations from './aggregations';

export function flattenObj(obj, parent, res = {}) {
  // eslint-disable-next-line guard-for-in
  for (const key in obj) {
    const propName = parent ? `${parent}.${key}` : key;
    if (typeof obj[key] === 'object') {
      flattenObj(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
}

export function flattenAndTransformItem(item, transforms = {}, keyPrefix = '') {
  // Flatten the object if nested
  const flatItem = flattenObj(item);
  const cleanItem = {};

  Object.keys(flatItem).forEach((key) => {
    const fullKey = keyPrefix ? `${keyPrefix}.${key}` : key; // Prefix with sourceKey if multiple sources
    cleanItem[fullKey] = flatItem[key];

    // Apply any transform function if present - avoid another iteration
    if (transforms[fullKey]) {
      const transformFunction = Transformers[transforms[fullKey]];
      if (!transformFunction) {
        throw new Error(`Invalid transform named ${transforms[fullKey]}`);
      }
      cleanItem[fullKey] = transformFunction(cleanItem[fullKey]);
    }
  });

  return cleanItem;
}

export function groupItems(groupKey, items, aggregations = {}) {
  if (!items.length) {
    return items;
  }

  // Apply grouping and aggregation
  const uniqueMap = {};

  // Create { [key]: matchingItem[] } combination
  items.forEach((item) => {
    const uniqueKey = item[groupKey];
    if (!uniqueMap[uniqueKey]) {
      uniqueMap[uniqueKey] = [];
    }
    uniqueMap[uniqueKey].push(item);
  });

  // Iterate on each match groups, and apply aggregations
  const result = Object.entries(uniqueMap).reduce((acc, [, itemsInGroup]) => {
    // Set base fields from first item
    // This means all keys not present in `aggregations` will be considered as `first` operation - first (or any) value from the group
    const aggregated = { ...itemsInGroup[0] };

    // No need to aggregate if len = 1
    if (itemsInGroup.length > 1) {
      Object.keys(aggregations).forEach((fieldToAggregate) => {
        const aggregationFunction = Aggregations[aggregations[fieldToAggregate]];
        const aggregatedValue = aggregationFunction(itemsInGroup, fieldToAggregate);
        aggregated[fieldToAggregate] = aggregatedValue;
      });
    }

    acc.push(aggregated);
    return acc;
  }, []);

  return result;
}

export function computeDynamicFields(items, dynamicFields) {
  for (const item of items) {
    for (const [key, config] of Object.entries(dynamicFields)) {
      const { operation, fields } = config as { operation: string; fields: string[] };

      if (operation === 'sum') {
        item[key] = fields.reduce((acc, field) => acc + Number(item[field]), 0);
      }
      if (operation === 'multiply') {
        item[key] = fields.reduce((acc, field) => acc * Number(item[field]), 1);
      }
    }
  }

  return items;
}
