import { AxiosInstance, AxiosError } from 'axios'
import {
  ListResource,
  ReadResource,
  UploadResource,
  ResourceParams,
  CreateResourceParams,
  UpdateResourceParams,
  CreatableResource,
  CreatableResourceResponse,
  UploadResourceParams,
  ListParams,
  ListResponse,
  AuthLoginDto,
  AuthResultDto,
  AuthConnectDto,
  CreateUserDto,
  AuthLogin,
  AuthLogout,
  AuthRefresh,
  DeleteResult,
  UpdateResult,
  AuthSignUp,
  AuthConnect
} from './types'

const ERR_TOKEN_EXPIRED = 'Token expired'

export class Api {
  private axios: AxiosInstance = null
  private tokens: AuthResultDto
  private replay: any[] = []
  private reject: any[] = []
  private reAuthorizing = false

  constructor(axios: AxiosInstance) {
    this.axios = axios
    this.useToken()
    this.useRefreshInterceptor()
  }

  /**
   * @returns the Axios instance
   */
  getAxiosInstance() {
    return this.axios
  }

  /**
   * Creates an interceptor that provides the access
   * token if available to the Authorization header
   */
  useToken() {
    this.axios.interceptors.request.use(async (config) => {
      if (this.tokens && this.tokens.access_token) {
        config.headers.Authorization = `Bearer ${this.tokens.access_token}`
      }
      return config
    })
  }

