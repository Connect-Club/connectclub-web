import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { doRequest } from '@/lib/Api'
import { ReturnUseApiResponse, useApiResponse, useApiResponseItems } from '@/lib/useApi'
import { ReturnUseApiResponseItems } from '@/lib/useApi'
import { Errors, State } from '@/model/apiModel'
import { Club, Clubs, ClubsObject, JoinRequest, JoinRequests, Member, Members, MyClub } from '@/model/clubModel'
import { FilterParams, Params } from '@/model/commonModel'
import { EventsType, EventType } from '@/model/eventModel'

export const useClubs = (
  params: FilterParams = {},
): [Club[], boolean, Dispatch<SetStateAction<Club[]>>, number | null, number] => {
  const [response, , isLoading] = useApiResponse<Clubs>(process.env.NEXT_PUBLIC_API_GET_CLUBS!, params)
  const [data, setData] = useState<Club[]>([])

  useEffect(() => {
    if (!isLoading && response) {
      setData(response.items)
    }
  }, [isLoading, response])

  return [data, isLoading, setData, response !== null ? response.lastValue : null, response?.totalCount || 0]
}

export const useMyClubs = (): ReturnUseApiResponseItems<MyClub> => {
  return useApiResponseItems<MyClub>(process.env.NEXT_PUBLIC_API_GET_MY_CLUBS!)
}

export const useClub = (idOrSlug: string): ReturnUseApiResponse<Club> => {
  const url = idOrSlug.length
    ? process.env.NEXT_PUBLIC_API_GET_CLUB!.replace(/{idOrSlug}/, encodeURIComponent(idOrSlug))
    : ''
  return useApiResponse<Club>(url)
}

export const useClubFrontend = (idOrSlug: string): ReturnUseApiResponse<Club> => {
  const url = idOrSlug.length
    ? process.env.NEXT_PUBLIC_API_GET_CLUB!.replace(/{idOrSlug}/, encodeURIComponent(idOrSlug))
    : ''
  return useApiResponse<Club>(url, undefined, {
    headers: {
      Authorization: '',
    },
  })
}

export const useJoinRequests = (
  id: string,
  params: FilterParams = {},
): [JoinRequest[], boolean, Dispatch<SetStateAction<JoinRequest[]>>, number] => {
  const url = process.env.NEXT_PUBLIC_API_GET_CLUB_JOIN_REQUESTS!.replace(/{id}/, encodeURIComponent(id))

  const [response, , isLoading] = useApiResponse<JoinRequests>(url, params)
  const [data, setData] = useState<JoinRequest[]>([])

  useEffect(() => {
    if (!isLoading && response) {
      setData(response.items)
    }
  }, [isLoading, response])

  return [data, isLoading, setData, response?.lastValue || 0]
}

export const useClubEvents = (
  id: string,
  params: FilterParams = {},
): [EventType[], boolean, Dispatch<SetStateAction<EventType[]>>, number] => {
  const url = process.env.NEXT_PUBLIC_API_GET_CLUB_EVENTS!.replace(/{id}/, encodeURIComponent(id))

  const [response, , isLoading] = useApiResponse<EventsType>(url, params, {
    headers: { Authorization: '' },
  })
  const [data, setData] = useState<EventType[]>([])

  useEffect(() => {
    if (!isLoading && response) {
      setData(response.items)
    }
  }, [isLoading, response])

  return [data, isLoading, setData, response?.lastValue || 0]
}

export const useMembers = (
  id: string,
  params: FilterParams = {},
): [Member[], boolean, Dispatch<SetStateAction<Member[]>>, number] => {
  const url = process.env.NEXT_PUBLIC_API_GET_CLUB_MEMBERS!.replace(/{id}/, encodeURIComponent(id))
  const [response, , isLoading] = useApiResponse<Members>(url, params)
  const [data, setData] = useState<Member[]>([])

  useEffect(() => {
    if (!isLoading && response) {
      setData(response.items)
    }
  }, [isLoading, response])

  return [data, isLoading, setData, response?.lastValue || 0]
}

export const getClubs = async (params: FilterParams = {}): Promise<State<Clubs>> => {
  return await doRequest<Clubs>({
    endpoint: process.env.NEXT_PUBLIC_API_GET_CLUBS!,
    method: 'GET',
    data: params,
  })
}

export const getClub = async (idOrSlug: string, params: Params = {}): Promise<[Club | undefined, Errors]> => {
  const result = await doRequest<Club>({
    endpoint: process.env.NEXT_PUBLIC_API_GET_CLUB!.replace(/{idOrSlug}/, encodeURIComponent(idOrSlug)),
    method: 'GET',
    params,
  })
  return [result.data?.response, result._cc_errors]
}

export const getMembers = async (id: string, params: FilterParams = {}): Promise<State<Members>> => {
  return await doRequest<Members>({
    endpoint: process.env.NEXT_PUBLIC_API_GET_CLUB_MEMBERS!.replace(/{id}/, encodeURIComponent(id)),
    method: 'GET',
    data: params,
  })
}

export const getClubEvents = async (id: string, data: FilterParams = {}): Promise<State<EventsType>> => {
  return await doRequest<EventsType>({
    endpoint: process.env.NEXT_PUBLIC_API_GET_CLUB_EVENTS!.replace(/{id}/, encodeURIComponent(id)),
    method: 'GET',
    data: data,
    params: { headers: { Authorization: '' } },
  })
}

export const getJoinRequests = async (id: string, params: FilterParams = {}): Promise<State<JoinRequests>> => {
  return await doRequest<JoinRequests>({
    endpoint: process.env.NEXT_PUBLIC_API_GET_CLUB_JOIN_REQUESTS!.replace(/{id}/, encodeURIComponent(id)),
    method: 'GET',
    data: params,
  })
}

export const useClubsObject = (params: FilterParams = {}): [ClubsObject, boolean] => {
  const [clubs, isLoading] = useClubs(params)
  const clubsObjectWithKeys = clubs.reduce((accum, curVal) => {
    return { ...accum, [curVal['id']]: curVal }
  }, {})
  return [clubsObjectWithKeys, isLoading]
}
