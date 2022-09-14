import React from 'react'
import { UploadFile } from 'antd/lib/upload/interface'

import { getBackground } from '@/api/backgroundApi'
import { getRoom } from '@/api/roomApi'
import popup from '@/components/admin/InfoPopup'
import { doRequest } from '@/lib/Api'
import {
  DefaultMapObjects,
  MapObjectOnMapType,
  MapObjectsContainer,
  MapObjectType,
  MapObjectTypeOrString,
  SaveMapObject,
  UserMapObject,
} from '@/model/mapModel'
import { Room } from '@/model/roomModel'

const isNaNDefault = (a: unknown, defaultValue: number): number => {
  const value = Number(a)
  return !isNaN(value) ? value : defaultValue
}

const getObjectsToSave = (
  objects: MapObjectOnMapType[],
  objectsToSave: MapObjectTypeOrString[] = [],
): SaveMapObject[] => {
  return objects
    .map((obj) => {
      const isSave =
        !objectsToSave.length || (objectsToSave.includes(obj.type) && !objectsToSave.includes(`!${obj.id}`))
      if (isSave) {
        const data = obj.formRef.current.getFieldsValue()

        const width = round(isNaNDefault(data.width, obj.width))
        const height = round(isNaNDefault(data.height, obj.height))
        const x = round(isNaNDefault(data.x, round(obj.x)))
        const y = round(isNaNDefault(data.y, round(obj.y)))
        const title = data.title !== null ? data.title : ''
        const description = data.description !== null ? data.description : ''

        const saveData: SaveMapObject = {
          width,
          height,
          title,
          description,
          type: obj.type,
          location: { x, y },
        }
        if (!obj.id.toString().includes('new')) {
          saveData['id'] = Number(obj.id)
        }
        return saveData
      }
    })
    .filter((r) => r) as SaveMapObject[]
}

export const round = (value: string | number): number => {
  return Math.round(typeof value === 'string' ? Number(value.replace(',', '.')) : value)
}

export const getRoomObjectsByRoomName = async (roomName: string | number): Promise<Room['config'] | false> => {
  const response = await getRoom(roomName.toString())
  if (!response._cc_errors.length && response.data) {
    return response.data.response['config']
  }
  return false
}

export const getBackgroundObjectsById = async (backgroundId: string | number): Promise<MapObjectsContainer | false> => {
  const response = await getBackground(Number(backgroundId))
  if (response) {
    return {
      objects: response.objects,
      objectsData: response.objectsData,
    }
  }
  return false
}

type AddImageToObjectsType = (
  id: string | number,
  userObject: UserMapObject | null,
  location:
    | {
        x: number
        y: number
      }
    | number,
  sizes?: {
    width: number
    height: number
  } | null,
  params?: {
    title?: string
    description?: string
    type?: MapObjectType['type']
  },
) => SaveMapObject

export const addImageToObjects: AddImageToObjectsType = (id, userObject, location = 1, sizes = null, params = {}) => {
  if (Number(id) > 0) {
    const width = sizes !== null ? sizes.width : userObject ? userObject.publisherRadarSize / 2 : 200
    const height = sizes !== null ? sizes.height : userObject ? userObject.publisherRadarSize / 2 : 200
    return {
      id: Number(id),
      width: Number(width.toFixed()),
      height: Number(height.toFixed()),
      type: params?.type || 'image',
      title: params?.title || '',
      description: params?.description || '',
      location:
        typeof location === 'object'
          ? location
          : {
              x: round(location * 50 + (userObject ? userObject.publisherRadarSize / 2 : 0) + 100),
              y: round(location * 50 + (userObject ? userObject.publisherRadarSize / 4 : 0) + 100),
            },
    }
  }
  return {} as SaveMapObject
}

type SaveMapObjectsType = (
  url: string,
  objects: MapObjectOnMapType[],
  objectToSave?: MapObjectTypeOrString[],
  extraObjects?: SaveMapObject[],
) => Promise<string[]>

