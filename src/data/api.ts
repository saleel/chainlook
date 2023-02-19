import axios, { AxiosHeaders } from 'axios';
import { SiweMessage } from 'siwe';
import Dashboard from '../domain/dashboard';
import Widget from '../domain/widget';
import { getToken } from './auth';
import { groupItems, flattenAndTransformItem, computeDynamicFields } from './modifiers/helpers';
import { queryGraphQl } from './providers/graph';
import { getWidgetDataFromProvider } from './providers/helpers';
import { fetchDataFromIPFS, fetchDataFromIPNS } from './utils/network';
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

  static async signIn({ message, signature }: { message: SiweMessage; signature: string }) {
    const response = await apiInstance.post('/sign-in', {
      message,
      signature,
    });

    const { token, user } = response.data;
    return { token, user };
  }

  static async getWidget(widgetId: string) {
    const response = await apiInstance.get(`/widgets/${widgetId}`);
    return new Widget(response.data);
  }

  static async fetchDataForWidget(widget, variables) {
    const { source, sources, group, join, transforms, dynamicFields } = widget.data;

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
      if (!sources) {
        throw new Error('data.sources not defined in schema');
      }

      // Fetch data from each data source and produce { sourceKey, items }[]
      const resultFromSources = await Promise.all(
        Object.entries(sources).map(async ([sourceKey, sourceConfig]) => {
          const cleanConfig = applyVariables(sourceConfig, variables);
          const items = await getWidgetDataFromProvider(
            cleanConfig,
            fieldsRequiredForWidget,
            sourceKey,
          );
          return { sourceKey, items };
        }),
      );

      // Apply transformations and join
      for (const { sourceKey, items = [] } of resultFromSources) {
        for (const item of items) {
          const cleanItem = flattenAndTransformItem(item, transforms, sourceKey);

          // Look for matching items in the final results based on the join conditions
          const joinsForSource = allJoins[sourceKey] || {};
          const matchingItem = result.find((f) =>
            Object.keys(joinsForSource).every((jk) => cleanItem[jk] === f[joinsForSource[jk]]),
          );

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

    // Compute dynamic fields
    if (dynamicFields) {
      result = computeDynamicFields(result, dynamicFields);
    }

    return result;
  }

  static async createWidget(widget: Partial<Widget>) {
    const response = await apiInstance.post('/widgets', {
      title: widget.title,
      definition: widget.definition,
      tags: widget.tags,
    });

    return response.data;
  }

  static async editWidget(widget: Widget) {
    const response = await apiInstance.patch('/widgets/' + widget.id, {
      title: widget.title,
      definition: widget.definition,
      tags: widget.tags,
    });

    return response.data;
  }

  static async getWidgetsByUser(userId: string) {
    const response = await apiInstance.get('/widgets/', {
      params: { userId },
    });

    return response.data?.map((w: any) => new Widget(w));
  }

  static async getDashboard(id: string) {
    const [protocolOrAuthor, dashboardId] = id.split(':');

    if (protocolOrAuthor === 'ipfs') {
      const data = await fetchDataFromIPFS(dashboardId);
      return {
        definition: data,
        title: data?.title,
      } as Dashboard;
    }

    if (protocolOrAuthor === 'ipns') {
      const data = await fetchDataFromIPNS(dashboardId);
      return {
        definition: data,
        title: data?.title,
      } as Dashboard;
    }

    // Fetch from API
    const response = await apiInstance.get(`/dashboards/${id}`);
    return new Dashboard(response.data);
  }

  static async createDashboard(dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const response = await apiInstance.post('/dashboards', {
      title: dashboard.title,
      definition: dashboard.definition,
      tags: dashboard.tags,
      slug: dashboard.slug,
    });

    return response.data;
  }

  static async editDashboard(dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const response = await apiInstance.patch('/dashboards/' + dashboard.id, {
      title: dashboard.title,
      definition: dashboard.definition,
      tags: dashboard.tags,
    });

    return response.data;
  }

  static async getDashboardsByUser(userId: string) {
    const response = await apiInstance.get('/dashboards/', {
      params: { userId },
    });

    return response.data?.map((w: any) => new Dashboard(w));
  }

  static async getRecentDashboards() {
    const response = await apiInstance.get('/dashboards/', {
      params: { sort: 'createdOn', order: 'desc', limit: 10 },
    });
    return response.data?.map((w: any) => new Dashboard(w));
  }

  static async getRecentWidgets() {
    const response = await apiInstance.get('/widgets/', {
      params: { sort: 'createdOn', order: 'desc', limit: 10 },
    });
    return response.data?.map((w: any) => new Widget(w));
  }

  static async editProfile(params: { username: string }) {
    const response = await apiInstance.patch('/profile', {
      username: params.username,
    });

    return response.data;
  }

  static async starDashboard(dashboardId: string, isStarred: boolean) {
    const response = await apiInstance.post(`/star`, {
      dashboardId,
      isStarred,
    });

    return response.data;
  }

  static async getStarredDashboards(userId: string) {
    const response = await apiInstance.get('/dashboards/', {
      params: { starredBy: userId },
    });
    return response.data?.map((w: any) => new Dashboard(w));
  }

  static async getSubgraphSchema(subgraphId: string) {
    const query = `query IntrospectionQuery {
      __schema {
        types {
          ...FullType
        }
      }
    }
    
    fragment FullType on __Type {
      kind
      name
      description
      fields(includeDeprecated: true) {
        name
        description
        args {
          ...InputValue
        }
        type {
          ...TypeRef
        }
        isDeprecated
        deprecationReason
      }
      inputFields {
        ...InputValue
      }
      interfaces {
        ...TypeRef
      }
      enumValues(includeDeprecated: true) {
        name
        description
        isDeprecated
        deprecationReason
      }
      possibleTypes {
        ...TypeRef
      }
    }
    
    fragment InputValue on __InputValue {
      name
      description
      type {
        ...TypeRef
      }
      defaultValue
    }
    
    fragment TypeRef on __Type {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
        }
      }
    }`;

    const result = await queryGraphQl(subgraphId, query);

    return result.data?.__schema;
  }
}