  /**
   * Creates an interceptor that will
   * catch 401 token expired errors and
   * attempt to refresh the session, and automatically
   * replay the requests that failed
   */
  useRefreshInterceptor() {
    this.axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response ? error.response.status : null
        if (
          status === 401 &&
          error.response.data.message === ERR_TOKEN_EXPIRED
        ) {
          this.reauthorize()
          // If re-auth is in progress, requests are deferred for retry.
          if (this.isReAuthorizing()) {
            return this.replayRequest(error)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * Caches the request that errored in order
   * to replay later (after the user's session is refreshed)
   *
   * Passes the original error as an argument.
   *
   * @param error
   * @returns promise
   */
  replayRequest(error: AxiosError) {
    return new Promise((resolve, reject) => {
      this.bufferRequest(
        () => {
          error.config.headers[
            'Authorization'
          ] = `Bearer ${this.tokens.access_token}`
          return this.axios.request(error.config)
        },
        resolve,
        (err?: any) => {
          reject(err || error)
        }
      )
    })
  }

  /**
   * Attempts to refresh the session and replay
   * the requests that have been buffered.
   *
   * It may fail with a special AuthorizationRefreshError
   * which is passed back as the error to all requests
   * and can be used to force-logout the user from the app.
   *
   * @returns void
   */
  async reauthorize() {
    if (!this.reAuthorizing) {
      this.reAuthorizing = true
      try {
        await this.refreshSession()
        await this.replayAllRequests()
      } catch (e) {
        if (e instanceof AuthorizationRefreshError) {
          this.rejectAllRequests(e)
        } else {
          throw e
        }
      } finally {
        this.reAuthorizing = false
      }
    }
  }

  /**
   * Determines whether reauthorization (refreshSession)
   * request is in progress
   * *
   * @returns boolean
   */
  isReAuthorizing() {
    return this.reAuthorizing
  }

  /**
   * Buffers a request to replay it later
   * Used for replaying requests that failed due to the access token
   * expiring.
   *
   * @param request A function that returns a promise
   * @param resolve The promise resolve method
   * @param reject The promise reject method
   */
  bufferRequest(
    request: () => Promise<any>,
    resolve: (result: any) => void,
    reject: (error: AxiosError) => void
  ) {
    this.replay.push(async () => {
      try {
        const result = await request()
        resolve(result)
      } catch (e) {
        reject(e)
      }
    })
    this.reject.push(reject)
  }

  /**
   * Replaces all buffered requests
   * @returns promise
   */
  replayAllRequests() {
    return Promise.all(this.replay.map((exec) => exec()))
  }

  /**
   * Rejects all buffered requests
   * with custom error
   *
   * @param customError
   */
  rejectAllRequests(customError: ApiError) {
    this.reject.map((exec) => exec(customError))
  }

  /**
   * Lists a resource with a pagination interface
   *
   * e.g.: api.list<Organisation>("/organisations")
   *
   * @param url
   * @param options { limit: number, page: number, query: {} }
   * @returns Pagination interface
   */
  async list<T>(url: ListResource, options: ListParams = {}) {
    const { limit = 10, page = 0, query, ...rest } = options
    const response = await this.axios.get(this.applyParams(url, rest), {
      params: {
        limit,
        page,
        query,
        ...rest
      }
    })

    return response.data as ListResponse<T>
  }

  /**
   * Gets a single resource
   *
   * @param url e.g.: "/organisations/:organisationId"
   * @param params used for vars, e.g.: `{ organisationId: "12345" }`
   * @returns Promise
   */
  async get<T>(url: ReadResource, params?: ResourceParams) {
    const response = await this.axios.get(this.applyParams(url, params))
    return response.data as T
  }

  /**
   * Creates a resource and returns the resource
   * as a promise
   *
   * @param url e.g.: "/organisations"
   * @param params e.g.: `{ payload: { name: "company abc" }}`
   * @returns Promise
   */
  async post<T>(
    url: ListResource | CreatableResource,
    params?: CreateResourceParams<T>
  ) {
    const payload = params ? params.payload : {}
    const response = await this.axios.post(
      this.applyParams(url, params),
      this.sanitizeInput(payload)
    )
    return response.data as T extends CreatableResource
      ? CreatableResourceResponse<T>
      : T
  }

  /**
   * Updates a single resource
   *
   * @param url e.g. "/organisations/:organisationId"
   * @param params used for vars, e.g. `{ name: "Company ABCD" }`
   * @returns Promise (fields that were updated)
   */
  async put<T>(url: ReadResource, params: UpdateResourceParams<T>) {
    const payload = params ? params.payload : {}
    const response = await this.axios.put(
      this.applyParams(url, params),
      this.sanitizeInput(payload)
    )
    return response.data as UpdateResult
  }

  /**
   * When a JWT expires the token needs to be refreshed
   * This should happen automatically on certain kinds of errors
   * @returns `{ id_token, access_token, refresh_token }`
   */
  async refreshSession() {
    let result: AuthResultDto
    try {
      result = await this.post<AuthRefresh>('/auth/refresh', {
        payload: {
          refresh_token: this.tokens.refresh_token
        }
      })
    } catch (e) {
      throw new AuthorizationRefreshError({
        message: 'Session could not be refreshed',
        axiosError: e
      })
    }
    this.setTokens(result)
    return result
  }

  /**
   * Signs up a new user, logs in and stores tokens
   *
   * @param dto An object of `{ email, password, name (optional) }`
   * @returns `{auth: AuthResult, me: User}`
   */
  async signUp(payload: CreateUserDto) {
    const result = await this.post<AuthSignUp>('/auth/signup', {
      payload
    })
    this.setTokens(result.auth)
    return result
  }

  /**
   * Logs in and stores tokens
   *
   * @param emailPass An object of `{ email, password }`
   * @returns `{ id_token, access_token, refresh_token }`
   */
  async login(emailPass: AuthLoginDto) {
    const result = await this.post<AuthLogin>('/auth/login', {
      payload: emailPass
    })
    this.setTokens(result)
    return result
  }

  /**
   * Logs the user out. In practice, the JWT will not expire
   * but the tokens are removed from memory and therefore forgotten.
   *
   * @returns `{ success }`
   */
  async logout() {
    const result = await this.post<AuthLogout>('/auth/logout')
    this.unsetTokens()
    return result
  }

  /**
   * Connects to a provider
   *
   * This may be a signup or login event.
   *
   * @param connect An object of `{ token, provider }`
   * @returns `{auth: AuthResult, me: User}`
   */
  async connect(connect: AuthConnectDto) {
    const result = await this.post<AuthConnect>('/auth/connect', {
      payload: connect
    })
    this.setTokens(result.auth)
    return result
  }

  /**
   * Deletes a resource
   * @param url e.g. "/organisations/:organisationId"
   * @param params used for vars, e.g.: `{ organisationId: "12345" }`
   * @returns
   */
  async delete(url: ReadResource, params: NodeJS.Dict<string>) {
    const response = await this.axios.delete(this.applyParams(url, params))
    return response.data as DeleteResult
  }

  /**
   * Upload a file
   * @param url
   * @param params
   * @returns the file entity
   */
  async uploadFile<T>(url: UploadResource, params: UploadResourceParams) {
    const response = await this.axios.post(
      this.applyParams(url, params),
      params.payload,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )
    return response.data as T
  }

  /**
   * Constructs the url by replacing passed parameters
   *
   * @param url e.g. "/organisations/:organisationId"
   * @param params used for vars, e.g.: `{ organisationId: "12345" }`
   * @returns string (url)
   */
  applyParams(
    url: ListResource | ReadResource | CreatableResource | UploadResource,
    params: NodeJS.Dict<any> = {}
  ) {
    const { payload, ...rest } = params
    const replaced = url
      .split('/')
      .map((k) => rest[k.substr(1)] || k)
      .join('/')
    if (replaced.indexOf(':') > -1) {
      throw new ApiParameterError(`URL parameter missing in ${replaced}`)
    }

    return replaced
  }

  /**
   * Sets the tokens in memory
   * used for requests
   *
   * @param tokens
   */
  setTokens(tokens: AuthResultDto) {
    this.tokens = tokens
  }

  /**
   * Clears the tokens (used during logout)
   */
  unsetTokens() {
    this.tokens = null
  }

  /**
   * Gets the tokens in memory
   * @returns `{ id_token, access_token, refresh_token }`
   */
  getTokens() {
    return this.tokens
  }

  /**
   * Sanitize an object's values.
   * Currently this method does nothing
   * but return current values.
   *
   * Anything added here in future should be handled
   * with extreme care or debugging will become
   * difficult for the developer implementing
   * the SDK.
   *
   */
  sanitizeInput(payload: NodeJS.Dict<any> = {}) {
    return payload
  }
}

export function makeApi(axios: AxiosInstance) {
  return new Api(axios)
}

export class ApiError extends Error {
  axiosError?: AxiosError
  constructor(message) {
    super(message)
    this.name = this.constructor.name
    this.axiosError = null
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = new Error(message).stack
    }
  }
}

/**
 * Provides an error for failed reauthorization
 * Usually occurs when the refresh token is no longer
 * valid.
 */
export class AuthorizationRefreshError extends ApiError {
  constructor(msg: { message: string; axiosError: AxiosError }) {
    super(msg)
    const { message, axiosError } = msg
    this.message = message
    this.axiosError = axiosError
  }
}

export class ApiParameterError extends ApiError {
  constructor(msg: string) {
    super(msg)
  }
}

export * from './helpers'
