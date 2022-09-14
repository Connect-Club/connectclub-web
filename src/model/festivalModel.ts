export type FestivalSceneType = {
  id: string
  sceneCode: string
}

export type FestivalLayoutProps = {
  showEventsInHeader?: boolean
  hideTimeline?: boolean
  linkInHeader?: {
    name?: string
    backlink?: string
  }
  hideHeader?: boolean
  footerLogoColor?: string
}

export type FestivalEventsParamsFilter = {
  limit?: number // Default 20
  lastValue?: string // Default 0
  festivalCode?: string
  festivalSceneId?: string
  speakerId?: string
  timezone?: string
  dateStart?: string // 2021-08-27
  dateEnd?: string // 2021-08-28
  orderBy?: string //  Default id:DESC
}
