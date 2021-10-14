import { ResponseError } from '../types'

/**
 * Takes an Axios error object and returns the error message
 *
 * @param error
 * @returns string
 */
export function getErrorMessage(error: ResponseError) {
  return error.response.data.message
}

/**
 * Takes an Axios error object and returns field errors
 * e.g.: {email: 'This is not a valid email address', password: 'Password is too short', ...}
 *
 * @param error
 * @returns '{fieldName: string, fieldName2: string}'
 */
export function getErrorFields(error: ResponseError) {
  return error.response.data.errors
}

/**
 * Strip blank fields from payload object
 *
 * @param payload
 * @param include Specific fields to remove if they are blank,
 * otherwise all fields can be removed.
 */
export function stripBlankFields(
  payload: NodeJS.Dict<any>,
  include?: string[]
) {
  const result = { ...payload }
  Object.keys(payload).filter((key) => {
    if (result[key] === '') {
      if (!include || include.includes(key)) {
        delete result[key]
      }
    }
  })
  return result
}
