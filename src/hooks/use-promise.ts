// @ts-check

import React from 'react';
import differenceInSeconds from 'date-fns/differenceInSeconds';

const cache = {
  get(key) {
    if (!key) return undefined;

    let cachedData;

    try {
      cachedData = window.localStorage.getItem(`cache.${key}`);
      if (cachedData) {
        cachedData = JSON.parse(cachedData);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Cannot read cache', error);
    }

    return cachedData;
  },

  set(key, data) {
    const newDoc = {
      data,
      storedAt: new Date(),
    };

    try {
      window.localStorage.setItem(`cache.${key}`, JSON.stringify(newDoc));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Cannot set cache', err);
    }
  },

  delete(key) {
    window.localStorage.removeItem(`cache.${key}`);
  },
};

type UsePromiseOptions = {
  defaultValue?: any;
  dependencies?: any[];
  conditions?: any[];
  cacheKey?: string;
  updateWithRevalidated?: boolean;
  cachePeriodInSecs?: number;
};

function usePromise<T>(promise: () => Promise<T>, options: UsePromiseOptions = {}) {
  const {
    defaultValue,
    dependencies = [],
    cacheKey,
    updateWithRevalidated = true,
    cachePeriodInSecs = 10,
    conditions = [],
  } = options;

  let cachedData: any;
  if (cacheKey) {
    cachedData = cache.get(cacheKey);
  }

  const allConditionsValid = conditions.every((condition) => {
    if (typeof condition === 'function') return !!condition();
    return !!condition;
  });

  const [result, setResult] = React.useState<T>(cachedData ? cachedData.data : defaultValue);
  const [fetchedAt, setFetchedAt] = React.useState<Date>(
    cachedData ? cachedData.storedAt : undefined,
  );
  const [isFetching, setIsFetching] = React.useState<boolean>(
    allConditionsValid && !(cachedData && cachedData.data),
  );
  const [error, setError] = React.useState<Error>();

  let didCancel = false;

  async function fetch() {
    didCancel = false;
    if (error) {
      setError(undefined);
    }

    if (cachedData) {
      if (
        cachedData.storedAt &&
        differenceInSeconds(new Date(), new Date(cachedData.storedAt)) < cachePeriodInSecs
      ) {
        return;
      }
    }

    setIsFetching(true);

    try {
      const data = await promise();
      if (!didCancel) {
        // In some cases newly fetched data don't have to be updated (updateWithRevalidated = false)
        if (updateWithRevalidated || cachedData === undefined) {
          setResult(data);
          setFetchedAt(new Date());
        }

        if (cacheKey && (data !== null || data !== undefined)) {
          cache.set(cacheKey, data);
        }
      }
    } catch (e) {
      if (!didCancel) {
        // eslint-disable-next-line no-console
        console.error('Error on fetching data', e);
        setError(e as Error);
        // if (cacheKey) {
        //   cache.delete(cacheKey);
        // }
      }
    }

    setIsFetching(false);
  }

  React.useEffect(() => {
    if (!allConditionsValid) return;

    fetch();

    // eslint-disable-next-line consistent-return
    return () => {
      didCancel = true;
    };
  }, [...dependencies, ...conditions]);

  function reFetch() {
    if (cacheKey) {
      cache.delete(cacheKey);
      cachedData = undefined;
    }
    return fetch();
  }

  return [
    result,
    {
      isFetching,
      fetchedAt,
      reFetch,
      error,
    },
  ] as [T, { isFetching: boolean; fetchedAt: Date; reFetch: () => void; error: Error }];
}

export default usePromise;
