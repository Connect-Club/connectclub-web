import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { doRequest } from '@/lib/Api'
import { ReturnUseApiResponseItems, useApiResponse, useApiResponseItems } from '@/lib/useApi'
import { Errors } from '@/model/apiModel'
import { Landing, Landings } from '@/model/landingModel'

export const getLandings = async (): Promise<[Landings, Errors]> => {
  const result = await doRequest<{ items: Landings }>({
    endpoint: process.env.NEXT_PUBLIC_API_GET_LANDINGS!,
    method: 'GET',
  })
  return [result.data?.response?.items ?? [], result._cc_errors]
}

export const getLanding = async (landingUrl: string): Promise<[Landing | undefined, Errors]> => {
  const result = await doRequest<Landing>({
    endpoint: process.env.NEXT_PUBLIC_API_GET_LANDING!.replace(/{idOrUrl}/, encodeURIComponent(landingUrl)),
    method: 'GET',
  })
  return [result.data?.response, result._cc_errors]
}

export const useLandings = (): ReturnUseApiResponseItems<Omit<Landing, 'params'>> => {
  return useApiResponseItems<Omit<Landing, 'params'>>(process.env.NEXT_PUBLIC_API_GET_LANDINGS!)
}

export const useLanding = (id: string): [Landing, boolean, Dispatch<SetStateAction<Landing>>] => {
  const url =
    id.length && id !== '0' ? process.env.NEXT_PUBLIC_API_GET_LANDING!.replace(/{idOrUrl}/, encodeURIComponent(id)) : ''
  const [response, , isLoading] = useApiResponse<Landing>(url)
  const [data, setData] = useState<Landing>({ params: {} } as Landing)

  useEffect(() => {
    if (!isLoading && response) {
      setData(response)
    }
  }, [isLoading, response])

  return [data, isLoading, setData]
}
