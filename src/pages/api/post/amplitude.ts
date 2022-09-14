import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'

import { doRequest } from '@/lib/Api'
import { sessionOptions } from '@/lib/session'

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  const params =
    typeof req.body === 'string'
      ? JSON.parse(req.body)
      : typeof req.body === 'object' && req.body !== null
      ? req.body
      : {}
  let result = null
  const response = await doRequest({
    endpoint: params.endpoint,
    method: params.method || 'GET',
    data: params.data || {},
    params: {
      headers: Object.assign(
        {},
        {
          'Content-Type': 'application/json',
          accept: '*/*',
          Authorization: 'Basic ' + Buffer.from(process.env.AMPLITUDE_AUTH!, 'utf8').toString('base64'),
        },
        params.headers || {},
      ),
    },
  })

  if (response._cc_errors.length) {
    console.log(response._cc_errors)
  } else {
    result = response.data
  }

  res.status(200).json(result)
}, sessionOptions)
