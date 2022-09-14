import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'

import { doRequest } from '@/lib/Api'
import type { Errors } from '@/model/apiModel'
import { Params } from '@/model/commonModel'

export type ReturnUseApiResponse<D> = [D | null, Errors, boolean, Dispatch<SetStateAction<D | null>>]
export type ReturnUseApiResponseItems<D> = [Array<D>, Errors, boolean, Dispatch<SetStateAction<Array<D>>>]

/**
 * This function make request and tries to return "response.data.response"
 * If you need all data from "response.data", then use function "useApi"
 * */
export const useApiResponse = <D>(url: string, postData: Params = {}, params: Params = {}): ReturnUseApiResponse<D> => {
  const [data, setData] = useState<D | null>(null)
  const [errors, setErrors] = useState<Errors>([])
  const [isLoading, setLoading] = useState<boolean>(true)
  const getData = useCallback(async () => {
    const response = await doRequest<D>({
      method: 'GET',
      endpoint: url,
      params: params,
      data: postData,
    })
    if (response._cc_errors.length) {
      setErrors(response._cc_errors)
    } else {
      setData(response.data === null ? null : response.data.response)
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  useEffect(() => {
    getData().then()
  }, [getData])

  return [data, errors, isLoading, setData]
}

export const useApiResponseItems = <D>(
  url: string,
  postData: Params = {},
  params: Params = {},
): ReturnUseApiResponseItems<D> => {
  const [data, errors, isLoading] = useApiResponse<{
    items: Array<D>
    lastValue: number | null
  }>(url, postData, params)
  const [data2, setData2] = useState<Array<D>>([])

  useEffect(() => {
    if (!isLoading && data) {
      setData2(data.items)
    }
  }, [isLoading, data])

  return [data2, errors, isLoading, setData2]
}
