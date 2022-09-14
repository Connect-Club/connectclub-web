import { withIronSessionApiRoute } from 'iron-session/next'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'

import { getAppsflyerQRClicks } from '@/api/analyticsApi'
import { getSessionUser } from '@/api/userApi'
import { sessionOptions } from '@/lib/session'

type RequestParams = {
  start: string
  end: string
}

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  const [, isLoggedIn, scopeError] = await getSessionUser(req.session, ['admin'])
  if (!isLoggedIn || scopeError) {
    res.status(401).json({})
  } else {
    const params: RequestParams =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : typeof req.body === 'object' && req.body !== null
        ? req.body
        : {}

    const start = moment(params.start).format('YYYY-MM-DD')
    const end = moment(params.end).format('YYYY-MM-DD')

    const [qrScans, qrScansErrors] = await getAppsflyerQRClicks(['com.connect.club', 'id1500718006'], start, end)

    res.status(200).json({
      qrScans,
      qrScansErrors,
    })
  }
}, sessionOptions)
