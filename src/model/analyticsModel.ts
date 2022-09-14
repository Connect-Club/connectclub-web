import { CSSProperties } from 'react'
import { Moment } from 'moment'

import { Params } from '@/model/commonModel'

export type OnlyCount = {
  count: number
}

export type SegmentationType = {
  data: {
    series: Array<number[]>
    seriesCollapsed: Array<ChartQuerySeriesItem[]>
    seriesLabels: Array<Array<number | string>> | string[]
    xValues: string[]
  }
}

export type ChartQueryType = {
  data: {
    series: Array<ChartQuerySeriesItem[]>
    seriesCollapsed: Array<ChartQuerySeriesItem[]>
    seriesMeta: Array<{
      eventGroupBy: string
      eventGroupBys: string[]
      eventIndex: number
      segmentIndex: number
    }>
    xValues: string[]
  }
}

export type ChartQuerySeriesItem = { setId: string; value: number }

export type AmplitudeApiEventType = {
  event_type: string
  filters?: Array<{
    subprop_type: 'user' | 'event'
    subprop_key: string
    subprop_op:
      | 'is'
      | 'is not'
      | 'contains'
      | 'does not contain'
      | 'less'
      | 'less or equal'
      | 'greater'
      | 'greater or equal'
      | 'set is'
      | 'set is not'
    subprop_value: string[]
  }>
  group_by?: Array<{
    type: 'user' | 'event'
    value: string
  }>
}

export type AmplitudeApiEventParams = {
  m: 'uniques' | 'totals' | 'pct_dau' | 'average'
  start: string // Format YYYYMMDD
  end: string // Format YYYYMMDD
  i: -300000 | -3600000 | 1 | 7 | 30 // for real-time, hourly, daily, weekly, and monthly counts
  g?: string
  s?: any
}

type PageviewType = {
  desktop: number
  mobile: number
  total: number
  platform: {
    [key: string]: number
  }
}

type InstallType = OnlyTotal & {
  platform: PageviewType['platform']
  qr?: number
}

type OnlyTotal = {
  total: number
  qr?: number
}

export type ReportDataType = {
  date: [string, string]
  result: {
    [key: string]: ReportDataRowType['data']
  }
  qrScansErrors: string[]
}

export type AppsflyerQRClicksType = { [key: string]: number }

export type AppsflyerQR = {
  qrScans: AppsflyerQRClicksType
  qrScansErrors: string[]
}

export type ReportDataRowType = {
  utm: string
  data: {
    pageview?: PageviewType
    open_app?: PageviewType
    install?: InstallType
    open?: InstallType
    registered?: OnlyTotal
    participated_in_event?: OnlyTotal
  }
  ignore?: string[]
  className?: string
  style?: CSSProperties
}

export type EventLandingSegmentTypeResult = {
  utm: string
  is_desktop: string
  platform: string
}

export type EventAppSegmentTypeResult = {
  utm: string
  link: string
  platform: string
}

export type UserRegisteredTypeResult = {
  count: string
  utm: string
}

export type WeeklyReportData = {
  rows: Array<{ count: string | number; qrScans?: number }>
  date: [string, string]
}

export type WeeklyReportType = {
  funnel: Array<WeeklyReportData>
  common: Array<WeeklyReportData>
}

export type WeeklyReportResult = WeeklyReportType & {
  qrScansErrors: string[]
}

export type PushNotificationsType = {
  type: string
  specific_key: string
  status: 'send' | 'opened' | 'error' | 'processed'
  message: string
  count: number
}

export type PushNotificationsReportType = {
  rows: PushNotificationsType[]
  date: [string, string]
}

export type SharingReportEventType = {
  d: string
  shown: string
  shown_unique: string
  copy_link: string
  copy_link_unique: string
  share_click: string
  share_click_unique: string
  deeplink_open: string
  deeplink_open_unique: string
  pageview: string
  pageview_unique: string
  registered: string
  verified: string
}

export type SharingReportClubType = {
  d: string
  shown: string
  shown_unique: string
  share_click: string
  share_click_unique: string
  deeplink_open: string
  deeplink_open_unique: string
  pageview: string
  pageview_unique: string
  registered: string
  verified: string
}

export type SharingReportRoomType = {
  d: string
  shown: string
  shown_unique: string
  click_link: string
  click_link_unique: string
  share_click: string
  share_click_unique: string
  deeplink_open: string
  deeplink_open_unique: string
  deeplink_install: string
  deeplink_install_unique: string
  registered: string
  verified: string
}

export type SharingReportType = {
  interval: 'day' | 'week' | 'month' | ''
  date: [string, string]
  share_event: SharingReportEventType[]
  share_club: SharingReportClubType[]
  share_room: SharingReportRoomType[]
}

export type SharingReportKeys = 'share_event' | 'share_room' | 'share_club'

export type RetentionReportValues = {
  date: [Moment, Moment]
  base: string
  target: string[]
  time_bucket: string
  buckets_count: number
}

export type RetentionReportType = {
  date: [string, string]
  time_bucket: string
  rows: Array<{
    bucket_number: number
    bucket_users: number
    cohort_time_bucket: string
    percentage: number
    total_users: number
    amplitude_ids: string[]
  }>
}

export type InvitesGroupedByStates = {
  club_invites: number
  personal_invites: number
  state: string
}

export type TopIndividualInviters = {
  username: string
  count_invites: number
}

export type EventsByCountries = {
  name: string
  is_private: boolean
  count_events: number
}

export type TypeOfRooms = {
  total: number
  private: number
  public: number
}

export type RegisteredByCountries = {
  country: string
  count_users: number
}

export type TotalEventParticipants = OnlyCount

export type TotalClubParticipants = OnlyCount

export type ClubParticipantsCount = {
  clubslug: string
  new_participants: number
}

export type UserStates = {
  user_state: string
  count: number
  additional: Params
}

export type TotalClubMembers = {
  title: string
  count: number
}

export type ClubEventsCount = {
  slug: string
  title: string
  count: number
}

export type ClubOwnersInvitedBy = {
  invited_by_user: string
  invited_by_club: string | null
  club_owner_username: string
  owner_club_slug: string
}

export type ConsolidateReportData<T> = Array<{
  date: [string, string]
  rows: T[]
}>

export type ConsolidateReport = {
  date: [string, string]
  tables: {
    userStates?: ConsolidateReportData<UserStates>
    clubParticipantsCount?: ConsolidateReportData<ClubParticipantsCount>
    totalClubParticipants?: ConsolidateReportData<TotalClubParticipants>
    totalEventParticipants?: ConsolidateReportData<TotalEventParticipants>
    registeredByCountries?: ConsolidateReportData<RegisteredByCountries>
    invites?: ConsolidateReportData<InvitesGroupedByStates>
    topIndividualInviters?: ConsolidateReportData<TopIndividualInviters>
    eventsByCountries?: ConsolidateReportData<EventsByCountries>
    typeOfRooms?: ConsolidateReportData<TypeOfRooms>
    totalNewClubs?: ConsolidateReportData<OnlyCount>
    clubEventsCount?: ConsolidateReportData<ClubEventsCount>
    clubOwnersInvitedBy?: ConsolidateReportData<ClubOwnersInvitedBy>
  }
  totalClubs?: number
  totalClubMembers?: TotalClubMembers[]
}

export type InvitersReport = {
  date: [string, string]
  tables: {
    topIndividualInviters: ConsolidateReportData<TopIndividualInviters>
    topIndividualInvitersClub: ConsolidateReportData<TopIndividualInviters>
  }
}
