import {useState} from 'react';

// Use to wrap refetch from useQuery
// Issues:
// - https://github.com/TanStack/query/issues/2380
// - https://github.com/facebook/react-native/issues/32836
export const useManualQueryRefresh = (refetch: () => Promise<unknown>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch();
    } catch (e) {
      console.warn('refresh', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {refresh, isRefreshing};
};