export const saveMapObjects: SaveMapObjectsType = async (url, objects, objectToSave = [], extraObjects = []) => {
  let objectsToSave = getObjectsToSave(objects, objectToSave)
  if (extraObjects.length) {
    objectsToSave = objectsToSave.concat(extraObjects)
  }

  const objectIds: number[] = []
  const uniqueObjects = objectsToSave.filter((obj) => {
    return !obj.id || (!objectIds.includes(obj.id) && objectIds.push(obj.id))
  })

  const response = await doRequest<SaveMapObject>({
    method: 'PATCH',
    endpoint: url,
    body: JSON.stringify(uniqueObjects),
  })

  const getErrorText = (errorCode: string): string => {
    switch (errorCode) {
      case 'v1.access_denied':
        return "You don't have enough rights to edit this room. Please, contact us."
      default:
        return errorCode
    }
  }

  if (response._cc_errors.length) {
    return response._cc_errors.map((error) => getErrorText(typeof error !== 'string' ? error.text : error))
  }
  return []
}

export const syncObjectAndFormValues = (objects: MapObjectOnMapType[]): MapObjectOnMapType[] => {
  return objects.map((obj) => {
    if (obj.formRef.current) {
      const data = obj.formRef.current.getFieldsValue()
      return Object.assign({}, obj, {
        width: data.width ?? obj.width,
        height: data.height ?? obj.height,
        x: data.x ?? obj.x,
        y: data.y ?? obj.y,
        title: data.title ?? obj.title,
        description: data.description ?? obj.description,
      })
    } else {
      return obj
    }
  })
}

export const getMapObjects = (
  objectsContainer: MapObjectsContainer,
  backgroundObjects?: MapObjectsContainer['objects'],
): MapObjectOnMapType[] => {
  let mapObjects: MapObjectOnMapType[] = []
  const defaultMapObjects = getDefaultMapObjects()
  const objectsCount = {} as { [key in MapObjectType['type']]: number }
  const remove = {} as { [key in MapObjectType['type']]: number }
  Object.keys(objectsContainer.objects).forEach((id) => {
    const obj = Object.assign(
      {},
      objectsContainer.objects[id],
      objectsContainer.objectsData?.[id],
    ) as MapObjectOnMapType
    obj.id = parseInt(id)
    obj.ref = React.createRef()
    obj.formRef = React.createRef()

    mapObjects.push(obj)

    objectsCount[obj.type] = objectsCount?.[obj.type] ? objectsCount[obj.type] + 1 : 1
    if (
      defaultMapObjects[obj.type].limit !== undefined &&
      defaultMapObjects[obj.type].limit! < objectsCount[obj.type]
    ) {
      remove[obj.type] = remove?.[obj.type] ? remove[obj.type] + 1 : 1
    }
  })

  /* Remove background objects, if object of this type already exists. Remove only objects, which should not duplicates */
  if (Object.keys(remove).length > 0) {
    mapObjects = mapObjects.filter((obj) => {
      if ((backgroundObjects?.[obj.id] || backgroundObjects === undefined) && remove[obj.type]) {
        remove[obj.type]--
        return false
      }
      return true
    })
  }
  return mapObjects
}

export const getUniqueId = (objects: MapObjectOnMapType[]): string => {
  let index = 0
  let newId
  const objectIds: (string | number)[] = objects.map((obj) => obj.id)
  do {
    newId = 'new-' + ++index
  } while (objectIds.includes(newId))

  return newId
}

export const validateFile = (file: UploadFile, extensions: string[] = []): boolean => {
  /* Allow only PNG files */
  if (!file.type || (extensions.length && !extensions.includes(file.type))) {
    popup.error(`${file.name} is not a png file`)
    return false
  }
  return true
}

