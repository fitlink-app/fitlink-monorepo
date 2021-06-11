import { ResponseError } from '../types'

export function getErrorMessage(error: ResponseError) {
  return error.response.data.message
}
