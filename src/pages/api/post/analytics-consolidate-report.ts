import { withIronSessionApiRoute } from 'iron-session/next'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'

import { getSessionUser } from '@/api/userApi'
import { postgresAnalyticsClient } from '@/dao/postgresAnalyticsClient'
import { Api } from '@/lib/Api'
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
    Api.token = req.session.token
    const params: RequestParams =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : typeof req.body === 'object' && req.body !== null
        ? req.body
        : {}

    const startMoment = params.start ? moment(params.start) : ''
    const endMoment = moment(params.end)
    const end = endMoment.format('YYYY-MM-DD HH:mm:00')
    let start = startMoment && startMoment.format('YYYY-MM-DD HH:mm:00')
    if (start && startMoment.valueOf() > endMoment.valueOf()) {
      start = endMoment.subtract(6, 'days').format('YYYY-MM-DD HH:mm:00')
    }

    try {
      const report = await postgresAnalyticsClient.getConsolidateReport(start, end)
      res.status(200).json(report)
    } catch (e) {
      res.status(501).json({ errors: [e] })
    }
  }
}, sessionOptions)
