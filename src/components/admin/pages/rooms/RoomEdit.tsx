import React, { useMemo, useState } from 'react'
import { EditOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import DataJson from '@/components/admin/common/DataJson'
import global_styles from '@/components/admin/css/admin.module.css'
import { getRoomObjectsByRoomName } from '@/components/admin/Map/helper'
import MapContainer from '@/components/admin/Map/MapContainer'
import { doRequest } from '@/lib/Api'
import { FC } from '@/model/commonModel'
import type { Room } from '@/model/roomModel'

type Props = {
  room: Room
  isFrontend?: boolean
}

const RoomEdit: FC<Props> = ({ room, isFrontend = false }) => {
  const initialProps = useMemo(
    () => ({
      mapId: room.name,
      objectsContainer: room.config,
      draftType: room.draftType,
      background: room.config.backgroundRoom,
      backgroundObjects: room.config.backgroundObjects,
      saveParams: {
        url: process.env.NEXT_PUBLIC_API_POST_UPDATE_ROOM_OBJECTS!.replace(/{videoRoomName}/, room.name),
      },
      getMapObjectsById: getRoomObjectsByRoomName,
      mapNotFound: 'Room not found',
      userObject: {
        videoBubbleSize: room.config.videoBubbleSize,
        publisherRadarSize: room.config.publisherRadarSize,
      },
      resizable: [
        'image',
        'nft_image',
        'image_zone',
        'static_object',
        'speaker_location',
        'main_spawn',
        'time_box',
        'quiet_zone',
      ],
      isFrontend,
    }),
    [isFrontend, room.config, room.draftType, room.name],
  )

  return (
    <div>
      <div className={clsx(global_styles.info_block)}>
        {!isFrontend ? (
          <>
            <DataJson data={room}>
              <span className={global_styles.bold}>Room #{room.id}</span>
            </DataJson>
            <div className={global_styles.mt_1}>
              <RoomDescription initialDescription={room.description} roomName={room.name} />
            </div>
          </>
        ) : (
          <RoomDescription initialDescription={room.description} roomName={room.name} />
        )}
      </div>

      <MapContainer {...initialProps} />
    </div>
  )
}

type RoomDescriptionType = {
  roomName: string
  initialDescription: string
}

type RoomDescriptionInitialValue = {
  description: RoomDescriptionType['initialDescription']
}

const RoomDescription: FC<RoomDescriptionType> = ({ initialDescription, roomName }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [description, setDescription] = useState(initialDescription)

  const handleOnClick = () => {
    setIsEditing(true)
  }
  const handleOnOk = async (values: RoomDescriptionInitialValue) => {
    setIsLoading(true)
    const response = await doRequest({
      method: 'PATCH',
      endpoint: process.env.NEXT_PUBLIC_API_PATCH_UPDATE_ROOM_CONFIG!.replace('{name}', roomName),
      data: {
        description: values.description,
      },
    })
    if (!response._cc_errors.length) {
      setDescription(values.description)
    } else {
      console.error(response._cc_errors)
    }
    setIsLoading(false)
    setIsEditing(false)
  }

  return !isEditing ? (
    <span className={global_styles.black}>
      {description}
      {` `}
      <EditOutlined title={'Edit description'} onClick={handleOnClick} />
    </span>
  ) : (
    <Form name='edit-room-description' layout='inline' onFinish={handleOnOk} initialValues={{ description }}>
      <Input.Group compact>
        <Form.Item name='description'>
          <Input.TextArea style={{ width: '400px' }} />
        </Form.Item>
        <Button type='primary' htmlType='submit' loading={isLoading}>
          Save
        </Button>
      </Input.Group>
    </Form>
  )
}

RoomEdit.propTypes = {
  room: PropTypes.object.isRequired,
}

export default RoomEdit
