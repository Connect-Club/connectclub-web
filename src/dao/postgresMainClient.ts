import moment from 'moment'
import { Pool } from 'pg'

import logger from '@/lib/Logger'
import {
  ClubEventsCount,
  ClubOwnersInvitedBy,
  EventsByCountries,
  InvitesGroupedByStates,
  OnlyCount,
  PushNotificationsReportType,
  PushNotificationsType,
  TopIndividualInviters,
  TotalClubMembers,
  TypeOfRooms,
} from '@/model/analyticsModel'
import { parcel_groups } from '@/components/Land/components/parcel_groups'

class PostgresMainClient {
  protected dbpool

  constructor() {
    this.dbpool = new Pool({
      host: process.env.POSTGRES_MAIN_HOST,
      user: process.env.POSTGRES_MAIN_USER,
      password: process.env.POSTGRES_MAIN_PASS,
      database: process.env.POSTGRES_MAIN_DB,
      min: 1,
      max: 10,
      idleTimeoutMillis: 30000,
    })
  }

  async getLast100(): Promise<Record<string, any>> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT *
                FROM users
                LIMIT 100
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getInvitesGroupedByStates(start: number, end: number): Promise<InvitesGroupedByStates[]> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT CASE u.state WHEN 'verified' THEN 2 ELSE 3 END, 
                        (COUNT(*) FILTER (WHERE club_id IS NULL))::integer as personal_invites,
                       (COUNT(*) FILTER (WHERE club_id IS NOT NULL))::integer as club_invites,
                       u.state
                FROM invite i
                JOIN users u ON i.registered_user_id = u.id
                JOIN users a ON i.author_id = a.id
                WHERE u.is_tester = false AND a.is_tester = false AND u.deleted_at IS NULL
                AND u.created_at > ${start} AND u.created_at < ${end}
                GROUP BY u.state
                
                UNION ALL
                
                SELECT 1, (COUNT(*) FILTER (WHERE club_id IS NULL))::integer as personal_invites,
                       (COUNT(*) FILTER (WHERE club_id IS NOT NULL))::integer as club_invites,
                       'total_invites'
                FROM invite i
                JOIN users u ON i.author_id = u.id
                WHERE u.is_tester = false AND i.created_at > ${start} AND i.created_at < ${end}
                
                ORDER BY 1
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getTopIndividualInviters(start: number, end: number, isClubInvite = false): Promise<TopIndividualInviters[]> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                WITH author_ids as (
                    SELECT i.author_id, u.id as user_id
                    FROM invite i
                    JOIN users u ON u.id = i.registered_user_id
                    WHERE u.created_at > ${start} AND u.created_at < ${end}
                    AND i.club_id ${isClubInvite ? 'IS NOT NULL' : 'IS NULL'}
                    AND u.state = 'verified' AND u.is_tester = false AND u.deleted_at IS NULL
                    GROUP BY 1, 2
                )
                
