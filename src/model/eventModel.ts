import { Background } from '@/model/backgroundModel'
import { Club } from '@/model/clubModel'
import { FilterParams } from '@/model/commonModel'
import { FestivalSceneType } from '@/model/festivalModel'
import { SingleInterestType } from '@/model/interestModel'
import { ShortUserInfo } from '@/model/usersModel'

export type EventParticipant = Omit<ShortUserInfo, 'description'> & {
  isOwner: boolean // Own event or not
}

export type EventType = {
  id: string
  title: string
  description: string
  date: number
  dateEnd: number
  participants: Array<EventParticipant>
  interests: Array<SingleInterestType>
  language: {
    id: number
    name: string
  }
  forMembersOnly: boolean
  club?: {
    id: Club['id']
    slug: Club['slug']
    title: Club['title']
    createdAt: Club['createdAt']
  }
}

export type FullEventInfo = EventType & {
  isOwnerToken: boolean
  tokenReason: null
  tokens: []
  tokenLandingUrlInformation: null
  isAlreadySubscribedToAllParticipants: boolean
  isSubscribed: boolean
  isOwned: boolean
  state: 'check_later' | 'create_later' | 'create_room' | 'join' | 'expired'
  roomId: null | string
  roomPass: null | string
  festivalScene: null
  festivalCode: null
  withToken: boolean
  isPrivate: boolean
  needApprove: boolean
}

export type EventsType = {
  items: EventType[]
  lastValue: number | null
}

export type FilterParamsEvents = FilterParams & { clubId?: string }

export type SubscriptionEvent = EventType & {
  listenerCount: number
}

export type FestivalEvent = EventType & {
  festivalCode: string
  festivalScene: FestivalSceneType
}

export type EventDraft = {
  backgroundId: Background['background']['id']
  backgroundSrc: string
  id: string
  requiredBackgroundHeight: number
  requiredBackgroundWidth: number
  type: 'gallery' | 's_broadcasting' | 'l_broadcasting' | 'multiroom' | 's_networking' | 'l_networking'
}
