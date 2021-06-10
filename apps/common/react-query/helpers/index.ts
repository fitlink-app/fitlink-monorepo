import { ResponseError } from '@fitlink/api-sdk/types'

export function getErrorMessage(error: ResponseError) {
  return error.response.data.message
}
