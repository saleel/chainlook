import fetchWidgetDataFromTheGraph from './graph';
import fetchWidgetDataFromIPFS from './ipfs';
import fetchWidgetDataFromTableland from './tableland';

export function getWidgetDataFromProvider(sourceConfig, fieldsRequiredFromProvider, fieldPrefix) {
  if (!fieldsRequiredFromProvider.length) {
    throw new Error('No fields to fetch for dataSource');
  }

  const { provider, ...restConfig } = sourceConfig;

  let fieldNames = fieldsRequiredFromProvider;

  if (fieldPrefix) {
    fieldNames = fieldsRequiredFromProvider
      .filter((f) => f.startsWith(`${fieldPrefix}.`))
      .map((f) => f.split(`${fieldPrefix}.`)[1]);
  }

  switch (provider) {
    case 'thegraph':
    case 'graph': {
      return fetchWidgetDataFromTheGraph(restConfig, fieldNames);
    }

    case 'ipfs': {
      return fetchWidgetDataFromIPFS(restConfig);
    }

    case 'tableland': {
      return fetchWidgetDataFromTableland(restConfig, fieldNames);
    }

    default: {
      throw new Error(`Invalid provider ${provider}`);
    }
  }
}
