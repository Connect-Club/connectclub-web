import { ReturnUseApiResponse, useApiResponse } from '@/lib/useApi'
import { Language } from '@/model/languageModel'

export const useLanguages = (): ReturnUseApiResponse<Language[]> => {
  return useApiResponse<Language[]>(process.env.NEXT_PUBLIC_API_GET_LANGUAGE!)
}
