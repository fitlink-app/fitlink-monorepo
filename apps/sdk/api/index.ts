import axios, { AxiosInstance } from 'axios'
import {
  ApiResponse,
  ApiCreateResponse,
  ListResource,
  ListResourceParams,
  SingleResource,
  SingleResourceParams,
  CreateResourceParams
} from './types'

export class Api {
  axios: AxiosInstance

  constructor(axios: AxiosInstance) {
    this.axios = axios
  }

  getAxiosInstance() {
    return this.axios
  }

  async list<T extends ListResource>(url: T, options?: ListResourceParams<T>) {
    const { limit = 10, offset = 0, params } = options
    const response = await this.axios.get(this.applyParams(url, params), {
      data: {
        limit,
        offset
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

  async post<T extends ListResource>(url: T, params: CreateResourceParams<T>) {
    const response = await this.axios.post(
      this.applyParams(url, params),
      params
    )
    return response.data as ApiCreateResponse<T>
  }

  delete(url: Singular, params: NodeJS.Dict<string>) {
    return this.axios.delete(this.applyParams(url, params))
  }

  applyParams(url: string, params: NodeJS.Dict<string>) {
    for (const param in params) {
      url = url.replace(`:${param}`, params[param])
    }
    if (url.indexOf(':') > -1) {
      throw new Error(`URL parameter missing in ${url}`)
    }
    return url
  }
}

const axiosApi = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'x-api-key': 'test'
  }
})

export async function makeApi(axiosInstance = axiosApi) {
  const api = new Api(axiosInstance)
  const result1 = await api.list('/organisations')
  const result = await api.list('/organisations/:organisationId/activities')
  const result2 = await api.get('/organisations/:organisationId', {
    organisationId: 'test'
  })
  const result3 = await api.post(
    '/organisations/:organisationId/activities',
    {}
  )

  return api
}
