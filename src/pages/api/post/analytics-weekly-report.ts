import { withIronSessionApiRoute } from 'iron-session/next'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'

import { getAppsflyerQRClicks } from '@/api/analyticsApi'
import { getSessionUser } from '@/api/userApi'
import { postgresAnalyticsClient } from '@/dao/postgresAnalyticsClient'
import { sessionOptions } from '@/lib/session'

type RequestParams = {
  start: string
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

    const start = (params.start ? moment(params.start) : moment()).format('YYYY-MM-DD')

    const [qrScans, qrScansErrors] = await getAppsflyerQRClicks(
      ['com.connect.club', 'id1500718006'],
      moment(start).subtract(21, 'days').format('YYYY-MM-DD'),
      moment(start).subtract(15, 'days').format('YYYY-MM-DD'),
    )
    const report = await postgresAnalyticsClient.getWeeklyReportFunnel(start)

    if (Object.keys(qrScans).length) {
      const qrScansCount = Object.values(qrScans).reduce((a, b) => a + b)
      if (report.funnel.length) {
        report.funnel[0].rows[1]['count'] = Number(report.funnel[0].rows[1]['count']) + qrScansCount
        report.funnel[0].rows[1]['qrScans'] = qrScansCount
      }
      if (report.common.length) {
        report.common[0].rows[1]['count'] = Number(report.common[0].rows[1]['count']) + qrScansCount
        report.common[0].rows[1]['qrScans'] = qrScansCount
      }
    }

    res.status(200).json({
      funnel: report.funnel,
      common: report.common,
      qrScansErrors,
    })
  }
}, sessionOptions)
