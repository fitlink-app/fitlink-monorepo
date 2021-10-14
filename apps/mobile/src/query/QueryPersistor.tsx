import {
  AsyncStorageKeys,
  clearData,
  getPersistedData,
  persistData,
} from '@utils';
import React, {useEffect, Fragment} from 'react';
import {useQueryClient} from 'react-query';
import {QueryKeys} from './keys';

// Whitelsit of queries to be persisted
const queryWhitelist: string[] = [QueryKeys.Me];

type StorableQuery = {queryKey: string; data?: object};

export const flushPersistedQueries = async () => {
  return clearData(AsyncStorageKeys.QUERY_CACHE);
};

// Persists react-query cache in AsyncStorage
export const QueryPersistor: React.FC = ({children}) => {
  const queryClient = useQueryClient();
  const queryCache = queryClient.getQueryCache();

  useEffect(() => {
    hydrate();
    return queryCache.subscribe(event => {
      const queries = queryClient.getQueryCache().findAll();

      if (
        !event ||
        (event.type !== 'queryAdded' &&
          event.type !== 'queryUpdated' &&
          event.type !== 'queryRemoved')
      )
        return;

      if (queries.length) {
        const storableQueries = queries.map(query => ({
          queryKey: query.queryKey,
          data: query.state.data,
        })) as StorableQuery[];

        persistData(AsyncStorageKeys.QUERY_CACHE, storableQueries).catch(e =>
          console.log('Failed to persist query cache: ' + e),
        );
      }
    });
  }, []);

  const hydrate = async () => {
    console.log('hydrating');
    const queries = await getPersistedData<StorableQuery[]>(
      AsyncStorageKeys.QUERY_CACHE,
    );
    queries?.forEach(query => {
      const {queryKey, data} = query;
      if (queryWhitelist.includes(queryKey as string)) {
        queryClient.setQueryData(queryKey, data);
        console.log(`QUERY PERSISTOR: Restored cache for "${queryKey}" query`);
      }
    });
  };

  return <Fragment>{children}</Fragment>;
};
