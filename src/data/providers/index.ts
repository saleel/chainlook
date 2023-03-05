import { DataSource } from '../../domain/widget';
import fetchWidgetDataFromTheGraph from './graph';
import fetchWidgetDataFromIPFS from './ipfs';
import fetchWidgetDataFromTableland from './tableland';

export function getWidgetDataFromProvider(
  sourceConfig: DataSource,
  fieldsRequiredFromProvider: string[],
): Promise<object[]> {
  if (!fieldsRequiredFromProvider.length) {
    throw new Error('No fields to fetch for dataSource');
  }

  const { provider = 'graph', ...restConfig } = sourceConfig;

  switch (provider) {
    case 'thegraph':
    case 'graph': {
      return fetchWidgetDataFromTheGraph(restConfig, fieldsRequiredFromProvider);
    }

    case 'ipfs': {
      return fetchWidgetDataFromIPFS(restConfig);
    }

    case 'tableland': {
      return fetchWidgetDataFromTableland(restConfig, fieldsRequiredFromProvider);
    }

    default: {
      throw new Error(`Invalid provider ${provider}`);
    }
  }
}
