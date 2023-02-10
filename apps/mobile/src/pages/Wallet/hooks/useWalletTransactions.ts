import {useInfiniteQuery} from 'react-query';

import api from '@api';
import {QueryKeys} from '@query';
import {ListResponse} from '@fitlink/api-sdk/types';
import {WalletTransaction} from '@fitlink/api/src/modules/wallet-transactions/entities/wallet-transaction.entity';

import {getNextPageParam} from '../../../utils/api';

const limit = 10;

const fetchWalletTransactions = ({
  pageParam = 0,
}: {
  pageParam?: number | undefined;
}) =>
  api.list<WalletTransaction>('/wallet-transactions', {
    page: pageParam,
    limit,
  });

export function useWalletTransactions() {
  return useInfiniteQuery<ListResponse<WalletTransaction>, Error>(
    [QueryKeys.WalletTransactions],
    ({pageParam}) => fetchWalletTransactions({pageParam}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