export const getDefaultMapObjects = (): DefaultMapObjects => ({
  speaker_location: {
    name: 'Speaker zone',
    description: 'In this zone everybody will hear you, when you speak',
    config: {
      type: 'speaker_location',
      x: 100,
      y: 100,
      width: 480,
      height: 480,
    },
    panel: [
      { name: 'x', key: 'x' },
      { name: 'y', key: 'y' },
      { name: 'width', key: 'width' },
      {
        name: 'height',
        key: 'height',
      },
    ],
  },
  main_spawn: {
    name: 'Room entrance',
    description: 'This is the place, where speakers will appear at the room',
    config: { type: 'main_spawn', x: 150, y: 150, width: 500, height: 500 },
    panel: [
      { name: 'x', key: 'x' },
      { name: 'y', key: 'y' },
      { name: 'width', key: 'width' },
      {
        name: 'height',
        key: 'height',
      },
    ],
    limit: 1,
  },
  image: {
    name: 'Image',
    config: { type: 'image', x: 150, y: 150, width: 500, height: 500 },
    panel: [
      { name: 'Url', key: 'src', readonly: true, type: 'link' },
      { name: 'x', key: 'x' },
      { name: 'y', key: 'y' },
      { name: 'width', key: 'width' },
      {
        name: 'height',
        key: 'height',
      },
      { name: 'Title', key: 'title', partial: true, type: 'input' },
      {
        name: 'Description',
        partial: true,
        key: 'description',
        type: 'textarea',
      },
    ],
  },
  nft_image: {
    name: 'NFT Image',
    config: { type: 'nft_image', x: 150, y: 150, width: 500, height: 500 },
    panel: [
      { name: 'Url', key: 'src', readonly: true, type: 'link' },
      { name: 'x', key: 'x' },
      { name: 'y', key: 'y' },
      { name: 'width', key: 'width' },
      {
        name: 'height',
        key: 'height',
      },
      { name: 'Title', key: 'title', partial: true, type: 'input' },
      {
        name: 'Description',
        partial: true,
        key: 'description',
        type: 'textarea',
      },
    ],
  },
  share_screen: {
    name: 'Share screen',
    description: 'This area will allow you to share your screen on PC with others',
    config: { type: 'share_screen', x: 250, y: 250, width: 1907, height: 1072 },
    panel: [
      { name: 'x', key: 'x' },
      { name: 'y', key: 'y' },
    ],
    limit: 1,
  },
  time_box: {
    name: 'Timer',
    config: { type: 'time_box', x: 350, y: 350, width: 400, height: 500 },
    panel: [
      { name: 'x', key: 'x' },
      { name: 'y', key: 'y' },
      { name: 'width', key: 'width' },
      {
        name: 'height',
        key: 'height',
      },
    ],
    limit: 1,
  },
  static_object: {
    name: 'Restricted area',
    description: 'Participants of the room will not be allowed to jump into this area',
    panel: [
      { name: 'x', key: 'x' },
      { name: 'y', key: 'y' },
      { name: 'width', key: 'width' },
      {
        name: 'height',
        key: 'height',
      },
    ],
    config: { type: 'static_object', x: 200, y: 200, width: 500, height: 500 },
  },
  image_zone: {
    name: 'Image autofit',
    description:
      'Set the dimensions of this zone and try to drag-n-drop your image inside. It will autofit automatically',
    config: { type: 'image_zone', x: 300, y: 300, width: 400, height: 500 },
    panel: [
      { name: 'x', key: 'x' },
      { name: 'y', key: 'y' },
      { name: 'width', key: 'width' },
      {
        name: 'height',
        key: 'height',
      },
    ],
  },
  quiet_zone: {
    name: 'Quiet zone',
    description: 'In this zone no one will hear the speakers, but you still can communicate with people near to you',
    config: { type: 'quiet_zone', x: 400, y: 400, width: 500, height: 500 },
    panel: [
      { name: 'x', key: 'x' },
      { name: 'y', key: 'y' },
      { name: 'width', key: 'width' },
      {
        name: 'height',
        key: 'height',
      },
    ],
    limit: 1,
  },
})
