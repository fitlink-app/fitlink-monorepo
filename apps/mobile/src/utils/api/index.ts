import {ListResponse} from '@fitlink/api-sdk/types';
import {InfiniteData} from 'react-query';

export const getNextPageParam =
  <T>(limit: number) =>
  (lastPage: ListResponse<T>, pages: ListResponse<T>[]) => {
    const allResults = pages.length * limit;
    const moreAvailable = allResults < lastPage.total;
    return moreAvailable ? pages.length : undefined;
  };

/** Returns all the entries from an InfiniteData object in a single array */
export const getResultsFromPages = <T>(
  data: InfiniteData<ListResponse<T>> | undefined,
) => {
  const results =
    data?.pages.reduce<T[]>((acc, current) => {
      return [...acc, ...current.results];
    }, []) || [];
  return results;
};

export const getUrlParams = (url: string) => {
  let regex = /[?&]([^=#]+)=([^&#]*)/g;
  let params: {[key: string]: string} = {};
  let match;

  while ((match = regex.exec(url))) {
    params[match[1]] = decodeURIComponent(decodeURIComponent(match[2])); // ¯\_(ツ)_/¯
  }

  return params;
};
