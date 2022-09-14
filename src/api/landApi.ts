import { doRequest } from '@/lib/Api'
import { ReturnUseApiResponse, useApiResponse } from '@/lib/useApi'
import { State } from '@/model/apiModel'
import { Lands, Parcel } from '@/model/landModel'

export const getParcel = async (id: number): Promise<State<Parcel>> => {
  return await doRequest<Parcel>({
    endpoint: process.env.NEXT_PUBLIC_API_GET_PARCEL!.replace(/{id}/, encodeURIComponent(id)),
    method: 'GET',
  })
}

export const useParcel = (id: string): ReturnUseApiResponse<Parcel> => {
  return useApiResponse<Parcel>(process.env.NEXT_PUBLIC_API_GET_PARCEL!.replace(/{id}/, encodeURIComponent(id)))
}

export const useLands = (): ReturnUseApiResponse<Lands> => {
  return useApiResponse<Lands>(
    process.env.NEXT_PUBLIC_API_GET_LAND!,
    {},
    {
      headers: { Authorization: '' },
    },
  )
}
