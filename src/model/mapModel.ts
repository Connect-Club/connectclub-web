import { RefObject } from 'react'

export type MapObjectOnMapType = MapObjectType &
  MapObjectData & {
    id: number | string
    ref: RefObject<any>
    formRef: RefObject<any>
  }

export type MapObjectType = {
  type:
    | 'main_spawn'
    | 'image'
    | 'nft_image'
    | 'share_screen'
    | 'time_box'
    | 'static_object'
    | 'speaker_location'
    | 'image_zone'
    | 'quiet_zone'
  x: number
  y: number
  width: number
  height: number
}

export type MapObjectTypeOrString = MapObjectType['type'] | string

export type SaveMapObject = {
  id?: number
  width: number
  height: number
  title: string
  description: string
  type: MapObjectType['type']
  location: {
    x: number
    y: number
  }
}

export type MapObjectData = {
  radius?: number
  src?: string
  title?: string | null
  description?: string | null
}

export type MapObjectsContainer = {
  objects: {
    [key: string]: MapObjectType
  }
  objectsData: {
    [key: string]: MapObjectData
  }
}

export type MapImageBackground = {
  id: number
  originalName: string
  processedName: string
  width: number
  height: number
  originalUrl: string
  resizerUrl: string
  bucket: string
  uploadAt: number
}

export type UserMapObject = {
  videoBubbleSize: number
  publisherRadarSize: number
}

export type MapImageObjectSizes = {
  width: number
  height: number
}

export type PanelItem = {
  name: string
  key: string
  partial?: boolean
  readonly?: boolean
  type?: 'link' | 'input' | 'textarea'
}

export type DefaultMapObjects = {
  [key in MapObjectType['type']]: {
    name: string
    config: MapObjectType
    panel: PanelItem[]
    description?: string
    limit?: number
  }
}

export type MapImageUploadResponse = {
  id: number
  type: MapObjectType['type']
}
