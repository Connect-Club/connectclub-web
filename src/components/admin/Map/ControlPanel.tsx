import React, { Dispatch, SetStateAction } from 'react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { BulbFilled } from '@ant-design/icons'
import { Collapse } from 'antd'
import { arrayMoveImmutable } from 'array-move'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import ControlBarItem from '@/components/admin/Map/ControlBarItem'
import { getDefaultMapObjects, syncObjectAndFormValues } from '@/components/admin/Map/helper'
import styles from '@/components/admin/Map/map.module.css'
import { Delete } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { MapImageObjectSizes, MapObjectOnMapType, MapObjectTypeOrString } from '@/model/mapModel'

type ControlBarIconProps = {
  index: number | string
}

type ControlBarDeleteIconProps = {
  index: number
}

type SortableListType = {
  children: React.ReactNode
}

type SortEndProps = {
  oldIndex: number
  newIndex: number
}

type SortableItemProps = {
  obj: MapObjectOnMapType
  objIndex: number
}

type Props = {
  mapObjects: MapObjectOnMapType[]
  realImageSize: MapImageObjectSizes
  displayedImageSize: MapImageObjectSizes
  setMapObjects: Dispatch<SetStateAction<MapObjectOnMapType[]>>
  updateMapObjectData: (deleteId?: number) => void
  showOnly?: MapObjectTypeOrString[]
}

const ControlPanel: FC<Props> = ({
  mapObjects,
  realImageSize,
  displayedImageSize,
  setMapObjects,
  updateMapObjectData,
  showOnly = [],
}) => {
  const onSortEnd = ({ oldIndex, newIndex }: SortEndProps) => {
    setMapObjects(syncObjectAndFormValues(arrayMoveImmutable(mapObjects, oldIndex, newIndex)))
  }

  const SortableItem = SortableElement<SortableItemProps>(({ obj, objIndex }: SortableItemProps) => {
    const showPanel = !showOnly.length || (showOnly.includes(obj.type) && !showOnly?.includes(`!${obj.id}`))
    const defaultMapObjects = getDefaultMapObjects()
    const defaultObject = defaultMapObjects[obj.type]
    return (
      <>
        {showPanel ? (
          <Collapse collapsible='header'>
            <Collapse.Panel
              header={
                <>
                  {defaultObject.name}
                  {!defaultObject?.limit || defaultObject?.limit > 1 ? ` #${obj.id}` : ``}
                </>
              }
              forceRender={true}
              key={objIndex}
              extra={
                <>
                  <Lightbulb index={obj.id} />
                  <DeleteIcon index={objIndex} />
                </>
              }
            >
              <ControlBarItem
                round={obj.type === 'static_object' || obj.type === 'speaker_location'}
                obj={obj}
                realImageSize={realImageSize}
                displayedImageSize={displayedImageSize}
              />
            </Collapse.Panel>
          </Collapse>
        ) : (
          <div />
        )}
      </>
    )
  })

  /* Delete object from map */
  const DeleteIcon: FC<ControlBarDeleteIconProps> = ({ index }) => {
    const onDelete = () => {
      updateMapObjectData(index)
    }
    return (
      <a onClick={onDelete} title='Delete object' className={global_styles['ml-1']}>
        <Delete width='16px' height='16px' color='#f00' />
      </a>
    )
  }
  DeleteIcon.propTypes = {
    index: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  return (
    <SortableList onSortEnd={onSortEnd} distance={10}>
      {mapObjects.map((obj, index) => (
        <SortableItem key={obj.id} index={index} objIndex={index} obj={obj} />
      ))}
    </SortableList>
  )
}

ControlPanel.propTypes = {
  mapObjects: PropTypes.array.isRequired,
  realImageSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  displayedImageSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  setMapObjects: PropTypes.func.isRequired,
  updateMapObjectData: PropTypes.func.isRequired,
  showOnly: PropTypes.array,
}

const Lightbulb: FC<ControlBarIconProps> = ({ index }) => {
  const onLightTheObject = () => {
    const lightbulb = document.getElementById(`lightbulb-object-${index}`)
    const objectOnMap = document.getElementById(`room-object-${index}`)
    lightbulb && lightbulb.classList.add(styles.colored)
    objectOnMap && objectOnMap.classList.add(styles.colored)
    setTimeout(() => {
      lightbulb && lightbulb.classList.remove(styles.colored)
      objectOnMap && objectOnMap.classList.remove(styles.colored)
    }, 3000)
  }
  return (
    <a onClick={onLightTheObject} title='Light the object on the map'>
      <BulbFilled className={clsx(styles.lighbulb)} id={`lightbulb-object-${index}`} />
    </a>
  )
}

Lightbulb.propTypes = {
  index: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

const SortableList = SortableContainer<SortableListType>(({ children }: SortableListType) => {
  return <div>{children}</div>
})

export default ControlPanel
