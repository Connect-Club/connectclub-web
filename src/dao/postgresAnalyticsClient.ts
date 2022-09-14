import moment from 'moment'
import { Pool } from 'pg'

import { getClubs } from '@/api/clubApi'
import { postgresMainClient } from '@/dao/postgresMainClient'
import logger from '@/lib/Logger'
import {
  ClubParticipantsCount,
  ConsolidateReport,
  EventAppSegmentTypeResult,
  EventLandingSegmentTypeResult,
  InvitersReport,
  RegisteredByCountries,
  RetentionReportType,
  RetentionReportValues,
  SharingReportType,
  TotalClubParticipants,
  TotalEventParticipants,
  UserRegisteredTypeResult,
  UserStates,
  WeeklyReportType,
} from '@/model/analyticsModel'
import { ClubOption } from '@/model/clubModel'

class PostgresAnalyticsClient {
  private table = 'amplitude_events'
  protected dbpool

  constructor() {
    this.dbpool = new Pool({
      host: process.env.POSTGRES_ANALYTICS_HOST,
      user: process.env.POSTGRES_ANALYTICS_USER,
      password: process.env.POSTGRES_ANALYTICS_PASS,
      database: process.env.POSTGRES_ANALYTICS_DB,
      min: 1,
      max: 10,
      idleTimeoutMillis: 30000,
    })
  }

