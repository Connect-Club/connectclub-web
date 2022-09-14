import { MapImageObjectSizes, MapObjectOnMapType } from '@/model/mapModel'

type ConvertSizesType = (
  w: number,
  h: number,
  obj: MapObjectOnMapType,
  realImageSize: MapImageObjectSizes,
  displayedImageSize: MapImageObjectSizes,
  type?: 'toReal' | 'toMap',
) => { width: number; height: number }

type ConvertCoordinatesType = (
  x: number,
  y: number,
  obj: MapObjectOnMapType,
  realImageSize: MapImageObjectSizes,
  displayedImageSize: MapImageObjectSizes,
  type?: 'toReal' | 'toMap',
) => { x: number; y: number }

type ConvertCoordinatesRoundObjectType = (
  x: number,
  y: number,
  diameter: number,
  realImageSize: MapImageObjectSizes,
  displayedImageSize: MapImageObjectSizes,
) => { x: number; y: number }

const _convertSizes: ConvertSizesType = (w, h, obj, divisible, divisor, type) => {
  let width: number, height: number

  const initialW = (width = (w * divisible.width) / divisor.width)
  const initialH = (height = (h * divisible.height) / divisor.height)

  if (width > divisible.width) {
    width = divisible.width
  }

  if (height > divisible.height) {
    height = divisible.height
  }

  const result = { width: Math.round(width), height: Math.round(height) }

  if ((initialW !== width || initialH !== height) && obj.ref?.current) {
    obj.ref.current.updateSize(
      type === 'toReal' ? convertRealSizesToMap(result.width, result.height, obj, divisible, divisor) : result,
    )
  }

  return result
}

const _convertCoordinates: ConvertCoordinatesType = (x, y, obj, divisible, divisor, type) => {
  let posX, posY, objW, objH
  const objMapW = (objW = Number(obj.ref?.current?.resizableElement?.current?.offsetWidth) || 0)
  const objMapH = (objH = Number(obj.ref?.current?.resizableElement?.current?.offsetHeight) || 0)

  if (type === 'toReal') {
    const realSizes = convertSizesToReal(objMapW, objMapH, obj, divisible, divisor)
    objW = realSizes['width']
    objH = realSizes['height']
  }

  const indentW = objW * 0.1
  const indentH = objH * 0.1

  const initialPosX = (posX = (x * divisible.width) / divisor.width)
  const initialPosY = (posY = (y * divisible.height) / divisor.height)

  if (initialPosX >= divisible.width) {
    posX = divisible.width - indentW
  } else if (posX + objW <= 0) {
    posX = -1 * objW + indentW
  }

  if (initialPosY >= divisible.height) {
    posY = divisible.height - indentH
  } else if (posY + objH <= 0) {
    posY = -1 * objH + indentH
  }

  const result = { x: Math.round(posX), y: Math.round(posY) }

  if ((initialPosX !== posX || initialPosY !== posY) && obj.ref?.current) {
    obj.ref.current.updatePosition(
      type === 'toReal' ? convertRealCoordinatesToMap(result.x, result.y, obj, divisible, divisor) : result,
    )
  }

  return result
}

export const convertSizesToReal: ConvertSizesType = (w, h, obj, realImageSize, displayedImageSize) => {
  return _convertSizes(w, h, obj, realImageSize, displayedImageSize, 'toReal')
}

export const convertRealSizesToMap: ConvertSizesType = (w, h, obj, realImageSize, displayedImageSize) => {
  return _convertSizes(w, h, obj, displayedImageSize, realImageSize, 'toMap')
}

export const convertCoordinatesToReal: ConvertCoordinatesType = (x, y, obj, realImageSize, displayedImageSize) => {
  return _convertCoordinates(x, y, obj, realImageSize, displayedImageSize, 'toReal')
}
export const convertRealCoordinatesToMap: ConvertCoordinatesType = (x, y, obj, realImageSize, displayedImageSize) => {
  return _convertCoordinates(x, y, obj, displayedImageSize, realImageSize, 'toMap')
}

export const convertRoundObjectPositionToMap: ConvertCoordinatesRoundObjectType = (
  x,
  y,
  diameter,
  realImageSize,
  displayedImageSize,
) => {
  const scaledDiameter = (diameter * displayedImageSize.width) / realImageSize.width

  const posX = (-1 * scaledDiameter) / 2 + x
  const posY = (-1 * scaledDiameter) / 2 + y

  return { x: posX, y: posY }
}
