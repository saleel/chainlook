import axios, { AxiosHeaders } from 'axios';
import { SiweMessage } from 'siwe';
import Dashboard from '../domain/dashboard';
import Widget from '../domain/widget';
import { getToken } from '../utils/auth';
import { queryGraphQl } from './providers/graph';
import { getWidgetDataFromProvider } from './providers';
import { fetchDataFromIPFS, fetchDataFromIPNS } from '../utils/network';
import { applyVariables, getFieldNamesRequiredForWidget } from '../utils/widget-parsing';
import { computeDynamicFields } from './modifiers/dynamic-fields';
import { groupItems } from './modifiers/group';
import { flattenAndTransformItem } from './modifiers/transformers';

let apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiInstance.interceptors.request.use((config) => {
  const token = getToken();

  (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
  return config;
});

const CACHE: Record<string, any> = {};

export default class API {
  static async getWidgetSchema() {
    if (CACHE.widgetSchema) {
      return CACHE.widgetSchema;
    }

    const response = await apiInstance.get('/schemas/widget.json');

    CACHE.widgetSchema = response.data;
    return response.data;
  }

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

  static async getWidgetsByUser(userUsername: string) {
    const response = await apiInstance.get('/widgets/', {
      params: { userUsername },
    });

    return response.data?.map((w: any) => new Widget(w));
  }

  static async findWidgets(search: string = '') {
    const response = await apiInstance.get('/widgets/', {
      params: { search },
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

  static async getDashboardsByUser(userUsername: string) {
    const response = await apiInstance.get('/dashboards/', {
      params: { userUsername },
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

  static async fetchDataForWidget(
    definition: Widget['definition'],
    variables: Record<string, any>,
  ) {
    if (!definition.data) {
      return [];
    }

    const { source, sources, group, join, transforms, dynamicFields } = definition.data;

    const isSingleSource = typeof source === 'object';

    // Get fields required to be queries from all providers
    const fieldsRequiredForWidget = getFieldNamesRequiredForWidget(definition);

    let result: object[] = [];

    if (isSingleSource) {
      // Apply real values to config values starting with $
      const cleanConfig = applyVariables(source, variables);

      // Fetch data from provider
      result = await getWidgetDataFromProvider(cleanConfig, fieldsRequiredForWidget);

      // Apply transformations
      result = result.map((i: object) => flattenAndTransformItem(i, transforms));
    }

    if (!isSingleSource) {
      const resultForSourcePromises = [];

      for (const [sourceKey, sourceConfig] of Object.entries(sources || {})) {
        // Apply real values to config values starting with $
        const cleanConfig = applyVariables(sourceConfig, variables);

        const widgetFieldsFromSource = fieldsRequiredForWidget
          .filter((f) => f.startsWith(`${sourceKey}.`))
          .map((f) => f.split(`${sourceKey}.`)[1]);

        // Fetch data from provider and return as { sourceKey, items }
        const promise = getWidgetDataFromProvider(cleanConfig, widgetFieldsFromSource).then(
          (items) => ({ sourceKey, items }),
        );

        // Add to promise queue
        resultForSourcePromises.push(promise);
      }

      // Fetch data from each data source and produce { sourceKey, items }[]
      const resultFromSources = await Promise.all(resultForSourcePromises);

      // Group joins operations by source (check both key and value of the join object)
      const allJoins: Record<string, Record<string, string>> = {};
      for (const [left, right] of Object.entries(join || {})) {
        const [leftSource] = left.split('.');
        const [rightSource] = right.split('.');

        if (!allJoins[leftSource]) allJoins[leftSource] = {};
        if (!allJoins[rightSource]) allJoins[rightSource] = {};

        allJoins[leftSource][left] = right;
        allJoins[rightSource][right] = left;
      }

      // Apply transformations and join
      for (const { sourceKey, items = [] } of resultFromSources) {
        for (const item of items) {
          const cleanItem = flattenAndTransformItem(item, transforms, sourceKey);

          // Get joins for the current source
          const joinsForSource = allJoins[sourceKey] || {};

          // Look for matching items in the final results based on the join conditions
          let matchingItem: any;
          if (Object.keys(joinsForSource).length > 0) {
            matchingItem = result.find((it: any) =>
              Object.keys(joinsForSource).every(
                (jk) => jk && cleanItem[jk] && cleanItem[jk] === it[joinsForSource[jk]],
              ),
            );
          }

          if (matchingItem) {
            // Copy all fields from the current item to the matching item
            Object.keys(cleanItem).forEach((key) => {
              matchingItem[key] = cleanItem[key];
            });
          } else {
            // Add as a new item
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

  static async getSubgraphSchema(subgraphId: string) {
    if (CACHE[`subgraph-schema-${subgraphId}`]) {
      return CACHE[`subgraph-schema-${subgraphId}`];
    }

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
      fields(includeDeprecated: true) {
        name
        args {
          ...InputValue
        }
        type {
          ...TypeRef
        }
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

    const schema = result.data?.__schema;

    CACHE[`subgraph-schema-${subgraphId}`] = schema;

    return schema;
  }
}
