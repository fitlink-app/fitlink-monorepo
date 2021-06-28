import {ListResponse} from '@fitlink/api-sdk/types';

export const getNextPageParam =
  <T>(limit: number) =>
  (lastPage: ListResponse<T>, pages: ListResponse<T>[]) => {
    const allResults = pages.length * limit;
    const moreAvailable = allResults < lastPage.total;

    return moreAvailable ? pages.length : undefined;
  };
