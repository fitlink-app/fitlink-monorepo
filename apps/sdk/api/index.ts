import { AxiosInstance } from 'axios'
import {
  ApiResponse,
  ApiCreateResponse,
  ApiUpdateResponse,
  ListResource,
  ListResourceParams,
  SingleResource,
  SingleResourceParams,
  CreateResourceParams,
  UpdateResourceParams,
  AuthResource
} from './types'

export class Api {
  private axios: AxiosInstance = null
  private token: string = null

  constructor(axios: AxiosInstance) {
    this.axios = axios
    this.useToken()
  }

  getAxiosInstance() {
    return this.axios
  }

  useToken() {
    this.axios.interceptors.request.use(async (config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      return config
    })
  }

  async list<T extends ListResource>(url: T, options?: ListResourceParams<T>) {
    const { limit = 10, page = 0, params } = options
    const response = await this.axios.get(this.applyParams(url, params), {
      params: {
        limit,
        page
      }
    })

    return response.data as ApiResponse<T>
  }

  async get<T extends SingleResource>(
    url: T,
    params?: SingleResourceParams<T>
  ) {
    const response = await this.axios.get(this.applyParams(url, params))
    return response.data as ApiResponse<T>
  }

  async post<T extends ListResource | AuthResource>(
    url: T,
    params: CreateResourceParams<T>
  ) {
    const response = await this.axios.post(
      this.applyParams(url, params),
      params
    )
    return response.data as ApiCreateResponse<T>
  }

  async put<T extends SingleResource>(url: T, params: UpdateResourceParams<T>) {
    const response = await this.axios.put(this.applyParams(url, params), params)
    return response.data as ApiUpdateResponse<T>
  }

  delete(url: SingleResource, params: NodeJS.Dict<string>) {
    return this.axios.delete(this.applyParams(url, params))
  }

  applyParams(url: string, params: NodeJS.Dict<any>) {
    for (const param in params) {
      url = url.replace(`:${param}`, params[param])
    }
    if (url.indexOf(':') > -1) {
      throw new Error(`URL parameter missing in ${url}`)
    }
    return url
  }

  setToken(token: string) {
    this.token = token
  }

  getToken() {
    return this.token
  }
}

export function makeApi(axios: AxiosInstance) {
  return new Api(axios)
}
