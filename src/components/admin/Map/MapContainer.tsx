import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DndProvider, DropTargetMonitor, useDrop } from 'react-dnd'
import { HTML5Backend, NativeTypes } from 'react-dnd-html5-backend'
import { DraggableEventHandler } from 'react-draggable'
import { DraggableData, Rnd, RndDragEvent, RndResizeCallback } from 'react-rnd'
import {
  ReactZoomPanPinchHandlers,
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from 'react-zoom-pan-pinch'
import { FileImageOutlined, InboxOutlined, QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Select, Tooltip, Upload } from 'antd'
import { UploadChangeParam } from 'antd/lib/upload'
import clsx from 'clsx'
import debounce from 'lodash.debounce'
import PropTypes from 'prop-types'

import { useUserNftTokens } from '@/api/userApi'
import global_styles from '@/components/admin/css/admin.module.css'
import popup from '@/components/admin/InfoPopup'
import ControlPanel from '@/components/admin/Map/ControlPanel'
import {
  addImageToObjects,
  getDefaultMapObjects,
  getMapObjects,
  getUniqueId,
  saveMapObjects,
  syncObjectAndFormValues,
} from '@/components/admin/Map/helper'
import {
  convertCoordinatesToReal,
  convertRealCoordinatesToMap,
  convertRealSizesToMap,
  convertRoundObjectPositionToMap,
  convertSizesToReal,
} from '@/components/admin/Map/map.converter'
import styles from '@/components/admin/Map/map.module.css'
import MapObject from '@/components/admin/Map/MapObject'
import SuccessErrorMessages, { Dispatchers } from '@/components/admin/Map/SuccessErrorMessages'
import AddNftModal from '@/components/admin/pages/rooms/AddNftModal'
import MakeGallery from '@/components/admin/pages/rooms/MakeGallery'
import UploadRoomBackground from '@/components/admin/pages/rooms/UploadRoomBackground'
import { apiUploadFile } from '@/lib/Api'
import { getUrlWithSizes } from '@/lib/helpers'
import { isMobileDevice } from '@/lib/utils'
import { FC } from '@/model/commonModel'
import { EventDraft } from '@/model/eventModel'
import {
  DefaultMapObjects,
  MapImageBackground,
  MapImageUploadResponse,
  MapObjectOnMapType,
  MapObjectsContainer,
  MapObjectTypeOrString,
  UserMapObject,
} from '@/model/mapModel'

type MapObjectProps = {
  obj: MapObjectOnMapType
  index: number
}

type ZoomControlsProps = {
  zoomIn: ReactZoomPanPinchHandlers['zoomIn']
  zoomOut: ReactZoomPanPinchHandlers['zoomOut']
}

export type Props = {
  mapId: string
  objectsContainer: MapObjectsContainer
  background: MapImageBackground
  saveParams: {
    url: string
  }
  getMapObjectsById: (id: string | number) => Promise<MapObjectsContainer | false>
  isBackgroundPage?: boolean
  backgroundObjects?: MapObjectsContainer['objects']
  mapNotFound?: string
  objectsToSave?: MapObjectTypeOrString[]
  controlPanelItems?: MapObjectTypeOrString[]
  userObject?: UserMapObject | null
  draggable?: MapObjectTypeOrString[]
  deletable?: MapObjectTypeOrString[]
  resizable?: MapObjectTypeOrString[]
  ExtendButtonBlock?: React.ReactNode
  isFrontend?: boolean
  draftType?: EventDraft['type']
}

const MapContainer: FC<Props> = ({
  mapId,
  objectsContainer,
  background,
  saveParams,
  getMapObjectsById,
  draftType,
  backgroundObjects,
  controlPanelItems = [],
  isBackgroundPage = false,
  mapNotFound = 'Not found',
  objectsToSave = [],
  draggable = [],
  deletable = [],
  resizable = [],
  userObject = null,
  ExtendButtonBlock = undefined,
  isFrontend = false,
}) => {
  const initialScale = 0.4

  const [isLoading, setLoading] = useState<boolean>(false)
  const [isUploading, setUploading] = useState<boolean>(false)
  const [scale, setScale] = useState(initialScale)
  const [mapObjects, setMapObjects] = useState<MapObjectOnMapType[]>(() =>
    getMapObjects(objectsContainer, backgroundObjects),
  )
  const [isMobile, setIsMobile] = useState<boolean>(false)

  const [userNftTokens] = useUserNftTokens()

  /* Ref to user object on map */
  const userRef = useRef<Rnd>(null)
  /* Ref to zoom area */
  const zoomRef = useRef<ReactZoomPanPinchRef>(null)

  /* Optimization of messages. We are reducing the number of parent component re-renders */
  let setSuccessMessage: Dispatchers[0]
  let setErrors: Dispatchers[1]
  const onSuccessErrorComponentMount = (dispatcher: Dispatchers) => {
    ;[setSuccessMessage, setErrors] = dispatcher
  }

  const resizedImageWidth = 1920
  const heightOfZoomContainer = 800
  const widthOfZoomContainer = isFrontend && isMobile ? '100%' : 850

  const minScale = 0.3
  const maxScale = 2

  const scaleForImagePreload = background.width / resizedImageWidth
  const realImageSize = useMemo(
    () => ({
      width: background.width,
      height: background.height,
    }),
    [background.height, background.width],
  )

  const displayedImageSize = useMemo(
    () => ({
      width: resizedImageWidth,
      height: background.height / scaleForImagePreload,
    }),
    [background.height, scaleForImagePreload],
  )

  const DropArea = () => {
    const [{ canDrop }, drop] = useDrop(() => ({
      accept: [NativeTypes.FILE],
      async drop(item: { files: any[] }) {
        if (item.files.length /*&& validateFile(item.files[0], ['image/png'])*/) {
          await uploadFile(item.files[0])
        }
      },
      collect: (monitor: DropTargetMonitor) => ({
        canDrop: monitor.canDrop(),
      }),
    }))

    return (
      <div
        onDoubleClick={changeUserPosition}
        className={clsx(global_styles.droppable, canDrop ? global_styles.droppable_active : '')}
        ref={drop}
      >
        <div className={global_styles.droppable_text}>
          <p className='mb-4'>
            <InboxOutlined />
          </p>
          <p>Drag file to this area to upload</p>
        </div>
      </div>
    )
  }

  // eslint-disable-next-line react/display-name
  const MapObjectContainer: FC<any> = useMemo(
    () =>
      ({ obj, index }: MapObjectProps) => {
        const imageZones = mapObjects.filter((obj) => obj.type === 'image_zone')

        const onDeleteMapObject = async (index: number) => {
          await updateMapObjectData(index)
        }

        const updatePosition = (x: number, y: number) => {
          obj.formRef.current.setFieldsValue(convertCoordinatesToReal(x, y, obj, realImageSize, displayedImageSize))
          // Fix to prevent track after drag stop
          zoomRef.current &&
            zoomRef.current.setTransform(
              zoomRef.current.state.positionX + 0.0001,
              zoomRef.current.state.positionY,
              zoomRef.current.state.scale,
            )
        }

        const onDragStop: DraggableEventHandler = (e, d) => {
          updatePosition(d.lastX, d.lastY)
          if (!isBackgroundPage) {
            const intersectImageZone = getIntersectImageZone(d.lastX, d.lastY)
            if (intersectImageZone?.zone) {
              intersectImageZone.elem?.classList.remove(styles.image_zone_active)
              autoFitObjectToImageZone(intersectImageZone.zone)
            }
          }
        }

        const getIntersectWithImageZone = (objX: number, objY: number, imageZone: MapObjectOnMapType): number => {
          const imageZoneWidth = imageZone.width
          const imageZoneHeight = imageZone.height
          const imageZoneX = imageZone.x
          const imageZoneY = imageZone.y
          const width = obj.formRef.current.getFieldValue('width')
          const height = obj.formRef.current.getFieldValue('height')
          const { x, y } = convertCoordinatesToReal(
            objX,
            objY,
            {} as MapObjectOnMapType,
            realImageSize,
            displayedImageSize,
          )

          const left = Math.max(x, imageZoneX)
          const right = Math.min(x + width, imageZoneX + imageZoneWidth)
          const top = Math.max(y, imageZoneY)
          const bottom = Math.min(y + height, imageZoneY + imageZoneHeight)

          const intersectWidth = right - left
          const intersectHeight = bottom - top
          const square = intersectWidth * intersectHeight

          if (intersectWidth < 0 || intersectHeight < 0) {
            return 0
          }

          return square
        }

        type IntersectImageZone = {
          value: number
          zone: MapObjectOnMapType | undefined
          elem: null | HTMLDivElement
        }
        const getIntersectImageZone = (x: number, y: number): IntersectImageZone | undefined => {
          const maxIntersect: IntersectImageZone = {
            value: 0,
            zone: {} as MapObjectOnMapType,
            elem: null,
          }
          if (imageZones.length) {
            imageZones.forEach((imageZone) => {
              const imageZoneDomElement = document.getElementById(imageZone.ref.current.props.id) as HTMLDivElement
              const intersect = getIntersectWithImageZone(x, y, imageZone)
              if (intersect > maxIntersect['value']) {
                maxIntersect.value = intersect
                maxIntersect.zone = imageZone
                maxIntersect.elem = imageZoneDomElement
              }
              if (imageZoneDomElement) {
                imageZoneDomElement.classList.remove(styles.image_zone_active)
              }
            })
            if (maxIntersect.elem) {
              maxIntersect.elem.classList.add(styles.image_zone_active)
            }
          }
          return maxIntersect.value > 0 ? maxIntersect : undefined
        }

        const autoFitObjectToImageZone = (imageZone: MapObjectOnMapType) => {
          obj.formRef.current.setFieldsValue({
            x: imageZone.x,
            y: imageZone.y,
            width: imageZone.width,
            height: imageZone.height,
          })

          obj.ref.current.updatePosition(
            convertRealCoordinatesToMap(imageZone.x, imageZone.y, obj, realImageSize, displayedImageSize),
          )

          obj.ref.current.updateSize(
            convertRealSizesToMap(imageZone.width, imageZone.height, obj, realImageSize, displayedImageSize),
          )
        }

        const onDrag = (e: RndDragEvent, data: DraggableData) => {
          if (!isBackgroundPage) {
            getIntersectImageZone(data.lastX, data.lastY)
          }
        }

        const onResizeStop: RndResizeCallback = (e, d, htmlElem) => {
          obj.formRef.current.setFieldsValue(
            convertSizesToReal(htmlElem.offsetWidth, htmlElem.offsetHeight, obj, realImageSize, displayedImageSize),
          )
          updatePosition(obj.ref.current.resizingPosition.x, obj.ref.current.resizingPosition.y)
        }

        const initialData = Object.assign(
          {},
          convertRealSizesToMap(obj.width, obj.height, obj, realImageSize, displayedImageSize),
          convertRealCoordinatesToMap(obj.x, obj.y, obj, realImageSize, displayedImageSize),
        )

        if (controlPanelItems.length && !controlPanelItems.includes(obj.type)) {
          draggable.push(`!${obj.id}`)
          resizable.push(`!${obj.id}`)
          deletable.push(`!${obj.id}`)
        }

        return (
          <MapObject
            round={obj.type === 'static_object' || obj.type === 'speaker_location'}
            scale={scale}
            mapObject={obj}
            index={index}
            initialData={initialData}
            draggable={draggable}
            deletable={deletable}
            resizable={resizable}
            onDelete={onDeleteMapObject}
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
            onDrag={onDrag}
            isFrontend={isFrontend && isMobile}
          />
        )
      },
    [
      controlPanelItems,
      deletable,
      displayedImageSize,
      draggable,
      isBackgroundPage,
      isFrontend,
      isMobile,
      mapObjects,
      realImageSize,
      resizable,
      scale,
    ],
  )

  const uploadFile = async (file: File, offset: { x: number; y: number } | null = null) => {
    await updateMapObjectData()

    setUploading(true)

    /* Upload image right after the selection */
    const formData = new FormData()
    formData.append('photo', file)
    const response = await apiUploadFile<MapImageUploadResponse>(
      process.env.NEXT_PUBLIC_API_POST_UPLOAD_ROOM_IMAGE!,
      formData,
    )

    if (response._cc_errors.length) {
      popup.error(response._cc_errors.join(', '))
    } else if (response?.data?.response?.id) {
      /* Add image to map objects */
      const errorsOnSavingObjects = await saveMapObjects(saveParams.url, mapObjects, objectsToSave, [
        addImageToObjects(
          response.data.response.id,
          userObject,
          offset !== null
            ? convertCoordinatesToReal(offset.x, offset.y, {} as MapObjectOnMapType, realImageSize, displayedImageSize)
            : mapObjects.length,
          {
            width: realImageSize['width'] / 4,
            height: realImageSize['width'] / 6,
          },
        ),
      ])

      if (errorsOnSavingObjects.length) {
        setErrors(errorsOnSavingObjects)
      } else {
        await refreshMapObjects()
      }
    }
    setUploading(false)
  }

  const uploadProps = {
    beforeUpload: () => {
      // Return false, because we will proceed custom request
      // return validateFile(file, ['image/png']) ? false : Upload.LIST_IGNORE;
      return false
    },
    maxCount: 1,
    accept: 'image/*,',
    showUploadList: false,
    onChange: async (info: UploadChangeParam<any>) => {
      // if (info?.file.type === 'image/png' && !isUploading) {
      await uploadFile(info.file)
      // }
    },
  }

  const changeUserPosition = (event: React.MouseEvent<HTMLDivElement>) => {
    userRef.current &&
      userObject &&
      userRef.current.updatePosition(
        convertRoundObjectPositionToMap(
          event.nativeEvent.offsetX,
          event.nativeEvent.offsetY,
          userObject.publisherRadarSize,
          realImageSize,
          displayedImageSize,
        ),
      )
  }

  /* Make request to server and get up-to-date information about map objects  */
  const refreshMapObjects = async () => {
    const updatedMapObjects = await getMapObjectsById(mapId)
    if (updatedMapObjects === false) {
      setErrors([mapNotFound])
    } else {
      setMapObjects(getMapObjects(updatedMapObjects, backgroundObjects))
    }
  }

  /* Save to the states information about objects on the map */
  const updateMapObjectData = (updateIdOrObject: MapObjectOnMapType | number = -1) => {
    setMapObjects((prev) => {
      const newData = syncObjectAndFormValues(prev)
      // Delete item
      typeof updateIdOrObject === 'number' && updateIdOrObject !== -1 && newData.splice(updateIdOrObject, 1)

      // Add new item
      if (typeof updateIdOrObject === 'object') {
        newData.push(updateIdOrObject)
      }
      return newData
    })
  }

  const onSave = async () => {
    await updateMapObjectData()

    setErrors([])
    setSuccessMessage('')
    setLoading(true)

    const errorsOnSavingObjects = await saveMapObjects(saveParams.url, mapObjects, objectsToSave)

    if (errorsOnSavingObjects.length) {
      setErrors(errorsOnSavingObjects)
    } else {
      setSuccessMessage('Saved successfully!')
      await refreshMapObjects()
    }
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onZoom = useCallback(
    debounce((ref: ReactZoomPanPinchRef) => {
      updateScale(ref.state.scale)
    }, 150),
    [],
  )

  const updateScale = (newScale: number) => {
    setScale((prevValue) => {
      if (prevValue !== newScale) {
        // Save the position
        updateMapObjectData()
      }
      return newScale
    })
    zoomRef.current &&
      zoomRef.current.setTransform(zoomRef.current.state.positionX, zoomRef.current.state.positionY, newScale)
  }

  const onZoomAreaInit = () => {
    /* Objects correct position hack */
    setScale(0.41)
    queueMicrotask(() => {
      setScale(0.4)
    })
  }

  const ZoomControls = ({ zoomIn, zoomOut }: ZoomControlsProps) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onZoomInOut = useCallback(
      debounce(() => {
        updateScale(zoomRef.current!.state.scale)
      }, 150),
      [],
    )
    const onZoomIn = () => {
      zoomIn(0.2, 0)
      onZoomInOut()
    }
    const onZoomOut = () => {
      zoomOut(0.2, 0)
      onZoomInOut()
    }
    return (
      <div className={clsx(styles.zoom_control)}>
        <Button onClick={onZoomIn} title='Zoom in'>
          +
        </Button>
        <Button onClick={onZoomOut} title='Zoom out'>
          -
        </Button>
      </div>
    )
  }

  const BackgroundAddObject = () => {
    const [menuItems, setMenuItems] = useState<DefaultMapObjects>({} as DefaultMapObjects)

    const onChange = (v: string) => {
      const newItem = JSON.parse(v)
      newItem.id = getUniqueId(mapObjects)
      newItem.ref = React.createRef()
      newItem.formRef = React.createRef()
      updateMapObjectData(newItem)
    }

    const mapObjectsLength = Object.keys(mapObjects).length

    useEffect(() => {
      const defaultMapObjects = getDefaultMapObjects()
      if (mapObjectsLength) {
        mapObjects.forEach((obj) => {
          if (defaultMapObjects[obj.type] && defaultMapObjects[obj.type].limit === 1) {
            delete defaultMapObjects[obj.type]
          }
        })
      }
      setMenuItems(defaultMapObjects)
    }, [mapObjectsLength])

    return (
      <Select onChange={onChange} value={undefined} placeholder='Select object to add' style={{ width: '100%' }}>
        {Object.keys(menuItems).map((type) => {
          const defaultObject = menuItems[type as keyof typeof menuItems]
          return type !== 'image' && type !== 'nft_image' ? (
            <Select.Option value={JSON.stringify(defaultObject.config)} key={type}>
              {defaultObject.name}
              {defaultObject.description && (
                <span style={{ position: 'absolute', right: '10px', top: '3px' }}>
                  <Tooltip title={defaultObject.description}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              )}
            </Select.Option>
          ) : undefined
        })}
      </Select>
    )
  }

  useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])

  return (
    <div className={isFrontend && isMobile ? styles.is_frontend : undefined}>
      <Button
        onClick={onSave}
        className={clsx(global_styles['mt-1'], styles.submit_btn)}
        loading={isLoading}
        type='primary'
      >
        Save
      </Button>

      {!isBackgroundPage && draftType && (
        <>
          {(draftType === 'l_networking' || draftType === 'multiroom') && (
            <MakeGallery roomName={mapId}>
              <Button
                className={clsx(global_styles['ml-1'])}
                type='primary'
                icon={<FileImageOutlined />}
                style={{
                  backgroundColor: '#fa8c16',
                  borderColor: '#fa8c16',
                }}
              >
                Use gallery background
              </Button>
            </MakeGallery>
          )}
          <UploadRoomBackground draftType={draftType} roomName={mapId}>
            <Button
              className={clsx(global_styles['ml-1'])}
              type='primary'
              style={{
                backgroundColor: '#fa8c16',
                borderColor: '#fa8c16',
              }}
            >
              Change background
            </Button>
          </UploadRoomBackground>
        </>
      )}

      {!isBackgroundPage && userNftTokens.length > 0 && (
        <AddNftModal
          nfts={userNftTokens}
          saveParams={saveParams}
          existingObjects={mapObjects}
          objectsToSave={objectsToSave}
          onSuccess={refreshMapObjects}
          className={clsx(global_styles['ml-1'])}
        />
      )}

      <Upload {...uploadProps} className={clsx(global_styles['ml-1'])}>
        <Button icon={<UploadOutlined />} loading={isUploading}>
          Upload image
        </Button>
      </Upload>

      {isFrontend && isMobile && zoomRef.current && (
        <ZoomControls zoomIn={zoomRef.current!.zoomIn} zoomOut={zoomRef.current!.zoomOut} />
      )}

      {ExtendButtonBlock}

      <SuccessErrorMessages onMount={onSuccessErrorComponentMount} />

      <div
        className={clsx(global_styles['mt-1'], 'd-flex relative', isUploading || isLoading ? styles.is_loading : '')}
      >
        <TransformWrapper
          ref={zoomRef}
          wheel={{ wheelDisabled: true }}
          panning={{ excluded: ['panExcluded'] }}
          initialScale={initialScale}
          minScale={minScale}
          centerZoomedOut={true}
          maxScale={maxScale}
          doubleClick={{ disabled: true }}
          onZoomStop={onZoom}
          onInit={onZoomAreaInit}
          zoomAnimation={{ disabled: true }}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              {(!isFrontend || !isMobile) && <ZoomControls zoomIn={zoomIn} zoomOut={zoomOut} />}

              <TransformComponent
                wrapperStyle={{
                  width: widthOfZoomContainer,
                  height: heightOfZoomContainer,
                  position: 'relative',
                }}
                wrapperClass='flex-shrink-0'
              >
                <DndProvider backend={HTML5Backend}>
                  <DropArea />
                </DndProvider>

                {/* Room objects */}
                {mapObjects.map((obj, index) => (
                  <MapObjectContainer obj={obj} key={obj.id} index={index} />
                ))}

                {/* Background image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getUrlWithSizes(
                    background.resizerUrl,
                    displayedImageSize.width,
                    Math.round(displayedImageSize.height),
                  )}
                  alt='Background image'
                />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>

        <div className={clsx(styles.control_bar, global_styles['ml-1'], 'w100')}>
          <ControlPanel
            mapObjects={mapObjects}
            realImageSize={realImageSize}
            displayedImageSize={displayedImageSize}
            updateMapObjectData={updateMapObjectData}
            setMapObjects={setMapObjects}
            showOnly={controlPanelItems}
          />

          <div className={clsx(global_styles['mt-1'], 'd-flex')}>
            <Upload {...uploadProps} className={clsx(global_styles['mr-1'])}>
              <Button icon={<UploadOutlined />} loading={isUploading}>
                Upload image
              </Button>
            </Upload>

            <BackgroundAddObject />
          </div>
          {!isBackgroundPage && userNftTokens.length > 0 && (
            <AddNftModal
              nfts={userNftTokens}
              saveParams={saveParams}
              existingObjects={mapObjects}
              objectsToSave={objectsToSave}
              onSuccess={refreshMapObjects}
              className={clsx(global_styles['mt-1'], 'w100')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

MapContainer.propTypes = {
  mapId: PropTypes.string.isRequired,
  objectsContainer: PropTypes.object.isRequired,
  background: PropTypes.object.isRequired,
  saveParams: PropTypes.shape({
    url: PropTypes.string,
    params: PropTypes.object,
  }).isRequired,
  getMapObjectsById: PropTypes.func.isRequired,
  mapNotFound: PropTypes.string,
  isBackgroundPage: PropTypes.bool,
  controlPanelItems: PropTypes.array,
  draggable: PropTypes.array,
  deletable: PropTypes.array,
  resizable: PropTypes.array,
  userObject: PropTypes.object,
  objectsToSave: PropTypes.array,
  ExtendButtonBlock: PropTypes.node,
}

export default MapContainer
