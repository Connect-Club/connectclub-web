import { withIronSessionApiRoute } from 'iron-session/next'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'

import { getSessionUser } from '@/api/userApi'
import { postgresMainClient } from '@/dao/postgresMainClient'
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

    let startMoment = params.start ? moment(params.start).valueOf() : 0
    const endMoment = moment(params.end)
    if (startMoment && startMoment.valueOf() > endMoment.valueOf()) {
      startMoment = endMoment.subtract(6, 'days').valueOf()
    }

    const report = await postgresMainClient.getPushNotificationsReport(startMoment, endMoment.valueOf())

    res.status(200).json(report)
  }
}, sessionOptions)
