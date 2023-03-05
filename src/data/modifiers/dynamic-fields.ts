import { DataDefinition } from "../../domain/widget";

type OperationFunction = (item: any, fields: string[]) => number;
type DynamicFieldSchema = DataDefinition["dynamicFields"];

const DynamicFieldOperations: Record<string, OperationFunction> = {
  sum: (item, fields) => fields.reduce((acc, field) => acc + Number(item[field]), 0),
  multiply: (item, fields) => fields.reduce((acc, field) => acc * Number(item[field]), 1),
  average: (item, fields) => fields.reduce((acc, field) => acc + Number(item[field]), 0) / fields.length,
  min: (item, fields) => Math.min(...fields.map((field) => Number(item[field]))),
  max: (item, fields) => Math.max(...fields.map((field) => Number(item[field]))),
};

export function computeDynamicFields(items: any[], dynamicFields: DynamicFieldSchema) {
  for (const item of items) {
    for (const [key, config] of Object.entries(dynamicFields || {})) {
      const { operation, fields } = config as { operation: string; fields: string[] };

      if (!DynamicFieldOperations[operation]) {
        throw new Error(`Invalid dynamic field operation: ${operation}`);
      }

      item[key] = DynamicFieldOperations[operation](item, fields);
    }
  }

  return items;
}

export default DynamicFieldOperations;
