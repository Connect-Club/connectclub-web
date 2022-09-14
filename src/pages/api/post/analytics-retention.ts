import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'

import { getSessionUser } from '@/api/userApi'
import { postgresAnalyticsClient } from '@/dao/postgresAnalyticsClient'
import { sessionOptions } from '@/lib/session'
import { RetentionReportValues } from '@/model/analyticsModel'

export default withIronSessionApiRoute(async (req: NextApiRequest, res: NextApiResponse) => {
  const [, isLoggedIn, scopeError] = await getSessionUser(req.session, ['admin'])
  if (!isLoggedIn || scopeError) {
    res.status(401).json({})
  } else {
    const params: RetentionReportValues =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : typeof req.body === 'object' && req.body !== null
        ? req.body
        : {}

    try {
      const report = await postgresAnalyticsClient.getRetentionReport(params)
      res.status(200).json(report)
    } catch (e) {
      res.status(501).json({ errors: [e] })
    }
  }
}, sessionOptions)
