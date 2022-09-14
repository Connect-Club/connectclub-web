import { doRequest } from '@/lib/Api'
import { Errors } from '@/model/apiModel'
import { SmartContract } from '@/model/cryptoModel'

export const getSmartContract = async (
  tokenId: string,
  walletAddress = '',
): Promise<[SmartContract | undefined, Errors]> => {
  const response = await doRequest<SmartContract>({
    method: 'GET',
    endpoint: process.env.NEXT_PUBLIC_API_GET_SMART_CONTRACT!.replace(/{tokenId}/, encodeURIComponent(tokenId)),
    data: {
      walletAddress,
    },
    params: { headers: { Authorization: '' } },
  })

  return [response?.data?.response, response._cc_errors]
}
