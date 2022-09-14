import { useEffect, useState } from 'react'

import { doRequest } from '@/lib/Api'
import { useApiResponse } from '@/lib/useApi'
import { State } from '@/model/apiModel'
import { Background } from '@/model/backgroundModel'

export const useBackground = (id: number): [Background | undefined, boolean] => {
  const [response, , isLoading] = useApiResponse<Background[]>(process.env.NEXT_PUBLIC_API_GET_BACKGROUNDS!)
  const [data, setData] = useState<Background | undefined>(undefined)

  useEffect(() => {
    if (!isLoading && response?.length) {
      setData(response.filter((el) => Number(el.background.id) === id)[0])
    }
  }, [id, isLoading, response])

  return [data, isLoading]
}

export const getBackgrounds = async (): Promise<State<Background[]>> => {
  return await doRequest<Background[]>({
    method: 'GET',
    endpoint: process.env.NEXT_PUBLIC_API_GET_BACKGROUNDS!,
  })
}

export const getBackground = async (id: number): Promise<Background | undefined> => {
  const response = await getBackgrounds()
  if (!response._cc_errors.length && response.data && response.data.response.length) {
    return response.data.response.filter((el) => Number(el.background.id) === id)[0]
  }
  return undefined
}
