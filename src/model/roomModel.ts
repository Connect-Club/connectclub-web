import { Params } from '@/model/commonModel'
import { EventDraft, FullEventInfo } from '@/model/eventModel'
import { MapImageBackground, MapObjectData, MapObjectsContainer, MapObjectType, UserMapObject } from '@/model/mapModel'

type RoomObjectsContainer = MapObjectsContainer & {
  backgroundObjects: {
    [key: string]: MapObjectType
  }
  backgroundObjectsData: {
    [key: string]: MapObjectData
  }
}

export type Room = {
  id: number
  about: string
  name: string
  createdAt: number
  config: RoomObjectsContainer &
    UserMapObject & {
      id: number
      backgroundRoom: MapImageBackground
      backgroundRoomWidthMultiplier: number
      backgroundRoomHeightMultiplier: number
      initialRoomScale: number
      minRoomZoom: number
      maxRoomZoom: number
      intervalToSendDataTrackInMilliseconds: number
      videoQuality: {
        width: number
        height: number
      }
      speakerLocation: {
        x: number
        y: number
      }
      dataTrackUrl: string
      imageMemoryMultiplier: number
      withSpeakers: boolean
    }
  description: string
  custom: Params
  archetype: {
    code: string
    custom: Params
  }
  ownerId: number
  adminsIds: number[]
  isDone: boolean
  draftType: EventDraft['type']
}

export type WebRoomParams = {
  eventId: string
  isEvent: boolean
  enabled: boolean
  expired: boolean
  withToken: boolean
  tokenUrl: string
  roomId?: FullEventInfo['roomId']
  pswd?: FullEventInfo['roomPass']
}

export type Rooms = {
  items: Room[]
  lastValue: number | null
  totalCount: number
}

export type RoomsSearchReturn = {
  key: string
  label: string
  value: string
}
