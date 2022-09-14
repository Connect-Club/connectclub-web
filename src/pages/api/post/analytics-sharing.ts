import { withIronSessionApiRoute } from 'iron-session/next'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'

import { getSessionUser } from '@/api/userApi'
import { postgresAnalyticsClient } from '@/dao/postgresAnalyticsClient'
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

    const startMoment = params.start ? moment(params.start) : ''
    const endMoment = moment(params.end)
    const end = endMoment.format('YYYY-MM-DD')
    let start = startMoment && startMoment.format('YYYY-MM-DD')
    if (start && startMoment.valueOf() > endMoment.valueOf()) {
      start = endMoment.subtract(6, 'days').format('YYYY-MM-DD')
    }

    const report = await postgresAnalyticsClient.getSharingReport(start, end)

    res.status(200).json(report)
  }
}, sessionOptions)