                SELECT u.username, COUNT(ai.user_id)::integer as count_invites
                FROM author_ids ai
                JOIN users u ON (u.id = ai.author_id OR u.id = ai.user_id)
                GROUP BY ai.author_id, u.username
                ORDER BY count_invites DESC
                LIMIT 30
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getEventsByCountries(start: number, end: number): Promise<EventsByCountries[]> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT 
                    CASE WHEN cou.name IS NULL THEN '<Unknown>' ELSE cou.name END,
                    vr.is_private,
                    COUNT(DISTINCT vr.id)::integer as count_events
                FROM video_room vr
                JOIN community c on vr.id = c.video_room_id
                JOIN users u on u.id = c.owner_id
                LEFT JOIN country cou on cou.id = u.country_id
                WHERE vr.started_at > ${start} AND vr.started_at < ${end}
                    AND (vr.done_at IS NULL OR (vr.done_at - vr.started_at) > 60)
                GROUP BY cou.name, vr.is_private
                ORDER BY vr.is_private, count_events DESC
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getTypeOfRooms(start: number, end: number): Promise<TypeOfRooms[]> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT
                    COUNT(DISTINCT vr.id)::integer as total,
                    (COUNT(DISTINCT vr.id) FILTER ( WHERE vr.is_private = true))::integer as private,
                    (COUNT(DISTINCT vr.id) FILTER ( WHERE vr.is_private = false))::integer as public
                FROM video_room vr
                WHERE vr.started_at > ${start} AND vr.started_at < ${end}
                    AND (vr.done_at IS NULL OR (vr.done_at - vr.started_at) > 60)
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getTotalNewClubs(start: number, end: number): Promise<OnlyCount[]> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT COUNT(*)::integer as count
                FROM club
                WHERE created_at > ${start} AND created_at < ${end}
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getTotalClubMembers(): Promise<TotalClubMembers[]> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT c.title, COUNT(DISTINCT cp.id)::integer as count
                FROM club_participant cp
                JOIN users u on u.id = cp.user_id
                JOIN club c on c.id = cp.club_id
                AND u.state = 'verified'
                AND u.deleted_at IS NULL
                GROUP BY c.title
                ORDER BY count DESC
                LIMIT 50
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getClubEventsCount(start: number, end: number): Promise<ClubEventsCount[]> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT cl.slug, cl.title, COUNT(vr.*)::integer as count
                FROM video_room vr
                JOIN event_schedule es on vr.event_schedule_id = es.id
                JOIN club cl on es.club_id = cl.id
                WHERE vr.started_at > ${start} AND vr.started_at < ${end}
                AND (vr.done_at IS NULL OR (vr.done_at - vr.started_at) > 60)
                GROUP BY cl.id
                ORDER BY count DESC
                LIMIT 30
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getClubOwnersInvitedBy(start: number, end: number): Promise<ClubOwnersInvitedBy[]> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT
                    a.username as invited_by_user,
                    cl_i.slug as invited_by_club,
                    u.username as club_owner_username,
                    cl.slug as owner_club_slug
                FROM club cl
                JOIN users u on cl.owner_id = u.id
                JOIN invite i on i.registered_user_id = cl.owner_id
                JOIN users a on i.author_id = a.id
                LEFT JOIN club cl_i on cl_i.id = i.club_id
                WHERE u.state = 'verified' AND u.is_tester = false AND u.deleted_at IS NULL
                    AND cl.created_at > ${start} AND cl.created_at < ${end}
                GROUP BY a.username, u.username, cl.slug, cl_i.slug
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getPushNotificationsReport(start: number, end: number): Promise<PushNotificationsReportType[]> {
    const connection = await this.dbpool.connect()

    const getNotificationsSql = async (start: number, end: number) => {
      return `
                SELECT
                    type, specific_key, status, max(message) as message, COUNT(1)::integer
                FROM notification
                WHERE created_at > ${start} AND created_at < ${end}
                GROUP BY type, specific_key, status
                ORDER BY type
            `
    }

    try {
      if (!start) {
        const week1 = moment(end).subtract(21, 'days').valueOf()
        const week2 = moment(end).subtract(14, 'days').valueOf()
        const week3 = moment(end).subtract(7, 'days').valueOf()

        const week1Date = moment(week1).format('DD.MM.YYYY')
        const week2Date = moment(week2).format('DD.MM.YYYY')
        const week3Date = moment(week3).format('DD.MM.YYYY')

        const notificationsWeek1 = await connection.query<PushNotificationsType>(
          await getNotificationsSql(week1, week2),
        )
        const notificationsWeek2 = await connection.query<PushNotificationsType>(
          await getNotificationsSql(week2, week3),
        )
        const notificationsWeek3 = await connection.query<PushNotificationsType>(await getNotificationsSql(week3, end))

        return [
          {
            rows: notificationsWeek1.rows,
            date: [week1Date, week2Date],
          },
          {
            rows: notificationsWeek2.rows,
            date: [week2Date, week3Date],
          },
          {
            rows: notificationsWeek3.rows,
            date: [week3Date, moment(end).format('DD.MM.YYYY')],
          },
        ]
      } else {
        const notifications = await connection.query<PushNotificationsType>(await getNotificationsSql(start, end))
        return [
          {
            rows: notifications.rows,
            date: [moment(start).format('DD.MM.YYYY'), moment(end).format('DD.MM.YYYY')],
          },
        ]
      }
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async getParcels(): Promise<any> {
    const connection = await this.dbpool.connect()
    try {
      const res = await connection.query(`
                SELECT * FROM land
            `)
      return res.rows
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return []
  }

  async insertLandParcels(): Promise<boolean> {
    const connection = await this.dbpool.connect()
    try {
      const buildQuery = () => {
        const sql: string[] = []
        const userId = 2270
        let time = 1655367000
        let parcelNumber = 0
        parcel_groups.forEach((sector) => {
          sector.parcels.forEach((parcel) => {
            time += 300
            parcelNumber += 1
            sql.push(
              `(uuid_in(md5(random()::text || random()::text)::cstring), ${userId}, ${parcel.x}, ${parcel.y}, ${sector.sector}, ${parcel.available}, ${time}, '', '', ${parcelNumber})`,
            )
          })
        })
        return sql
      }
      const sqlArr = buildQuery()
      await connection.query(`
                INSERT INTO land (id, created_by_id, x, y, sector, available, created_at, name, description, number)
                VALUES ${sqlArr.join(',')}
            `)
      return true
    } catch (err) {
      logger.error(err)
    } finally {
      connection.release()
    }
    return false
  }
}

export const postgresMainClient = new PostgresMainClient()
