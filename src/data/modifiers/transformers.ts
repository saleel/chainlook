import endOfDay from 'date-fns/endOfDay';
import endOfMonth from 'date-fns/endOfMonth';
import endOfWeek from 'date-fns/endOfWeek';
import endOfYear from 'date-fns/endOfYear';
import startOfDay from 'date-fns/startOfDay';
import startOfMonth from 'date-fns/startOfMonth';
import startOfWeek from 'date-fns/startOfWeek';
import startOfYear from 'date-fns/startOfYear';
import { numberToJsDate } from '../../utils/time';

const Transformers = {
  startOfDay: (time: number) => startOfDay(numberToJsDate(time)).getTime(),
  startOfWeek: (time: number) => startOfWeek(numberToJsDate(time)).getTime(),
  startOfMonth: (time: number) => startOfMonth(numberToJsDate(time)).getTime(),
  startOfYear: (time: number) => startOfYear(numberToJsDate(time)).getTime(),
  endOfDay: (time: number) => endOfDay(numberToJsDate(time)).getTime(),
  endOfWeek: (time: number) => endOfWeek(numberToJsDate(time)).getTime(),
  endOfMonth: (time: number) => endOfMonth(numberToJsDate(time)).getTime(),
  endOfYear: (time: number) => endOfYear(numberToJsDate(time)).getTime(),
};

// Convert object to flat object with dot notation
// Add a prefix to the key if passed
function flattenItem(item: any, keyPrefix?: string) {
  const flattened: any = {};

  function flattenObj(obj: any, parent?: any) {
    for (const key in obj) {
      let fullKey = parent ? `${parent}.${key}` : key;

      if (typeof obj[key] === 'object') {
        flattenObj(obj[key], fullKey);
      } else {
        // Add prefix if passed
        if (keyPrefix) {
          fullKey = `${keyPrefix}.${fullKey}`;
        }
        flattened[fullKey] = obj[key];
      }
    }
  }

  flattenObj(item, '');

  return flattened;
}

// Flatten the object and apply transformation
// Flattening is a separate job, but combining with transformation to avoid another iteration
// Note: transformation is the first operation done on the data
export function flattenAndTransformItem(
  item: any,
  transforms?: Record<string, string>,
  keyPrefix?: string,
) {
  const transformedItem = flattenItem(item, keyPrefix);

  Object.keys(transformedItem).forEach((key) => {
    if (transforms && transforms[key]) {
      const transformName = transforms[key] as keyof typeof Transformers;
      const transformFunction = Transformers[transformName];

      if (transforms[key] in Transformers === false) {
        throw new Error(`Invalid transform named ${transforms[key]}`);
      }

      transformedItem[key] = transformFunction(transformedItem[key]);
    }
  });

  return transformedItem;
}

export default Transformers;
