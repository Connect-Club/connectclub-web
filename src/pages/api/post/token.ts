import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'

import { doRequest } from '@/lib/Api'
import { sessionOptions } from '@/lib/session'
import { State } from '@/model/apiModel'
import { GetTokenType } from '@/model/commonModel'

type ResultResponse = Omit<State<GetTokenType>, 'data'> & { data: GetTokenType }
type RequestParams = {
  phone?: string
  code?: string
  signature?: string
  address?: string
  text?: string
}

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  const { phone, code, signature, address, text } =
    typeof req.body === 'string'
      ? JSON.parse(req.body)
      : ((typeof req.body === 'object' && req.body !== null
          ? req.body
          : {
              phone: '',
              code: '',
            }) as RequestParams)

  const data = {
    grant_type: signature ? 'https://connect.club/metamask' : 'https://connect.club/sms',
    client_id: '3_w75581169072706329345647123725564517776625301496592',
    client_secret: 'q29537214568152841289037313417989539943824460713969',
    device_id: address || '',
    text: text || '',
    address: address || '',
    signature: signature || '',
    phone: phone || '',
    code: code || '',
  }

  const response = (await doRequest<GetTokenType>({
    endpoint: process.env.API_POST_GET_TOKEN!,
    params: {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
    body: new URLSearchParams(data).toString(),
  })) as unknown as ResultResponse

  if (!response._cc_errors.length && response?.data?.access_token) {
    req.session.token = response.data.access_token
    req.session.scope = response.data.scope
    req.session.refresh_token = response.data.refresh_token
    await req.session.save()
  }

  if (!response.data) {
    response._cc_errors.push('Cannot authorize')
  }

  res.status(200).json(response)
}, sessionOptions)
