import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { doRequest } from '@/lib/Api'
import { ReturnUseApiResponse, useApiResponse } from '@/lib/useApi'
import { State } from '@/model/apiModel'
import { Params } from '@/model/commonModel'
import { EventDraft, EventsType, EventType, FilterParamsEvents, FullEventInfo } from '@/model/eventModel'

export const useDrafts = (): ReturnUseApiResponse<EventDraft[]> => {
  return useApiResponse<EventDraft[]>(process.env.NEXT_PUBLIC_API_GET_EVENT_DRAFTS!)
}

export const useUpcomingEvents = (
  params: FilterParamsEvents = {},
): [EventType[], boolean, Dispatch<SetStateAction<EventType[]>>, number] => {
  const [response, , isLoading] = useApiResponse<EventsType>(process.env.NEXT_PUBLIC_API_GET_UPCOMING!, params)
  const [data, setData] = useState<EventType[]>([])

  useEffect(() => {
    if (!isLoading && response) {
      setData(response.items)
    }
  }, [isLoading, response])

  return [data, isLoading, setData, response?.lastValue || 0]
}

export const getUpcomingEvents = async (params: FilterParamsEvents = {}): Promise<State<EventsType>> => {
  return await doRequest<EventsType>({
    endpoint: process.env.NEXT_PUBLIC_API_GET_UPCOMING!,
    method: 'GET',
    data: params,
  })
}

export const getEvent = async (id: string, params?: Params): Promise<State<FullEventInfo>> => {
  return await doRequest<FullEventInfo>({
    endpoint: process.env.NEXT_PUBLIC_API_GET_EVENT!.replace('{id}', id),
    method: 'GET',
    params: params ?? { headers: { Authorization: '' } },
  })
}
