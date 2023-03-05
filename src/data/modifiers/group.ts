import { WidgetDataDefinition } from "../../domain/widget";

type AggregationFunction = (item: any[], key: string) => number;
type GroupAggregationSchema = NonNullable<WidgetDataDefinition["group"]>["aggregations"];


const GroupAggregations: Record<string, AggregationFunction> = {
  sum: (items: any[], key: string) => items.reduce((acc, item) => acc + Number(item[key]), 0),
  multiply: (items: any[], key: string) => items.reduce((acc, item) => acc * Number(item[key]), 1),
  average: (items: any[], key: string) => items.reduce((acc, item) => acc + Number(item[key]), 0) / items.length,
  count: (items: any[]) => items.length,
  min: (items: any[], key: string) => Math.min(...items.map((item) => Number(item[key]))),
  max: (items: any[], key: string) => Math.max(...items.map((item) => Number(item[key]))),
  first: (items: any[], key: string) => items[0][key],
  last: (items: any[], key: string) => items[items.length - 1][key],
};

export function groupItems(groupKey: string, items: any[], aggregations: GroupAggregationSchema) {
  if (!items.length) {
    return items;
  }

  // Apply grouping and aggregation
  const uniqueMap: Record<string, any> = {};

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
      Object.keys(aggregations || {}).forEach((fieldToAggregate) => {
        const aggregationFunction = GroupAggregations[aggregations[fieldToAggregate]];
        const aggregatedValue = aggregationFunction(itemsInGroup, fieldToAggregate);
        aggregated[fieldToAggregate] = aggregatedValue;
      });
    }

    acc.push(aggregated);
    return acc;
  }, [] as any[]);

  return result;
}


export default GroupAggregations;
