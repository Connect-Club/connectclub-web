import React, { useCallback, useEffect } from 'react'
import { DraggableEventHandler } from 'react-draggable'
import { Rnd, RndResizeCallback } from 'react-rnd'
import { EditOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import Image from 'next/image'
import PropTypes from 'prop-types'

import EditImageMapInfo from '@/components/admin/Map/EditImageMapInfo'
import { getDefaultMapObjects } from '@/components/admin/Map/helper'
import styles from '@/components/admin/Map/map.module.css'
import { getUrlWithSizes } from '@/lib/helpers'
import { Delete } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { MapObjectOnMapType, MapObjectType, MapObjectTypeOrString } from '@/model/mapModel'

type Props = {
  mapObject: MapObjectOnMapType
  initialData: Omit<MapObjectType, 'type'>
  index: number
  scale: number
  round?: boolean
  onDelete?: (index: number) => void
  onDragStop?: DraggableEventHandler
  onDrag?: DraggableEventHandler
  onResizeStop?: RndResizeCallback
  children?: React.ReactNode
  draggable?: MapObjectTypeOrString[]
  deletable?: MapObjectTypeOrString[]
  resizable?: MapObjectTypeOrString[]
  isFrontend?: boolean
}

const MapObject: FC<Props> = ({
  mapObject,
  initialData,
  scale,
  index,
  round = false,
  onDelete,
  onDragStop,
  onDrag,
  onResizeStop,
  draggable = [],
  deletable = [],
  resizable = [],
  isFrontend = false,
}) => {
  const isDraggable =
    (draggable?.length && draggable.includes(mapObject.type) && !draggable.includes(`!${mapObject.id}`)) ||
    !draggable?.length
  const isResizable =
    (resizable?.length && resizable.includes(mapObject.type) && !resizable.includes(`!${mapObject.id}`)) ||
    !resizable?.length
  const isDeletable =
    ((deletable.length && deletable.includes(mapObject.type) && !deletable.includes(`!${mapObject.id}`)) ||
      !deletable?.length) &&
    onDelete

  const defaultMapObjects = getDefaultMapObjects()
  const defaultObject = defaultMapObjects[mapObject.type]

  const objectName = `${defaultObject.name} ${
    !defaultObject?.limit || defaultObject?.limit > 1 ? ` #${mapObject.id}` : ``
  }`

  const DeleteObject = (props: { width?: string; height?: string; color?: string } = {}) => {
    const initialProps = Object.assign(
      {},
      {
        width: '36px',
        height: '36px',
        color: '#f00',
      },
      props,
    )
    const onDeleteObject = () => {
      onDelete && onDelete(index)
    }
    return (
      <a
        className={clsx(styles.rnd_object_delete, isDraggable ? 'panExcluded' : '')}
        onClick={onDeleteObject}
        onTouchStart={isFrontend ? onDeleteObject : undefined}
        title='Delete object'
      >
        {isFrontend ? (
          <div className={clsx(styles.rnd_object_delete_icon, isDraggable ? 'panExcluded' : '')} />
        ) : (
          <Delete {...initialProps} />
        )}
      </a>
    )
  }

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    handleClickOutside(e)
    if (isFrontend && mapObject.ref.current && (isDraggable || isResizable)) {
      const mapDOMObject = document.querySelector(
        `#${mapObject.ref.current.props.id} .${styles.rnd_object_wrap}`,
      ) as HTMLDivElement
      if (mapDOMObject) {
        mapDOMObject.classList.add(styles.active_rnd_object)
      }
    }
  }

  const ResizeHandle = () => <div className={styles.handle} />

  const handleClickOutside = useCallback((event: any) => {
    const mapObjects = document.querySelectorAll(`.${styles.rnd_object_wrap}`)
    if (mapObjects) {
      Array.from(mapObjects).forEach((obj) => {
        if (!obj.contains(event.target as HTMLDivElement)) {
          obj.classList.remove(styles.active_rnd_object)
        }
      })
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <Rnd
      scale={scale}
      ref={mapObject.ref}
      id={`room-object-${mapObject.id}`}
      disableDragging={!isDraggable}
      enableResizing={isResizable}
      className={clsx(
        styles.rnd_object,
        isDraggable ? 'panExcluded' : '',
        isFrontend ? styles.is_frontend : undefined,
        round ? styles.rnd_object_round : '',
        !isDraggable && !isResizable && !isDeletable ? styles.rnd_inactive : '',
      )}
      onDragStop={onDragStop}
      onDrag={onDrag}
      onResizeStop={onResizeStop}
      default={initialData}
      lockAspectRatio={round}
      style={{ zIndex: index + 1 }}
      resizeHandleComponent={
        isFrontend
          ? {
              top: <ResizeHandle />,
              right: <ResizeHandle />,
              bottom: <ResizeHandle />,
              left: <ResizeHandle />,
              topRight: <ResizeHandle />,
              bottomRight: <ResizeHandle />,
              bottomLeft: <ResizeHandle />,
              topLeft: <ResizeHandle />,
            }
          : {}
      }
      resizeHandleClasses={{
        top: `${styles.handle_top}`,
        left: `${styles.handle_left}`,
        right: `${styles.handle_right}`,
        bottom: `${styles.handle_bottom}`,
      }}
    >
      <div className={clsx(styles.rnd_object_wrap, isDraggable ? 'panExcluded' : '')} onTouchStart={onTouchStart}>
        {isFrontend && (
          <div className={clsx(styles.rnd_object_bar, isDraggable ? 'panExcluded' : '')}>
            <EditImageMapInfo obj={mapObject}>
              <EditOutlined style={{ fontSize: '40px', color: '#fff', padding: '15px' }} />
            </EditImageMapInfo>

            {isDeletable && <DeleteObject width={'28px'} height={'28px'} color={'#fff'} />}
          </div>
        )}

        <span className={clsx(styles.rnd_object_type, isDraggable ? 'panExcluded' : '')}>
          {isFrontend
            ? (mapObject.formRef.current && mapObject.formRef.current.getFieldValue('title')) || objectName
            : objectName}
        </span>

        {mapObject.src !== undefined && (
          <div className={clsx(styles.rnd_image, isDraggable ? 'panExcluded' : '')}>
            <Image
              src={
                mapObject.type === 'nft_image'
                  ? getUrlWithSizes(mapObject.src, mapObject.width * 2, mapObject.height * 2)
                  : mapObject.src
              }
              quality={55}
              alt={`#${mapObject.id}`}
              layout='fill'
              objectFit='cover'
            />
          </div>
        )}

        {isDeletable && <DeleteObject />}
      </div>
    </Rnd>
  )
}

MapObject.propTypes = {
  mapObject: PropTypes.object.isRequired,
  initialData: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  index: PropTypes.number.isRequired,
  scale: PropTypes.number.isRequired,
  onDelete: PropTypes.func,
  onDragStop: PropTypes.func,
  onResizeStop: PropTypes.func,
  children: PropTypes.node,
  draggable: PropTypes.arrayOf(PropTypes.string),
  deletable: PropTypes.arrayOf(PropTypes.string),
}

export default MapObject
