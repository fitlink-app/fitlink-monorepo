/**
 *
 * You can use this to do error handling
 * If no data is found returns an object with .message on it.
 * @param promise
 * @returns [0] data or null [1] error or null
 */
export async function tryAndCatch<T>(
  promise: Promise<T>
): Promise<[T, { message: string }]> {
  try {
    const data = await promise
    let zeroethVal = data ? (data as T) : null
    let firstVal = data ? null : { message: 'Data not found' }
    return [zeroethVal, firstVal]
  } catch (error) {
    return [null, error]
  }
}
