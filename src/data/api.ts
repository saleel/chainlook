import axios from 'axios';
import { SiweMessage } from 'siwe';
import Widget from '../domain/widget';
import { groupItems, flattenAndTransformItem } from './modifiers/helpers';
import { getWidgetDataFromProvider } from './providers/helpers';
import { fetchDataFromIPFS } from './utils/network';
import { applyVariables, getFieldNamesRequiredForWidget } from './utils/widget-parsing';

export default class API {
  static async getNonce() {
    const response = await axios.get('http://localhost:9000/nonce');
    return response.data;
  }

  static async signIn({ message, signature } : { message: SiweMessage, signature: string }) {
    const response = await axios.post('http://localhost:9000/sign-in', {
      message, signature
    });
  
    return response.data;
  }

  static async getDashboard(protocol, id) {
    if (protocol === 'ipfs') {
      return fetchDataFromIPFS(id);
    }
  
    if (protocol === 'ipns') {
      return fetchDataFromIPFS(id);
    }
  
    // Raw ID assumed to be IPFS CID for the time being
    return fetchDataFromIPFS(id);
  }
  
  static async getWidget(widgetId: string) {
    const response = await axios.get(`http://localhost:9000/widgets/${widgetId}`);
    return new Widget(response.data);
  }
  
  static async fetchDataForWidget(widget, variables) {
    const {
      source, sources, group, join, transforms,
    } = widget.data;
  
    const isSingleSource = typeof source === 'object';
  
    // Get fields required to be queries from all providers
    const fieldsRequiredForWidget = getFieldNamesRequiredForWidget(widget);
  
    // Group joins by provider (check both key and value of the join object)
    const allJoins = {};
    for (const [left, right] of Object.entries(join || {})) {
      const [leftSource] = left.split('.');
      const [rightSource] = right.split('.');
  
      if (!allJoins[leftSource]) allJoins[leftSource] = {};
      if (!allJoins[rightSource]) allJoins[rightSource] = {};
  
      allJoins[leftSource][left] = right;
      allJoins[rightSource][right] = left;
    }
  
    let result = [];
  
    if (isSingleSource) {
      const cleanConfig = applyVariables(source, variables); // Apply real values to config values starting with $
      result = await getWidgetDataFromProvider(cleanConfig, fieldsRequiredForWidget);
      result = result.map((i) => flattenAndTransformItem(i, transforms));
    }
  
    if (!isSingleSource) {
      if (!sources) { throw new Error('data.sources not defined in schema'); }
  
      // Fetch data from each data source and produce { sourceKey, items }[]
      const resultFromSources = await Promise.all(
        Object.entries(sources).map(async ([sourceKey, sourceConfig]) => {
          const cleanConfig = applyVariables(sourceConfig, variables);
          const items = await getWidgetDataFromProvider(cleanConfig, fieldsRequiredForWidget, sourceKey);
          return { sourceKey, items };
        }),
      );
  
      // Apply transformations and join
      for (const { sourceKey, items } of resultFromSources) {
        for (const item of items) {
          const cleanItem = flattenAndTransformItem(item, transforms, sourceKey);
  
          // Look for matching items in the final results based on the join conditions
          const joinsForSource = allJoins[sourceKey] || {};
          const matchingItem = result.find((f) => Object.keys(joinsForSource).every((jk) => cleanItem[jk] === f[joinsForSource[jk]]));
  
          if (matchingItem) {
            Object.keys(cleanItem).forEach((key) => {
              matchingItem[key] = cleanItem[key];
            });
          } else {
            result.push(cleanItem);
          }
        }
      }
    }
  
    // Apply grouping and aggregation
    if (group && group.key) {
      result = groupItems(group.key, result, group.aggregations);
    }
  
    return result;
  }
  
  static async createWidget(widget: Partial<Widget>) {
    const response = await axios.post('http://localhost:9000/widget', {
      title: widget.title,
      definition: widget.definition,
      tags: widget.tags,
    });
  
    return response.data;
  }

  static async editWidget(widget: Widget) {
    const response = await axios.patch('http://localhost:9000/widget/' + widget.id, {
      title: widget.title,
      definition: widget.definition,
      tags: widget.tags,
    });
  
    return response.data;
  }
}
