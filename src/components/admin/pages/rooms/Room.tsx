import React, { useCallback, useEffect, useState } from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import clsx from 'clsx'
import platform from 'platform-detect'
import PropTypes from 'prop-types'

import { getRoom } from '@/api/roomApi'
import global_styles from '@/components/admin/css/admin.module.css'
import RoomEdit from '@/components/admin/pages/rooms/RoomEdit'
import { setWindowHistoryState } from '@/lib/utils'
import { FC } from '@/model/commonModel'
import type { Room } from '@/model/roomModel'

type Props = {
  args: string[]
  rootPage?: string
  isFrontend?: boolean
}
type RoomId = string | undefined
type SearchRoomValues = {
  roomId: RoomId
}

const RoomPage: FC<Props> = ({ args, rootPage = '', isFrontend = false }: Props) => {
  const [isLoading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [room, setRoom] = useState<Room>({} as Room)

  const [form] = Form.useForm()

  const roomId: RoomId = args[0]

  const onSearchRoom = useCallback(
    async (values: SearchRoomValues) => {
      setError('')
      if (values.roomId) {
        // Branch IO link
        const smartRoomId = values.roomId.match(/room=(\w+)&/)
        let roomId = smartRoomId?.[1] || values.roomId
        if (!smartRoomId?.[1]) {
          // Appsflyer
          const index = values.roomId.indexOf('?')
          if (index !== -1) {
            const url = values.roomId.substring(index)
            const params = new URLSearchParams(url)
            const deep_link_value = params.get('deep_link_value')
            if (deep_link_value) {
              const dp = deep_link_value.split('_')
              roomId = dp[dp.indexOf('roomId') + 1]
            }
          }
        }

        setLoading(true)
        const response = await getRoom(roomId)
        setLoading(false)
        if (response._cc_errors.length) {
          setError('Room not found')
        } else if (response.data) {
          form.setFieldsValue({ roomId: roomId })
          setRoom(response.data.response)
          setWindowHistoryState((rootPage || '/admin/rooms') + '/' + response.data.response.name)
        }
      }
    },
    [form, rootPage],
  )

  useEffect(() => {
    if (roomId !== undefined) {
      onSearchRoom({ roomId }).then()
    }
  }, [onSearchRoom, roomId])

  return (
    <>
      {!platform.chrome && (
        <div className='d-flex align-items-center justify-content-center mt-1'>
          <ExclamationCircleOutlined
            style={{
              color: '#f00',
              fontSize: '22px',
              marginRight: '10px',
            }}
          />
          <div className={global_styles['ml-1']} style={{ color: '#f00' }}>
            Please, use only Chrome browser to work with room constructor
          </div>
        </div>
      )}
      <div className={global_styles.block}>
        <p className={global_styles.h3}>Room editor:</p>
        <Form
          name='room_welcome'
          layout='inline'
          onFinish={onSearchRoom}
          initialValues={{
            roomId: roomId,
          }}
          form={form}
        >
          <Input.Group compact>
            <Form.Item
              style={{ width: isFrontend ? '230px' : '350px' }}
              name='roomId'
              rules={[
                {
                  required: true,
                  message: 'Please input room link!',
                },
              ]}
            >
              <Input placeholder='Enter room link' />
            </Form.Item>
            <Button type='primary' htmlType='submit' loading={isLoading}>
              Load
            </Button>
          </Input.Group>
        </Form>
        {error && <div className={clsx(global_styles.error_text, global_styles['my-1'])}>{error}</div>}
        {!error && room?.id ? <RoomEdit key={room.name} room={room} isFrontend={isFrontend} /> : null}
      </div>
    </>
  )
}

RoomPage.propTypes = {
  args: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default RoomPage
