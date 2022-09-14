import { doRequest } from '@/lib/Api'
import { ReturnUseApiResponse, ReturnUseApiResponseItems, useApiResponse, useApiResponseItems } from '@/lib/useApi'
import { Errors } from '@/model/apiModel'
import { EventParticipant, FestivalEvent } from '@/model/eventModel'
import { FestivalEventsParamsFilter, FestivalSceneType } from '@/model/festivalModel'

type FestivalScenes = Array<FestivalSceneType>

export const getFestivalEventsList = async (
  filter: FestivalEventsParamsFilter = {},
): Promise<[FestivalEvent[], Errors]> => {
  const response = await doRequest<{ items: FestivalEvent[] }>({
    method: 'GET',
    endpoint: process.env.NEXT_PUBLIC_API_GET_FESTIVAL_EVENTS!,
    data: filter,
  })
  return [response.data?.response?.items || [], response._cc_errors]
}

export const getFestivalSpeakers = async (festivalCode: string): Promise<[EventParticipant[], Errors]> => {
  const response = await doRequest<EventParticipant[]>({
    method: 'GET',
    endpoint: process.env.NEXT_PUBLIC_API_GET_FESTIVAL_SPEAKERS!,
    data: {
      festivalCode,
    },
  })
  return [response.data?.response || [], response._cc_errors]
}

export const getFestivalScenes = async (festivalCode: string): Promise<[FestivalScenes, Errors]> => {
  const response = await doRequest<FestivalScenes>({
    method: 'GET',
    endpoint: process.env.NEXT_PUBLIC_API_GET_FESTIVAL_SCENE!,
    data: {
      festivalCode,
    },
  })
  return [response.data?.response || [], response._cc_errors]
}

export const useFestivalScenes = (festivalCode: string): ReturnUseApiResponse<FestivalSceneType[]> => {
  return useApiResponse<FestivalSceneType[]>(process.env.NEXT_PUBLIC_API_GET_FESTIVAL_SCENE!, {
    festivalCode,
  })
}

export const useFestivalEventsList = (
  filter: FestivalEventsParamsFilter = {},
): ReturnUseApiResponseItems<FestivalEvent> => {
  return useApiResponseItems<FestivalEvent>(process.env.NEXT_PUBLIC_API_GET_FESTIVAL_EVENTS!, filter)
}

export const useFestivalEvent = (id: string): ReturnUseApiResponse<FestivalEvent> => {
  const url =
    id.length && id !== '0' ? process.env.NEXT_PUBLIC_API_GET_EVENT!.replace(/{id}/, encodeURIComponent(id)) : ''
  return useApiResponse<FestivalEvent>(url)
}