  async getLast10(): Promise<Record<string, any>> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT *
                FROM ${this.table}
                ORDER BY client_event_time DESC LIMIT 10
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getEventLandingSegment(
    eventType: string,
    club: ClubOption,
    start: string,
    end: string,
  ): Promise<EventLandingSegmentTypeResult[]> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT event_properties ->>'utm_campaign' as utm, event_properties->>'isDesktop' as is_desktop, event_properties->>'platform' as platform
                FROM ${this.table}
                WHERE client_event_time
                    > '${start}'
                  AND client_event_time
                    < '${end}'
                  AND event_type = '${eventType}'
                  AND user_properties ->> 'Is Tester' IS NULL
                  AND user_properties ->> 'Is Team' IS NULL ${
                    club ? `AND event_properties->>'clubSlug' = '${club.slug}'` : ``
                  }
                  AND event_properties->>'utm_campaign' IS NOT NULL
                GROUP BY amplitude_id, event_properties->>'utm_campaign', event_properties->>'isDesktop', event_properties->>'platform'
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getEventAppSegment(eventType: string, start: string, end: string): Promise<EventAppSegmentTypeResult[]> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT event_properties ->>'utm_campaign' as utm, event_properties->>'link' as link, event_properties->>'platform' as platform
                FROM ${this.table}
                WHERE client_event_time
                    > '${start}'
                  AND client_event_time
                    < '${end}'
                  AND event_type = '${eventType}'
                  AND user_properties ->> 'Is Tester' IS NULL
                  AND user_properties ->> 'Is Team' IS NULL
                  AND event_properties->>'utm_campaign' IS NOT NULL
                GROUP BY amplitude_id, event_properties->>'utm_campaign', event_properties->>'link', event_properties->>'platform'
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getUserRegistered(start: string, end: string, club: ClubOption): Promise<UserRegisteredTypeResult[]> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT COUNT(DISTINCT ae.amplitude_id) as count, ae.user_properties->>'utm_campaign' as utm
                FROM ${this.table} ae
                WHERE ae.client_event_time
                    > '${start}'
                  AND ae.client_event_time
                    < '${end}'
                  AND ae.event_type = 'api.user_registered'
                  AND ae.user_properties ->> 'Is Tester' IS NULL
                  AND ae.user_properties ->> 'Is Team' IS NULL
                  AND ae.user_properties->>'utm_campaign' IS NOT NULL 
                  ${
                    club
                      ? `AND (ae.user_properties->>'clubSlug' = '${club.slug}' OR ae.user_properties->>'referrer' like '%clubId_${club.slug}%' OR ae.user_properties->>'referrer' like '%clubId_${club.id}%')`
                      : ``
                  }
                  AND EXISTS (
                    SELECT 1
                    FROM ${this.table} ae2
                    WHERE ae2.user_properties->>'state' = 'verified'
                  AND ae2.client_event_time
                    > '${start}'
                  AND ae2.client_event_time
                    < '${end}'
                  AND ae2.event_type='api.change_state'
                  AND ae2.amplitude_id = ae.amplitude_id
                    LIMIT 1
                    )
                GROUP BY ae.user_properties->>'utm_campaign'
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getParticipatedEventSegment(start: string, end: string, club: ClubOption): Promise<UserRegisteredTypeResult[]> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT COUNT(DISTINCT ae.amplitude_id) as count, ae.user_properties->>'utm_campaign' as utm
                FROM ${this.table} as ae
                WHERE ae.client_event_time
                    > '${start}'
                  AND ae.client_event_time
                    < '${end}'
                  AND ae.event_type = 'api.participant.room_connected'
                  AND ae.user_properties ->> 'Is Tester' IS NULL
                  AND ae.user_properties ->> 'Is Team' IS NULL
                  AND ae.user_properties->>'utm_campaign' IS NOT NULL 
                  AND EXISTS (
                    SELECT 1
                    FROM ${this.table} ae2
                    WHERE ae2.event_type = 'api.user_registered'
                    ${
                      club
                        ? `AND (ae2.user_properties->>'clubSlug' = '${club.slug}' OR ae2.user_properties->>'referrer' like '%clubId_${club.slug}%' OR ae2.user_properties->>'referrer' like '%clubId_${club.id}%')`
                        : ``
                    }
                  AND ae2.client_event_time
                    > '${start}'
                  AND ae2.client_event_time
                    < '${end}'
                  AND ae2.amplitude_id = ae.amplitude_id
                    LIMIT 1
                    )
                GROUP BY ae.user_properties->>'utm_campaign'
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getWeeklyReportFunnel(start: string): Promise<WeeklyReportType> {
    const connection = await this.dbpool.connect()
    const funnelQuery = async (start: string, end: string) => {
      const postfix = `${moment(start).format('YYYY_MM_DD')}_${moment(end).format('YYYY_MM_DD')}`

      await connection.query(`
                DROP TABLE IF EXISTS amplitude_ids_${postfix};
                CREATE
                TEMP TABLE IF NOT EXISTS amplitude_ids_${postfix} AS
                SELECT DISTINCT amplitude_id
                FROM ${this.table}
                WHERE client_event_time > '${start}'
                  AND client_event_time < '${end}'
                  AND (event_type = 'club_landing.pageview' OR event_type = 'user_landing.pageview')
                  AND user_properties ->> 'Is Tester' IS NULL
                  AND user_properties ->> 'Is Team' IS NULL;

                DROP TABLE IF EXISTS user_verified_ids_${postfix};
                CREATE
                TEMP TABLE IF NOT EXISTS user_verified_ids_${postfix} AS
                SELECT DISTINCT amplitude_id
                FROM ${this.table} ae
                WHERE ae.client_event_time > '${start}'
                  AND ae.client_event_time < '${end}'
                  AND event_type = 'api.user_registered'
                  AND (amplitude_id IN (SELECT amplitude_id FROM amplitude_ids_${postfix}) OR
                       user_properties ->>'utm_campaign' like '%[QR%')
                  AND EXISTS(
                        SELECT 1
                        FROM ${this.table} ae2
                        WHERE ae2.user_properties ->>'state' = 'verified'
                    AND ae2.event_type='api.change_state'
                    AND ae2.client_event_time > '${start}' AND ae2.client_event_time < '${end}'
                    AND ae2.amplitude_id = ae.amplitude_id
                    LIMIT 1
                )
            `)
      return `
                -- Pageviews
                SELECT 1, COUNT(*) FROM amplitude_ids_${postfix}
    
                UNION ALL
    
                -- Clicks
                SELECT 2, COUNT(DISTINCT amplitude_id)
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                AND user_properties ->> 'Is Tester' IS NULL
                AND user_properties ->> 'Is Team' IS NULL
                AND (event_type='club_landing.open_app' OR event_type='user_landing.open_app')
    
                UNION ALL
    
                -- Installs
                SELECT 3, COUNT(DISTINCT amplitude_id)
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                AND event_type='dirty_first_install'
                AND (amplitude_id IN (SELECT amplitude_id FROM amplitude_ids_${postfix}) OR event_properties->>'utm_campaign' like '%[QR%')
    
                UNION ALL
    
                -- Registered
                SELECT 4, COUNT(DISTINCT amplitude_id)
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                AND event_type='api.user_registered'
                AND (amplitude_id IN (SELECT amplitude_id FROM amplitude_ids_${postfix}) OR user_properties->>'utm_campaign' like '%[QR%')
    
                UNION ALL
    
                -- Verified
                SELECT 5, COUNT(*) FROM user_verified_ids_${postfix}
    
                UNION ALL
    
                -- Joined to clubs
                SELECT 6, COUNT(DISTINCT amplitude_id)
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                AND event_type='api.club.member_joined'
                AND (amplitude_id IN (SELECT amplitude_id FROM user_verified_ids_${postfix}))
    
                UNION ALL
    
                -- Participated in events
                SELECT 7, COUNT(DISTINCT amplitude_id)
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                AND event_type='api.participant.room_connected'
                AND (amplitude_id IN (SELECT amplitude_id FROM user_verified_ids_${postfix}))
                
                ORDER BY 1
        `
    }
    const commonQuery = async (start: string, end: string) => {
      return `
                -- Pageviews
                SELECT 1, COUNT(DISTINCT amplitude_id)
                FROM ${this.table}
                WHERE client_event_time > '${start}'
                  AND client_event_time < '${end}'
                  AND (event_type = 'club_landing.pageview' OR event_type = 'user_landing.pageview')
                  AND user_properties ->> 'Is Tester' IS NULL
                  AND user_properties ->> 'Is Team' IS NULL
    
                UNION ALL
    
                -- Clicks
                SELECT 2, COUNT(DISTINCT amplitude_id)
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                AND user_properties ->> 'Is Tester' IS NULL
                AND user_properties ->> 'Is Team' IS NULL
                AND (event_type='club_landing.open_app' OR event_type='user_landing.open_app')
    
                UNION ALL
    
                -- Installs
                SELECT 3, COUNT(DISTINCT amplitude_id)
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                AND user_properties ->> 'Is Tester' IS NULL
                AND user_properties ->> 'Is Team' IS NULL
                AND event_type='dirty_first_install'
    
                UNION ALL
    
                -- Registered
                SELECT 4, COUNT(DISTINCT amplitude_id)
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                AND event_type='api.user_registered'
                AND user_properties ->> 'Is Tester' IS NULL
                AND user_properties ->> 'Is Team' IS NULL
    
                UNION ALL
    
                -- Verified
                SELECT 5, COUNT(DISTINCT amplitude_id)
                FROM ${this.table} ae
                WHERE ae.client_event_time > '${start}'
                  AND ae.client_event_time < '${end}'
                  AND ae.event_type = 'api.user_registered'
                  AND ae.user_properties ->> 'Is Tester' IS NULL
                  AND ae.user_properties ->> 'Is Team' IS NULL
                  AND EXISTS(
                        SELECT 1
                        FROM ${this.table} ae2
                        WHERE ae2.user_properties ->>'state' = 'verified'
                    AND ae2.event_type='api.change_state'
                    AND ae2.client_event_time > '${start}' AND ae2.client_event_time < '${end}'
                    AND ae2.amplitude_id = ae.amplitude_id
                    LIMIT 1
                )
    
                UNION ALL
    
                -- Joined to clubs
                SELECT 6, COUNT(DISTINCT amplitude_id)
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                AND event_type='api.club.member_joined'
                AND user_properties ->> 'Is Tester' IS NULL
                AND user_properties ->> 'Is Team' IS NULL
    
                UNION ALL
    
                -- Participated in events
                SELECT 7, COUNT(DISTINCT amplitude_id)
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                AND event_type='api.participant.room_connected'
                AND user_properties ->> 'Is Tester' IS NULL
                AND user_properties ->> 'Is Team' IS NULL
                
                ORDER BY 1
        `
    }
    try {
      const week1 = moment(start).subtract(21, 'days').format('YYYY-MM-DD 00:00:00')
      const week2 = moment(start).subtract(14, 'days').format('YYYY-MM-DD 00:00:00')
      const week3 = moment(start).subtract(7, 'days').format('YYYY-MM-DD 00:00:00')
      const res_week1 = await connection.query(await funnelQuery(week1, week2))
      const res_week2 = await connection.query(await funnelQuery(week2, week3))
      const res_week3 = await connection.query(await funnelQuery(week3, start))
      const res_common_week1 = await connection.query(await commonQuery(week1, week2))
      const res_common_week2 = await connection.query(await commonQuery(week2, week3))
      const res_common_week3 = await connection.query(await commonQuery(week3, start))
      return {
        funnel: [
          {
            rows: res_week1.rows,
            date: [week1, week2],
          },
          {
            rows: res_week2.rows,
            date: [week2, week3],
          },
          {
            rows: res_week3.rows,
            date: [week3, start],
          },
        ],
        common: [
          {
            rows: res_common_week1.rows,
            date: [week1, week2],
          },
          {
            rows: res_common_week2.rows,
            date: [week2, week3],
          },
          {
            rows: res_common_week3.rows,
            date: [week3, start],
          },
        ],
      }
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return { funnel: [], common: [] }
  }

  async getSharingReport(start: string, end: string): Promise<SharingReportType> {
    const connection = await this.dbpool.connect()

    // If start is empty, build 3 weeks report
    // If start > 6 days, group by weeks
    // If start > 50 days, group by months

    if (!start) {
      start = moment(end).subtract(21, 'days').format('YYYY-MM-DD')
    }
    const diff = moment(end).diff(moment(start), 'days')
    const interval = diff <= 6 ? 'day' : diff < 50 ? 'week' : 'month'

    const shareEventQuery = async (start: string, end: string) => {
      return `
                SELECT 
                    DATE_TRUNC('${interval}', client_event_time::timestamptz) as d, 
                    COUNT(amplitude_id) FILTER (WHERE event_type='main_feed_show_event_click') as shown,
                    COUNT(DISTINCT amplitude_id) FILTER (WHERE event_type='main_feed_show_event_click') as shown_unique,
                    COUNT(amplitude_id) FILTER (WHERE event_type='event_card_copy_link') as copy_link,
                    COUNT(DISTINCT amplitude_id) FILTER (WHERE event_type='event_card_copy_link') as copy_link_unique,
                    COUNT(amplitude_id) FILTER (WHERE event_type='event_card_share_click') as share_click,
                    COUNT(DISTINCT amplitude_id) FILTER (WHERE event_type='event_card_share_click') as share_click_unique,
                    COUNT(amplitude_id) FILTER (
                        WHERE event_type='appsflyer_deeplink_open' AND event_properties ->> 'utm_campaign' = 'share_event'
                    ) as deeplink_open,
                    COUNT(DISTINCT amplitude_id) FILTER (
                        WHERE event_type='appsflyer_deeplink_open' AND event_properties ->> 'utm_campaign' = 'share_event'
                    ) as deeplink_open_unique,
                    COUNT(amplitude_id) FILTER (
                        WHERE event_type='club_landing.pageview' AND event_properties ->> 'utm_campaign' = 'share_event'    
                    ) as pageview,
                    COUNT(DISTINCT amplitude_id) FILTER (
                        WHERE event_type='club_landing.pageview' AND event_properties ->> 'utm_campaign' = 'share_event'
                    ) as pageview_unique,
                    COUNT(DISTINCT amplitude_id) FILTER (
                        WHERE ae.client_event_time >= '${start} 00:00:00' AND ae.client_event_time < '${end} 00:00:00'
                        AND ae.event_type = 'api.user_registered'
                        AND ae.user_properties ->> 'Is Tester' IS NULL
                        AND ae.user_properties ->> 'Is Team' IS NULL
                        AND ae.user_properties ->> 'utm_campaign' = 'share_event'
                    ) as registered,
                    COUNT(DISTINCT amplitude_id) FILTER (
                        WHERE ae.client_event_time >= '${start} 00:00:00' AND ae.client_event_time < '${end} 00:00:00'
                        AND ae.event_type = 'api.user_registered'
                        AND ae.user_properties ->> 'Is Tester' IS NULL
                        AND ae.user_properties ->> 'Is Team' IS NULL
                        AND ae.user_properties ->> 'utm_campaign' = 'share_event'
                        AND EXISTS(
                            SELECT 1
                            FROM ${this.table} ae2
                            WHERE ae2.user_properties ->>'state' = 'verified'
                            AND ae2.event_type='api.change_state'
                            AND ae2.client_event_time >= '${start} 00:00:00' AND ae2.client_event_time < '${end} 00:00:00'
                            AND ae2.amplitude_id = ae.amplitude_id
                            LIMIT 1
                        )
                    ) as verified
                FROM ${this.table} ae
                WHERE client_event_time >= '${start} 00:00:00' AND client_event_time < '${end} 00:00:00'
                AND user_properties ->> 'Is Tester' IS NULL
                AND user_properties ->> 'Is Team' IS NULL
                GROUP BY d
            `
    }

    const shareClubQuery = async (start: string, end: string) => {
      return `
                SELECT
                    DATE_TRUNC('${interval}', client_event_time::timestamptz) as d,
                    COUNT(amplitude_id) FILTER (WHERE event_type='club_screen_open') as shown,
                    COUNT(DISTINCT amplitude_id) FILTER (WHERE event_type='club_screen_open') as shown_unique,
                    COUNT(amplitude_id) FILTER (WHERE event_type='club_view_share_click') as share_click,
                    COUNT(DISTINCT amplitude_id) FILTER (WHERE event_type='club_view_share_click') as share_click_unique,
                    COUNT(amplitude_id) FILTER (
                        WHERE event_type='appsflyer_deeplink_open' AND event_properties ->> 'utm_campaign' = 'share_club'
                    ) as deeplink_open,
                    COUNT(DISTINCT amplitude_id) FILTER (
                        WHERE event_type='appsflyer_deeplink_open' AND event_properties ->> 'utm_campaign' = 'share_club'
                    ) as deeplink_open_unique,
                    COUNT(amplitude_id) FILTER (
                        WHERE event_type='club_landing.pageview' AND event_properties ->> 'utm_campaign' = 'share_club'
                    ) as pageview,
                    COUNT(DISTINCT amplitude_id) FILTER (
                        WHERE event_type='club_landing.pageview' AND event_properties ->> 'utm_campaign' = 'share_club'
                    ) as pageview_unique,
                    COUNT(DISTINCT amplitude_id) FILTER (
                        WHERE ae.client_event_time >= '${start} 00:00:00' AND ae.client_event_time < '${end} 00:00:00'
                        AND ae.event_type = 'api.user_registered'
                        AND ae.user_properties ->> 'Is Tester' IS NULL
                        AND ae.user_properties ->> 'Is Team' IS NULL
                        AND ae.user_properties ->> 'utm_campaign' = 'share_club'
                    ) as registered,
                    COUNT(DISTINCT amplitude_id) FILTER (
                        WHERE ae.client_event_time >= '${start} 00:00:00' AND ae.client_event_time < '${end} 00:00:00'
                        AND ae.event_type = 'api.user_registered'
                        AND ae.user_properties ->> 'Is Tester' IS NULL
                        AND ae.user_properties ->> 'Is Team' IS NULL
                        AND ae.user_properties ->> 'utm_campaign' = 'share_club'
                        AND EXISTS(
                            SELECT 1
                            FROM ${this.table} ae2
                            WHERE ae2.user_properties ->>'state' = 'verified'
                            AND ae2.event_type='api.change_state'
                            AND ae2.client_event_time >= '${start} 00:00:00' AND ae2.client_event_time < '${end} 00:00:00'
                            AND ae2.amplitude_id = ae.amplitude_id
                            LIMIT 1
                        )
                    ) as verified
                FROM ${this.table} ae
                WHERE client_event_time >= '${start} 00:00:00' AND client_event_time < '${end} 00:00:00'
                AND user_properties ->> 'Is Tester' IS NULL
                AND user_properties ->> 'Is Team' IS NULL
                GROUP BY d
            `
    }

    const shareRoomQuery = async (start: string, end: string) => {
      return `
                 SELECT
                     DATE_TRUNC('${interval}', client_event_time::timestamptz) as d,
                     COUNT(amplitude_id) FILTER (WHERE event_type='api.participant.room_connected') as shown,
                     COUNT(DISTINCT amplitude_id) FILTER (WHERE event_type='api.participant.room_connected') as shown_unique,
                     COUNT(amplitude_id) FILTER (WHERE event_type='click_invite_friends_button') as share_click,
                     COUNT(DISTINCT amplitude_id) FILTER (WHERE event_type='click_invite_friends_button') as share_click_unique,
                     COUNT(amplitude_id) FILTER (WHERE event_type='click_share_room_link') as click_link,
                     COUNT(DISTINCT amplitude_id) FILTER (WHERE event_type='click_share_room_link') as click_link_unique,
                     COUNT(amplitude_id) FILTER (
                         WHERE event_type='appsflyer_deeplink_open' AND event_properties ->> 'utm_campaign' = 'share_room'
                     ) as deeplink_open,
                     COUNT(DISTINCT amplitude_id) FILTER (
                         WHERE event_type='appsflyer_deeplink_open' AND event_properties ->> 'utm_campaign' = 'share_room'
                     ) as deeplink_open_unique,
                     COUNT(amplitude_id) FILTER (
                         WHERE event_type='appsflyer_deeplink_install' AND event_properties ->> 'utm_campaign' = 'share_room'
                     ) as deeplink_install,
                     COUNT(DISTINCT amplitude_id) FILTER (
                         WHERE event_type='appsflyer_deeplink_install' AND event_properties ->> 'utm_campaign' = 'share_room'
                     ) as deeplink_install_unique,
                     COUNT(DISTINCT amplitude_id) FILTER (
                         WHERE ae.client_event_time >= '${start} 00:00:00' AND ae.client_event_time < '${end} 00:00:00'
                         AND ae.event_type = 'api.user_registered'
                         AND ae.user_properties ->> 'Is Tester' IS NULL
                         AND ae.user_properties ->> 'Is Team' IS NULL
                         AND ae.user_properties ->> 'utm_campaign' = 'share_room'
                     ) as registered,
                     COUNT(DISTINCT amplitude_id) FILTER (
                         WHERE ae.client_event_time >= '${start} 00:00:00' AND ae.client_event_time < '${end} 00:00:00'
                         AND ae.event_type = 'api.user_registered'
                         AND ae.user_properties ->> 'Is Tester' IS NULL
                         AND ae.user_properties ->> 'Is Team' IS NULL
                         AND ae.user_properties ->> 'utm_campaign' = 'share_room'
                         AND EXISTS(
                             SELECT 1
                             FROM ${this.table} ae2
                             WHERE ae2.user_properties ->>'state' = 'verified'
                             AND ae2.event_type='api.change_state'
                             AND ae2.client_event_time >= '${start} 00:00:00' AND ae2.client_event_time < '${end} 00:00:00'
                             AND ae2.amplitude_id = ae.amplitude_id
                             LIMIT 1
                         )
                     ) as verified
                 FROM ${this.table} ae
                 WHERE client_event_time >= '${start} 00:00:00' AND client_event_time < '${end} 00:00:00'
                 AND user_properties ->> 'Is Tester' IS NULL
                 AND user_properties ->> 'Is Team' IS NULL
                 GROUP BY d
            `
    }

    try {
      const shareEventResult = await connection.query(await shareEventQuery(start, end))
      const shareClubResult = await connection.query(await shareClubQuery(start, end))
      const shareRoomResult = await connection.query(await shareRoomQuery(start, end))
      return {
        interval,
        date: [start, end],
        share_event: shareEventResult.rows,
        share_club: shareClubResult.rows,
        share_room: shareRoomResult.rows,
      }
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return {
      interval: '',
      share_event: [],
      share_club: [],
      share_room: [],
      date: [start, end],
    }
  }

  async getRetentionReport(params: RetentionReportValues): Promise<RetentionReportType> {
    const connection = await this.dbpool.connect()
    const start = moment(params.date[0]).format('YYYY-MM-DD 00:00:00')
    const end = moment(params.date[1]).format('YYYY-MM-DD 00:00:00')

    const prepareBaseEventSQL = (eventName: string) => {
      if (eventName.startsWith('custom:')) {
        switch (eventName) {
          case 'custom:user_registered':
            return `ae.event_type='api.change_state' AND ae.user_properties->>'state' = 'verified'
                    AND EXISTS (
                        SELECT 1
                        FROM ${this.table} ae2
                        WHERE ae2.user_properties ->> 'Is Tester' IS NULL
                          AND ae2.user_properties ->> 'Is Team' IS NULL
                          AND ae2.client_event_time > '${start}' AND ae2.client_event_time < '${end}'
                          AND ae2.event_type='api.user_registered'
                          AND ae2.amplitude_id = ae.amplitude_id
                        LIMIT 1
                    )`
        }
      }
      return `ae.event_type='${eventName}'`
    }

    const prepareTargetEventSQL = (eventNames: string[]) => {
      const conditions: string[] = []
      eventNames.forEach((event) => {
        if (event.startsWith('custom:')) {
          switch (event) {
            case 'custom:any_event':
              break
          }
        } else {
          conditions.push(`A.event_type='${event}'`)
        }
      })
      return conditions.length ? `(${conditions.join(' OR ')})` : `1=1`
    }

    try {
      const postfix = `${moment(start).format('YYYY_MM_DD')}_${moment(end).format('YYYY_MM_DD')}`
      await connection.query(`
                DROP TABLE IF EXISTS cohort_items_${postfix};
                CREATE TEMP TABLE IF NOT EXISTS cohort_items_${postfix} AS
                SELECT
                    DISTINCT ae.amplitude_id,
                    MIN(ae.client_event_time) as min_client_event_time,
                    date_trunc('${params.time_bucket}', MIN(ae.client_event_time))::date as cohort_time_bucket
                FROM ${this.table} ae
                WHERE ae.client_event_time > '${start}' AND ae.client_event_time < '${end}'
                    AND ${prepareBaseEventSQL(params.base)}
                GROUP BY ae.amplitude_id
                ORDER BY 2, 1;
                create index IF NOT EXISTS temp_cohort_items_amplitude_id_${postfix} on cohort_items_${postfix}(amplitude_id);
                create index IF NOT EXISTS temp_cohort_items_min_${postfix} on cohort_items_${postfix}(min_client_event_time);
                create index IF NOT EXISTS temp_cohort_items_time_${postfix} on cohort_items_${postfix}(cohort_time_bucket);
                  
                DROP TABLE IF EXISTS user_activities_${postfix};
                CREATE
                TEMP TABLE IF NOT EXISTS user_activities_${postfix} AS
                SELECT
                    A.amplitude_id,
                    (CAST(date_trunc('${
                      params.time_bucket
                    }', A.client_event_time) as date) - C.cohort_time_bucket) as bucket_number
                FROM ${this.table} A
                LEFT JOIN cohort_items_${postfix} C ON A.amplitude_id = C.amplitude_id
                WHERE A.client_event_time > C.min_client_event_time AND A.client_event_time < '${end}'
                    AND (CAST(date_trunc('${
                      params.time_bucket
                    }', A.client_event_time) as date) - C.cohort_time_bucket) <= ${params.buckets_count}
                    AND ${prepareTargetEventSQL(params.target)}
                GROUP BY 1, 2; 
                create index IF NOT EXISTS temp_user_activities_amplitude_id_${postfix} on user_activities_${postfix}(amplitude_id);
                    
                DROP TABLE IF EXISTS cohort_size_${postfix};
                CREATE
                TEMP TABLE IF NOT EXISTS cohort_size_${postfix} AS
                SELECT
                    cohort_time_bucket,
                    COUNT(1) as num_users
                FROM cohort_items_${postfix}
                GROUP BY 1
                ORDER BY 1;
                
                DROP TABLE IF EXISTS retention_table_${postfix};
                CREATE
                TEMP TABLE IF NOT EXISTS retention_table_${postfix} AS
                SELECT
                    C.cohort_time_bucket,
                    A.bucket_number,
                    COUNT(1) as num_users,
                    array_agg(A.amplitude_id) as amplitude_ids
                FROM user_activities_${postfix} A
                LEFT JOIN cohort_items_${postfix} C ON A.amplitude_id = C.amplitude_id
                GROUP BY 1, 2;
            `)
      const sql = `
                SELECT
                  B.cohort_time_bucket,
                  S.num_users::integer as total_users,
                  B.bucket_number::integer,
                  B.num_users::integer as bucket_users,
                  B.num_users::float * 100 / S.num_users as percentage,
                  B.amplitude_ids
                FROM retention_table_${postfix} B
                LEFT JOIN cohort_size_${postfix} S ON B.cohort_time_bucket = S.cohort_time_bucket
                WHERE B.cohort_time_bucket IS NOT NULL
                ORDER BY 1, 3
            `

      const result = await connection.query(sql)
      return {
        date: [start, end],
        rows: result.rows || [],
        time_bucket: params.time_bucket,
      }
    } catch (err) {
      logger.error(err)
      console.log(err)
    } finally {
      connection.release()
    }
    return { rows: [], date: [start, end], time_bucket: '' }
  }

  async getConsolidateReport(start: string, end: string): Promise<ConsolidateReport> {
    const connection = await this.dbpool.connect()

    const result = {
      date: [start, end],
      tables: {},
    } as ConsolidateReport

    const startUnix = start ? moment(`${start}.000Z`).unix() : 0
    const endUnix = moment(`${end}.000Z`).unix()

    const week1 = moment(end).subtract(21, 'days').format('YYYY-MM-DD 00:00:00')
    const week2 = moment(end).subtract(14, 'days').format('YYYY-MM-DD 00:00:00')
    const week3 = moment(end).subtract(7, 'days').format('YYYY-MM-DD 00:00:00')

    const week1Unix = moment(`${end}.000Z`).subtract(21, 'days').unix()
    const week2Unix = moment(`${end}.000Z`).subtract(14, 'days').unix()
    const week3Unix = moment(`${end}.000Z`).subtract(7, 'days').unix()

    const createTempTables = async (start: string, end: string, postfix: string) => {
      const sql = `
                DROP TABLE IF EXISTS user_state_table_${postfix};
                CREATE
                TEMP TABLE IF NOT EXISTS user_state_table_${postfix} AS
                SELECT ae.amplitude_id, 
                    (array_agg(ae.user_properties->>'state' ORDER BY ae.client_event_time DESC))[1] as user_state
                FROM ${this.table} ae
                WHERE ae.event_type='api.change_state' AND ae.client_event_time > '${start}' 
                AND ae.client_event_time < '${end}'
                AND EXISTS (
                    SELECT 1
                    FROM ${this.table} ae2
                    WHERE ae2.user_properties ->> 'Is Tester' IS NULL
                      AND ae2.user_properties ->> 'Is Team' IS NULL
                      AND ae2.client_event_time > '${start}' AND ae2.client_event_time < '${end}'
                      AND ae2.event_type='api.user_registered'
                      AND ae2.amplitude_id = ae.amplitude_id
                    LIMIT 1
                )
                GROUP BY ae.amplitude_id;
                
                DROP TABLE IF EXISTS user_last_states_table_${postfix};
                CREATE
                TEMP TABLE IF NOT EXISTS user_last_states_table_${postfix} AS
                SELECT 
                    ae.amplitude_id, 
                    ae.event_type,
                    ust.user_state,
                    (ROW_NUMBER() OVER (PARTITION BY ae.amplitude_id ORDER BY ae.client_event_time DESC)) AS rr
                FROM user_state_table_${postfix} ust
                LEFT JOIN ${this.table} ae on ae.amplitude_id = ust.amplitude_id
                WHERE ust.user_state = 'invited' OR ust.user_state = 'not_invited' AND ae.client_event_time > '${start}' 
                AND ae.client_event_time < '${end}';
            `
      try {
        await connection.query(sql)
      } catch (e) {
        console.log(sql)
      }
    }

    const getUserStates = async (start: string, end: string) => {
      const postfix = `${start ? moment(start).format('YYYY_MM_DD') : '0'}_${moment(end).format('YYYY_MM_DD')}`
      await createTempTables(start, end, postfix)
      return `
                SELECT 
                 CASE ust.user_state WHEN 'verified' THEN 4 ELSE 5 END,
                 ust.user_state, 
                 COUNT(DISTINCT ust.amplitude_id)::integer as count,
                 CASE ust.user_state  		
                    WHEN 'invited' THEN json_build_object('push_send_fail', (
                        SELECT COUNT(DISTINCT amplitude_id)
                        FROM user_last_states_table_${postfix}
                        WHERE event_type = 'push_send_fail' AND user_state = 'invited'
                     ))
                    WHEN 'not_invited' THEN json_build_object('last_states', ( 
                            SELECT array_to_json(array_agg(row_to_json(t))) FROM (
                                SELECT event_type, COUNT(DISTINCT amplitude_id)
                                FROM user_last_states_table_${postfix}
                                WHERE rr <= 1 AND user_state = 'not_invited'
                                GROUP BY event_type
                                ORDER BY count DESC
                                LIMIT 10
                            ) t
                    ))
                     ELSE '{}' END as additional
                FROM user_state_table_${postfix} ust
                JOIN ${this.table} ae on ae.amplitude_id = ust.amplitude_id 
                GROUP BY ust.user_state
                
                UNION ALL
                    
                SELECT 1, 'installs', COUNT(DISTINCT amplitude_id)::integer as count, '{}'
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                AND user_properties ->> 'Is Tester' IS NULL
                AND user_properties ->> 'Is Team' IS NULL
                AND event_type='dirty_first_install'
                
                UNION ALL
                
                SELECT 2, 'registered', COUNT(DISTINCT amplitude_id)::integer as count, '{}'
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                AND event_type='api.user_registered'
                AND user_properties ->> 'Is Tester' IS NULL
                AND user_properties ->> 'Is Team' IS NULL
                
                ORDER BY 1, count DESC
            `
    }
    const getClubParticipantsCount = async (start: string, end: string) => {
      return `
                SELECT event_properties->>'slug' as clubSlug, COUNT(DISTINCT amplitude_id)::integer as new_participants
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                    AND event_type='api.club.member_joined'
                    AND user_properties ->> 'Is Tester' IS NULL
                    AND user_properties ->> 'Is Team' IS NULL
                GROUP BY event_properties->>'slug'
                ORDER BY new_participants DESC
                LIMIT 50
            `
    }
    const getTotalClubParticipants = async (start: string, end: string) => {
      return `
                SELECT COUNT(DISTINCT amplitude_id)::integer
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                    AND event_type='api.club.member_joined'
                    AND user_properties ->> 'Is Tester' IS NULL
                    AND user_properties ->> 'Is Team' IS NULL
            `
    }
    const getTotalEventParticipants = async (start: string, end: string) => {
      return `
                SELECT COUNT(DISTINCT amplitude_id)::integer
                FROM ${this.table}
                WHERE client_event_time > '${start}' AND client_event_time < '${end}'
                    AND event_type='api.participant.room_connected'
                    AND user_properties ->> 'Is Tester' IS NULL
                    AND user_properties ->> 'Is Team' IS NULL
            `
    }
    const getRegisteredByCountries = async (start: string, end: string) => {
      return `
                SELECT ae.country, COUNT(DISTINCT ae.amplitude_id)::integer as count_users
                FROM ${this.table} ae
                WHERE ae.event_type='api.change_state' AND ae.user_properties->>'state' = 'verified'
                AND ae.client_event_time > '${start}' AND ae.client_event_time < '${end}'
                AND ae.country IS NOT NULL
                AND EXISTS (
                    SELECT 1
                    FROM ${this.table} ae2
                    WHERE ae2.user_properties ->> 'Is Tester' IS NULL
                      AND ae2.user_properties ->> 'Is Team' IS NULL
                      AND ae2.client_event_time > '${start}' AND ae2.client_event_time < '${end}'
                      AND ae2.event_type='api.user_registered'
                      AND ae2.amplitude_id = ae.amplitude_id
                    LIMIT 1
                    )
                GROUP BY ae.country
                ORDER BY count_users DESC
                LIMIT 30
            `
    }
    try {
      const totalClubMembers = await postgresMainClient.getTotalClubMembers()

      if (start) {
        const userStates = await connection.query<UserStates>(await getUserStates(start, end))
        const clubParticipantsCount = await connection.query<ClubParticipantsCount>(
          await getClubParticipantsCount(start, end),
        )
        const totalClubParticipants = await connection.query<TotalClubParticipants>(
          await getTotalClubParticipants(start, end),
        )
        const totalEventParticipants = await connection.query<TotalEventParticipants>(
          await getTotalEventParticipants(start, end),
        )
        const registeredByCountries = await connection.query<RegisteredByCountries>(
          await getRegisteredByCountries(start, end),
        )

        result['tables']['userStates'] = [
          {
            rows: userStates.rows,
            date: [start, end],
          },
        ]

        result['tables']['clubParticipantsCount'] = [
          {
            rows: clubParticipantsCount.rows,
            date: [start, end],
          },
        ]

        result['tables']['totalClubParticipants'] = [
          {
            rows: totalClubParticipants.rows,
            date: [start, end],
          },
        ]

        result['tables']['totalEventParticipants'] = [
          {
            rows: totalEventParticipants.rows,
            date: [start, end],
          },
        ]

        result['tables']['registeredByCountries'] = [
          {
            rows: registeredByCountries.rows,
            date: [start, end],
          },
        ]

        result['tables']['invites'] = [
          {
            rows: await postgresMainClient.getInvitesGroupedByStates(startUnix, endUnix),
            date: [start, end],
          },
        ]
        result['tables']['topIndividualInviters'] = [
          {
            rows: await postgresMainClient.getTopIndividualInviters(startUnix, endUnix),
            date: [start, end],
          },
        ]
        result['tables']['eventsByCountries'] = [
          {
            rows: await postgresMainClient.getEventsByCountries(startUnix, endUnix),
            date: [start, end],
          },
        ]
        result['tables']['typeOfRooms'] = [
          {
            rows: await postgresMainClient.getTypeOfRooms(startUnix, endUnix),
            date: [start, end],
          },
        ]
        result['tables']['totalNewClubs'] = [
          {
            rows: await postgresMainClient.getTotalNewClubs(startUnix, endUnix),
            date: [start, end],
          },
        ]
        result['tables']['clubEventsCount'] = [
          {
            rows: await postgresMainClient.getClubEventsCount(startUnix, endUnix),
            date: [start, end],
          },
        ]
        result['tables']['clubOwnersInvitedBy'] = [
          {
            rows: await postgresMainClient.getClubOwnersInvitedBy(startUnix, endUnix),
            date: [start, end],
          },
        ]
      } else {
        const userStatesWeek1 = await connection.query<UserStates>(await getUserStates(week1, week2))
        const userStatesWeek2 = await connection.query<UserStates>(await getUserStates(week2, week3))
        const userStatesWeek3 = await connection.query<UserStates>(await getUserStates(week3, end))

        const clubParticipantsCountWeek1 = await connection.query<ClubParticipantsCount>(
          await getClubParticipantsCount(week1, week2),
        )
        const clubParticipantsCountWeek2 = await connection.query<ClubParticipantsCount>(
          await getClubParticipantsCount(week2, week3),
        )
        const clubParticipantsCountWeek3 = await connection.query<ClubParticipantsCount>(
          await getClubParticipantsCount(week3, end),
        )

        const totalClubParticipantsWeek1 = await connection.query<TotalClubParticipants>(
          await getTotalClubParticipants(week1, week2),
        )
        const totalClubParticipantsWeek2 = await connection.query<TotalClubParticipants>(
          await getTotalClubParticipants(week2, week3),
        )
        const totalClubParticipantsWeek3 = await connection.query<TotalClubParticipants>(
          await getTotalClubParticipants(week3, end),
        )

        const totalEventParticipantsWeek1 = await connection.query<TotalEventParticipants>(
          await getTotalEventParticipants(week1, week2),
        )
        const totalEventParticipantsWeek2 = await connection.query<TotalEventParticipants>(
          await getTotalEventParticipants(week2, week3),
        )
        const totalEventParticipantsWeek3 = await connection.query<TotalEventParticipants>(
          await getTotalEventParticipants(week3, end),
        )

        const registeredByCountriesWeek1 = await connection.query<RegisteredByCountries>(
          await getRegisteredByCountries(week1, week2),
        )
        const registeredByCountriesWeek2 = await connection.query<RegisteredByCountries>(
          await getRegisteredByCountries(week2, week3),
        )
        const registeredByCountriesWeek3 = await connection.query<RegisteredByCountries>(
          await getRegisteredByCountries(week3, end),
        )

        result['tables']['userStates'] = [
          {
            rows: userStatesWeek1.rows,
            date: [week1, week2],
          },
          {
            rows: userStatesWeek2.rows,
            date: [week2, week3],
          },
          {
            rows: userStatesWeek3.rows,
            date: [week3, end],
          },
        ]

        result['tables']['clubParticipantsCount'] = [
          {
            rows: clubParticipantsCountWeek1.rows,
            date: [week1, week2],
          },
          {
            rows: clubParticipantsCountWeek2.rows,
            date: [week2, week3],
          },
          {
            rows: clubParticipantsCountWeek3.rows,
            date: [week3, end],
          },
        ]

        result['tables']['totalClubParticipants'] = [
          {
            rows: totalClubParticipantsWeek1.rows,
            date: [week1, week2],
          },
          {
            rows: totalClubParticipantsWeek2.rows,
            date: [week2, week3],
          },
          {
            rows: totalClubParticipantsWeek3.rows,
            date: [week3, end],
          },
        ]

        result['tables']['totalEventParticipants'] = [
          {
            rows: totalEventParticipantsWeek1.rows,
            date: [week1, week2],
          },
          {
            rows: totalEventParticipantsWeek2.rows,
            date: [week2, week3],
          },
          {
            rows: totalEventParticipantsWeek3.rows,
            date: [week3, end],
          },
        ]

        result['tables']['registeredByCountries'] = [
          {
            rows: registeredByCountriesWeek1.rows,
            date: [week1, week2],
          },
          {
            rows: registeredByCountriesWeek2.rows,
            date: [week2, week3],
          },
          {
            rows: registeredByCountriesWeek3.rows,
            date: [week3, end],
          },
        ]

        result['tables']['invites'] = [
          {
            rows: await postgresMainClient.getInvitesGroupedByStates(week1Unix, week2Unix),
            date: [week1, week2],
          },
          {
            rows: await postgresMainClient.getInvitesGroupedByStates(week2Unix, week3Unix),
            date: [week2, week3],
          },
          {
            rows: await postgresMainClient.getInvitesGroupedByStates(week3Unix, endUnix),
            date: [week3, end],
          },
        ]

        result['tables']['topIndividualInviters'] = [
          {
            rows: await postgresMainClient.getTopIndividualInviters(week1Unix, week2Unix),
            date: [week1, week2],
          },
          {
            rows: await postgresMainClient.getTopIndividualInviters(week2Unix, week3Unix),
            date: [week2, week3],
          },
          {
            rows: await postgresMainClient.getTopIndividualInviters(week3Unix, endUnix),
            date: [week3, end],
          },
        ]

        result['tables']['eventsByCountries'] = [
          {
            rows: await postgresMainClient.getEventsByCountries(week1Unix, week2Unix),
            date: [week1, week2],
          },
          {
            rows: await postgresMainClient.getEventsByCountries(week2Unix, week3Unix),
            date: [week2, week3],
          },
          {
            rows: await postgresMainClient.getEventsByCountries(week3Unix, endUnix),
            date: [week3, end],
          },
        ]
        result['tables']['typeOfRooms'] = [
          {
            rows: await postgresMainClient.getTypeOfRooms(week1Unix, week2Unix),
            date: [week1, week2],
          },
          {
            rows: await postgresMainClient.getTypeOfRooms(week2Unix, week3Unix),
            date: [week2, week3],
          },
          {
            rows: await postgresMainClient.getTypeOfRooms(week3Unix, endUnix),
            date: [week3, end],
          },
        ]

        result['tables']['totalNewClubs'] = [
          {
            rows: await postgresMainClient.getTotalNewClubs(week1Unix, week2Unix),
            date: [week1, week2],
          },
          {
            rows: await postgresMainClient.getTotalNewClubs(week2Unix, week3Unix),
            date: [week2, week3],
          },
          {
            rows: await postgresMainClient.getTotalNewClubs(week3Unix, endUnix),
            date: [week3, end],
          },
        ]

        result['tables']['clubEventsCount'] = [
          {
            rows: await postgresMainClient.getClubEventsCount(week1Unix, week2Unix),
            date: [week1, week2],
          },
          {
            rows: await postgresMainClient.getClubEventsCount(week2Unix, week3Unix),
            date: [week2, week3],
          },
          {
            rows: await postgresMainClient.getClubEventsCount(week3Unix, endUnix),
            date: [week3, end],
          },
        ]

        result['tables']['clubOwnersInvitedBy'] = [
          {
            rows: await postgresMainClient.getClubOwnersInvitedBy(week1Unix, week2Unix),
            date: [week1, week2],
          },
          {
            rows: await postgresMainClient.getClubOwnersInvitedBy(week2Unix, week3Unix),
            date: [week2, week3],
          },
          {
            rows: await postgresMainClient.getClubOwnersInvitedBy(week3Unix, endUnix),
            date: [week3, end],
          },
        ]
      }

      const clubs = await getClubs({ limit: 1 })
      return {
        ...result,
        totalClubs: clubs?.data?.response?.totalCount || 0,
        totalClubMembers,
      }
    } catch (err) {
      logger.error(err)
      console.log(err)
    } finally {
      connection.release()
    }
    return result
  }

  async getInvitersReport(start: string, end: string): Promise<InvitersReport> {
    const connection = await this.dbpool.connect()

    const result = {
      date: [start, end],
      tables: {},
    } as InvitersReport

    const startUnix = start ? moment(`${start}.000Z`).unix() : 0
    const endUnix = moment(`${end}.000Z`).unix()

    const week1 = moment(end).subtract(21, 'days').format('YYYY-MM-DD 00:00:00')
    const week2 = moment(end).subtract(14, 'days').format('YYYY-MM-DD 00:00:00')
    const week3 = moment(end).subtract(7, 'days').format('YYYY-MM-DD 00:00:00')

    const week1Unix = moment(`${end}.000Z`).subtract(21, 'days').unix()
    const week2Unix = moment(`${end}.000Z`).subtract(14, 'days').unix()
    const week3Unix = moment(`${end}.000Z`).subtract(7, 'days').unix()

    try {
      if (start) {
        result['tables']['topIndividualInviters'] = [
          {
            rows: await postgresMainClient.getTopIndividualInviters(startUnix, endUnix),
            date: [start, end],
          },
        ]
        result['tables']['topIndividualInvitersClub'] = [
          {
            rows: await postgresMainClient.getTopIndividualInviters(startUnix, endUnix, true),
            date: [start, end],
          },
        ]
      } else {
        result['tables']['topIndividualInviters'] = [
          {
            rows: await postgresMainClient.getTopIndividualInviters(week1Unix, week2Unix),
            date: [week1, week2],
          },
          {
            rows: await postgresMainClient.getTopIndividualInviters(week2Unix, week3Unix),
            date: [week2, week3],
          },
          {
            rows: await postgresMainClient.getTopIndividualInviters(week3Unix, endUnix),
            date: [week3, end],
          },
        ]
        result['tables']['topIndividualInvitersClub'] = [
          {
            rows: await postgresMainClient.getTopIndividualInviters(week1Unix, week2Unix, true),
            date: [week1, week2],
          },
          {
            rows: await postgresMainClient.getTopIndividualInviters(week2Unix, week3Unix, true),
            date: [week2, week3],
          },
          {
            rows: await postgresMainClient.getTopIndividualInviters(week3Unix, endUnix, true),
            date: [week3, end],
          },
        ]
      }

      return {
        ...result,
      }
    } catch (err) {
      logger.error(err)
      console.log(err)
    } finally {
      connection.release()
    }
    return result
  }
}

export const postgresAnalyticsClient = new PostgresAnalyticsClient()
