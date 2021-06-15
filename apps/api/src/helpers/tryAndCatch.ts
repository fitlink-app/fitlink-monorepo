export async function tryAndCatch(promise: Promise<any>) {
  try {
    const data = await promise
    let zeroethVal = data ? data : null
    let firstVal = data ? null : { message: 'Data not found' }
    return [zeroethVal, firstVal]
  } catch (error) {
    return [null, error]
  }
}
