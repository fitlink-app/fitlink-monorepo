/**
 *
 * You can use this to do error handling
 * If no data is found returns an object with .message on it.
 * @param promise
 * @returns [0] data or null [1] error or null
 */
export declare function tryAndCatch(promise: Promise<any>): Promise<any[]>
