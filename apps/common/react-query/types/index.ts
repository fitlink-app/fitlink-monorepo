import { UseMutationResult, UseQueryResult } from 'react-query'
import { ResponseError } from '@fitlink/api-sdk/types'

/** The API mutation result consists of the dto response, and casts the standard ResponseError from api sdk  */
export type ApiMutationResult<TResult> = UseMutationResult<
  TResult,
  ResponseError,
  unknown,
  unknown
>

/** The API mutation result consists of the dto response, and casts the standard ResponseError from api sdk  */
export type ApiResult<TData> = UseQueryResult<TData, ResponseError>
