import { ReturnUseApiResponse, useApiResponse } from '@/lib/useApi'
import { SingleInterestType } from '@/model/interestModel'

export const useInterests = (): ReturnUseApiResponse<SingleInterestType[]> => {
  return useApiResponse<SingleInterestType[]>(process.env.NEXT_PUBLIC_API_GET_INTERESTS!)
}
