import { Params } from '@/model/commonModel'

export type Errors = Array<ServerError | string>

export type ServerError = {
  text: string
  url: string
  data: Params
  body?: string[]
  statusCode?: number
}

type MethodType = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE'

export type Request<T> = {
  endpoint: string
  method?: MethodType
  params?: Record<string, unknown>
  data?: Record<string, unknown>
  body?: string | T | File | null | FormData
}

export type ApiResponse<R> = {
  requestId: string
  errors: string[]
  response: R
} | null

export type State<R, D = ApiResponse<R>> = {
  data: D
  _cc_errors: Errors
}
