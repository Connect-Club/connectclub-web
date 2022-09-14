import merge from 'lodash.merge'
import Cookies from 'universal-cookie'

import { ApiResponse, Errors, Request, ServerError, State } from '@/model/apiModel'
import { Params } from '@/model/commonModel'

export class Api {
  static token?: string
}

export const fetcher = async <R, B = ApiResponse<R>>(
  url: string,
  requestParams: Params = {},
  requestData: Params = {},
  replaceParams = false,
): Promise<State<R, B>> => {
  const errors = [] as Errors
  let body: B | null | ApiResponse<R> = {} as B

  const defaultParams = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const params = replaceParams ? requestParams : merge({}, defaultParams, requestParams)
  if (params.method !== 'GET') {
    params.body = typeof params.body !== 'undefined' ? params.body : JSON.stringify(requestData)
  } else if (Object.keys(requestData).length > 0) {
    url += (url.includes('?') ? '&' : '?') + new URLSearchParams(requestData).toString()
  }

  if (url) {
    try {
      const response = await fetch(url, params)

      // console.log(await response.text(), response.status)
      body = await response.json()
      if (response.status >= 400 && response.status < 600) {
        const errorData: ServerError = {
          statusCode: response.status,
          text: response.statusText,
          body: [],
          url,
          data: requestData,
        }
        if (body && 'errors' in body && body?.errors?.length) {
          errorData.body = errorData.body!.concat(body.errors)
        }
        errors.push(errorData)
      }
    } catch (err) {
      errors.push({
        text: typeof err === 'object' && err !== null ? err.toString() : typeof err === 'string' ? err : '',
        url,
        data: requestData,
      })
    }
  }

  if ((body && !Object.keys(body).length) || !body || errors.length) {
    body = null
  }

  return { data: body, _cc_errors: errors } as State<R, B>
}

export const apiUploadFile = async <R>(
  endpoint: string,
  data: FormData,
  requestParams: Params = {},
): Promise<State<R>> => {
  return await doRequest<R>(
    {
      endpoint: endpoint,
      body: data,
      params: requestParams,
    },
    {},
    { prepareErrors: false },
  )
}

export const doRequest = async <R, B = ApiResponse<R>>(
  request: Request<R>,
  errors?: Record<string, string>,
  additionalParams = { prepareErrors: true },
): Promise<State<R, B> & { securityError: boolean }> => {
  const cookies = new Cookies()
  const token = cookies.get('cc_user')?.access_token || cookies.get('cc_user')?.token || Api.token
  const defaultParams: Params = {
    method: request.method || 'POST',
    headers: {
      accept: 'application/json',
    },
  }
  if (token) {
    defaultParams['headers']['Authorization'] = 'Bearer ' + token
  }
  if (request.body !== undefined) {
    defaultParams['body'] = request.body
  }

  const params = merge({}, defaultParams, request.params)

  const response = await fetcher<R, B>(request.endpoint, params, request.data, true)

  const result: typeof response & { securityError: boolean } = {
    data: response.data,
    _cc_errors: [],
    securityError: false,
  }
  if (response._cc_errors.length) {
    result._cc_errors = additionalParams.prepareErrors
      ? response._cc_errors.map((error) => {
          if (typeof error !== 'string') {
            if (error.statusCode === 401) {
              result['securityError'] = true
            }
            if (error.statusCode && error.statusCode > 400 && error?.body?.length) {
              return errors?.[error.body[0]] ?? error.body[0]
            } else {
              return error.text
            }
          } else {
            return error
          }
        })
      : response._cc_errors
  }
  return result
}

export const logout = async (callback?: () => void): Promise<void> => {
  const cookies = new Cookies()
  await doRequest({
    endpoint: process.env.NEXT_PUBLIC_API_POST_LOGOUT!,
  })
  cookies.remove('cc_user')
  if (callback) {
    await callback()
  }
}
