import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'

import { doRequest } from '@/lib/Api'
import { sessionOptions } from '@/lib/session'

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  await doRequest({
    endpoint: process.env.API_POST_LOGOUT!,
  })
  req.session.destroy()
  res.status(200).json({})
}, sessionOptions)
