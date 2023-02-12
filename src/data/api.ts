import axios, { AxiosHeaders } from 'axios';
import { SiweMessage } from 'siwe';
import Dashboard from '../domain/dashboard';
import Widget from '../domain/widget';
import { getToken } from './auth';
import { groupItems, flattenAndTransformItem } from './modifiers/helpers';
import { getWidgetDataFromProvider } from './providers/helpers';
import { fetchDataFromIPFS } from './utils/network';
import { applyVariables, getFieldNamesRequiredForWidget } from './utils/widget-parsing';


let apiInstance = axios.create({ 
  baseURL: 'http://localhost:9000', 
});

apiInstance.interceptors.request.use((config) => {
  const token = getToken();

  (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
  return config;
});

export default class API {
  static async getNonce() {
    const response = await apiInstance.get('/nonce');
    return response.data;
  }

  static async signIn({ message, signature } : { message: SiweMessage, signature: string }) {
    const response = await apiInstance.post('/sign-in', {
      message, signature
    });

    const { token, user } = response.data;
    return { token, user };
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
    const response = await apiInstance.get(`/widgets/${widgetId}`);
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
    const response = await apiInstance.post('/widget', {
      title: widget.title,
      definition: widget.definition,
      tags: widget.tags,
    });
  
    return response.data;
  }

  static async editWidget(widget: Widget) {
    const response = await apiInstance.patch('/widget/' + widget.id, {
      title: widget.title,
      definition: widget.definition,
      tags: widget.tags,
    });
  
    return response.data;
  }

  static async editProfile(params: { username: string }) {
    const response = await apiInstance.patch('/profile', {
      username: params.username,
    });

    return response.data;
  }

  static async getWidgetsForUser(userId: string) {
    const response = await apiInstance.get('/widgets/', {
      params: { userId },
    });
  
    return response.data?.map((w: any) => new Widget(w));
  }

  static async createDashboard(dashboard: Partial<Dashboard>) : Promise<Dashboard> {
    const response = await apiInstance.post('/dashboard', {
      title: dashboard.title,
      definition: dashboard.definition,
      tags: dashboard.tags,
    });
  
    return response.data;
  }
}
