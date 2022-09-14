import { withIronSessionApiRoute } from 'iron-session/next'
import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'

import { getAppsflyerQRClicks } from '@/api/analyticsApi'
import { getSessionUser } from '@/api/userApi'
import { postgresAnalyticsClient } from '@/dao/postgresAnalyticsClient'
import { sessionOptions } from '@/lib/session'
import { ClubOption } from '@/model/clubModel'

type RequestParams = {
  end: string
  club?: string
  utm_campaign?: string
  start?: string
  filter?: {
    platform: string[]
  }
}

type ResultTypeItem = {
  total: number
  desktop?: number
  mobile?: number
  qr?: number
  platform?: {
    [key: string]: number
  }
}
type ResultType = {
  [key: string]: {
    [key2: string]: ResultTypeItem
  }
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

    const startMoment = params.start ? moment(params.start) : moment()
    const endMoment = moment(params.end)
    const end = endMoment.format('YYYY-MM-DD HH:mm:00')
    let start = startMoment.format('YYYY-MM-DD HH:mm:00')
    if (startMoment.valueOf() > endMoment.valueOf()) {
      start = endMoment.subtract(6, 'days').format('YYYY-MM-DD HH:mm:00')
    }

    const club: ClubOption = params.club ? JSON.parse(params.club) : ''
    const utmCampaign = params.utm_campaign?.split(',').map((item: string) => item.trim()) || []
    const date = [start, end]
    const filter = params.filter || { platform: ['desktop', 'mobile'] }

    const result: ResultType = {}

    /* Pageviews and open app. Grouped by [utm_campaign, isDesktop, platform] */
    const [qrScans, qrScansErrors] = await getAppsflyerQRClicks(
      ['com.connect.club', 'id1500718006'],
      moment(start).format('YYYY-MM-DD'),
      endMoment.subtract(1, 'days').format('YYYY-MM-DD'),
    )
    for (const item of [
      {
        key: 'pageview',
        value: await postgresAnalyticsClient.getEventLandingSegment('club_landing.pageview', club, date[0], date[1]),
      },
      {
        key: 'open_app',
        value: await postgresAnalyticsClient.getEventLandingSegment('club_landing.open_app', club, date[0], date[1]),
      },
    ]) {
      const response = item
      if (response?.value?.length) {
        response.value.forEach((row) => {
          if (
            (utmCampaign.length && !utmCampaign.some((utm) => row.utm.includes(utm))) ||
            (filter.platform.includes('mobile') && !filter.platform.includes('desktop') && row.is_desktop === 'true') ||
            (filter.platform.includes('desktop') && !filter.platform.includes('mobile') && row.is_desktop !== 'true')
          ) {
            return
          }

          if (!result[row.utm]) {
            result[row.utm] = {}
          }
          if (!result[row.utm][item.key]) {
            result[row.utm][item.key] = {
              desktop: 0,
              mobile: 0,
              platform: {},
              total: 0,
            }
          }

          result[row.utm][item.key]['desktop']! += row.is_desktop === 'true' ? 1 : 0
          result[row.utm][item.key]['mobile']! += row.is_desktop !== 'true' ? 1 : 0
          result[row.utm][item.key]['total']! += 1

          if (!result[row.utm][item.key]['platform']![row.platform]) {
            result[row.utm][item.key]['platform']![row.platform] = 0
          }

          result[row.utm][item.key]['platform']![row.platform] += 1
        })
      }
    }

    /* Added scans of QR code */
    if (!qrScansErrors.length) {
      Object.keys(result).forEach((utm) => {
        if (qrScans?.[`${utm}[QR]`]) {
          if (result[utm].open_app) {
            result[utm].open_app.desktop = qrScans?.[`${utm}[QR]`]
            result[utm].open_app.total += qrScans?.[`${utm}[QR]`]
          } else {
            result[utm]['open_app'] = {
              desktop: qrScans?.[`${utm}[QR]`],
              mobile: 0,
              platform: {},
              total: qrScans?.[`${utm}[QR]`],
            }
          }
        }
      })
    }

    /* Installs and openning existing app. Grouped by [utm_campaign, platform, link] */
    for (const item of [
      {
        key: 'install',
        value: await postgresAnalyticsClient.getEventAppSegment('appsflyer_deeplink_install', date[0], date[1]),
      },
    ]) {
      const response = item
      if (response?.value?.length) {
        response.value.forEach((row) => {
          const cleanUtm = row.utm.replace('[QR]', '')

          if (
            (club && !row.link.includes(`clubId_${club.id}`) && !row.link.includes(`clubId_${club.slug}`)) ||
            (utmCampaign.length && !utmCampaign.some((utm) => cleanUtm.includes(utm)))
          ) {
            return
          }

          if (!result[cleanUtm]) {
            result[cleanUtm] = {}
          }
          if (!result[cleanUtm][item.key]) {
            result[cleanUtm][item.key] = {
              platform: {},
              qr: 0,
              total: 0,
            }
          }

          result[cleanUtm][item.key]['total'] += 1

          if (row.utm.includes('[QR]')) {
            result[cleanUtm][item.key]['qr']! += 1
          }

          if (!result[cleanUtm][item.key]['platform']![row.platform]) {
            result[cleanUtm][item.key]['platform']![row.platform] = 0
          }

          result[cleanUtm][item.key]['platform']![row.platform] += 1
        })
      }
    }

    /* User registered (state = 'verified'). Grouped by [utm_campaign] */
    const response = await postgresAnalyticsClient.getUserRegistered(date[0], date[1], club)
    if (response?.length) {
      response.forEach((row) => {
        const cleanUtm = row.utm.replace('[QR]', '')

        if (utmCampaign.length && !utmCampaign.some((utm) => cleanUtm.includes(utm))) {
          return
        }

        if (!result[cleanUtm]) {
          result[cleanUtm] = {}
        }
        if (!result[cleanUtm]['registered']) {
          result[cleanUtm]['registered'] = {
            total: 0,
            qr: 0,
          }
        }

        if (row.utm.includes('[QR]')) {
          result[cleanUtm]['registered']['qr']! += 1
        }

        result[cleanUtm]['registered']['total'] += Number(row.count)
      })
    }

    const response2 = await postgresAnalyticsClient.getParticipatedEventSegment(date[0], date[1], club)
    if (response2?.length) {
      response2.forEach((row) => {
        const cleanUtm = row.utm.replace('[QR]', '')

        if (utmCampaign.length && !utmCampaign.some((utm) => cleanUtm.includes(utm))) {
          return
        }

        if (!result[cleanUtm]) {
          result[cleanUtm] = {}
        }
        if (!result[cleanUtm]['participated_in_event']) {
          result[cleanUtm]['participated_in_event'] = {
            total: 0,
            qr: 0,
          }
        }

        if (row.utm.includes('[QR]')) {
          result[cleanUtm]['participated_in_event']['qr']! += 1
        }

        result[cleanUtm]['participated_in_event']['total'] += Number(row.count)
      })
    }

    res.status(200).json({
      result,
      date,
      qrScansErrors,
    })
  }
}, sessionOptions)
