import React, { useEffect, useState } from 'react'
import { Select, Spin } from 'antd'

import { doRequest } from '@/lib/Api'
import { isAdmin } from '@/lib/store'
import { FC } from '@/model/commonModel'
import { Rooms } from '@/model/roomModel'

type Props = {
  [key: string]: any
  limit?: number
  userId?: number
}

const RoomSearch: FC<Props> = (props) => {
  const [searchOptions, setSearchOptions] = useState<JSX.Element[]>([])
  const [isSearching, setSearching] = useState<boolean>(false)

  const { userId, limit, ...selectProps } = props
  const isUserAdmin = isAdmin()

  useEffect(() => {
    const getRooms = () => {
      const data: { limit: number; userId?: number } = {
        limit: limit || 20,
      }
      const cleanUserId = parseInt(String(userId))
      if (isUserAdmin && cleanUserId) {
        data['userId'] = cleanUserId
      }
      const rooms = doRequest<Rooms>({
        method: 'GET',
        endpoint: process.env.NEXT_PUBLIC_API_GET_ALWAYS_REOPEN_ROOMS!,
        data,
      })
      setSearchOptions([])
      setSearching(true)
      rooms
        .then((r) => {
          if (r._cc_errors.length) {
            setSearchOptions([])
          } else {
            if (r.data !== null && r.data?.response?.items?.length) {
              const options = r.data.response.items.map((room) => {
                return (
                  <Select.Option value={room.name} key={room.name} label={room.name}>
                    {room.description} ({room.name})
                  </Select.Option>
                )
              })
              setSearchOptions(options)
            } else {
              setSearchOptions([])
            }
          }
        })
        .finally(() => setSearching(false))
    }
    getRooms()
  }, [isUserAdmin, limit, userId])

  return (
    <Select
      showSearch
      loading={isSearching}
      optionLabelProp='label'
      labelInValue
      filterOption={false}
      notFoundContent={isSearching ? <Spin size='small' /> : null}
      style={{ width: '100%' }}
      {...selectProps}
    >
      {searchOptions}
    </Select>
  )
}

export default RoomSearch
