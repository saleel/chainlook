import GlobalVariables from '../modifiers/variables';

/**
 * Parse widget configuration and return the fields required in `source.dataKey` format
 *
 * @param {*} widget
 * @returns {string[]}
 */
export function getFieldNamesRequiredForWidget(widget) {
  let displayFields = [];

  if (widget.type === 'chart') {
    displayFields = [
      widget.chart.xAxis?.dataKey,
      ...(widget.chart.lines || []).map((d) => d.dataKey),
      ...(widget.chart.bars || []).map((d) => d.dataKey),
      ...(widget.chart.areas || []).map((d) => d.dataKey),
    ].filter(Boolean);
  }

  if (widget.type === 'pieChart') {
    displayFields = [widget.pieChart.dataKey, widget.pieChart.nameKey];
  }

  if (widget.type === 'table') {
    displayFields = widget.table.columns.map((d) => d.dataKey);
  }

  if (widget.type === 'metric') {
    displayFields = [widget.metric.dataKey];
  }

  // Include all fields mentioned in join and group
  const fieldsRequiredForJoin = [...new Set(Object.entries(widget.data?.join ?? {}).flat())];
  const fieldsRequiredForGroup = widget.data.group?.dataKey ?? [];

  return [
    ...displayFields,
    ...fieldsRequiredForJoin,
    ...fieldsRequiredForGroup,
  ];
}

/**
 * Apply variable values for object values starting with $
 *
 * @param {*} object Object to be modified
 * @param {*} variables Variables object containing current values.  Keys don't need to start with $
 */
export function applyVariables(object, variables) {
  const updatedObject = { ...object };

  Object.keys(object).forEach((key) => {
    let value = object[key];

    if (typeof value === 'string' && value.startsWith('$')) {
      const variableKey = value.slice(1);

      // Keys in `globalVariables` start with $, and values are function start return the current value
      if (GlobalVariables[value]) {
        value = GlobalVariables[value]();
      } else if (variableKey in variables) {
        value = variables[variableKey];
      } else {
        throw Error(`Cannot resolve variable named ${value}`);
      }

      updatedObject[key] = value;
    }

    // Apply variables recursively to nested objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      updatedObject[key] = applyVariables(value, variables);
    }
  });

  return updatedObject;
}
