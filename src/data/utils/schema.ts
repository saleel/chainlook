import Aggregations from "../modifiers/aggregations";
import Formatters from "../modifiers/formatters";
import Transformers from "../modifiers/transformers";

export function enrichWidgetSchema(widgetSchema: { $defs: any }) {
  if (widgetSchema) {
    widgetSchema.$defs.formatter.enum = Object.keys(Formatters);
    widgetSchema.$defs.transform.enum = Object.keys(Transformers);
    widgetSchema.$defs.aggregation.enum = Object.keys(Aggregations);
    widgetSchema.$defs.dynamicFieldOperation.enum = ['sum', 'subtract', 'multiply'];
  }

  return widgetSchema;
}