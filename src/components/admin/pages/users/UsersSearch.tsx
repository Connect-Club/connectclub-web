import React, { useState } from 'react'
import { Select, Spin } from 'antd'
import debounce from 'lodash/debounce'

import { searchUsers } from '@/api/userApi'
import { cleanUserData, getAvatar } from '@/lib/helpers'

const UsersSearch = (props: React.ComponentProps<any>): JSX.Element => {
  const [searchOptions, setSearchOptions] = useState<JSX.Element[]>([])
  const [isSearching, setSearching] = useState<boolean>(false)

  const onSearch = (value: string) => {
    const searchValue = isNaN(+value) || value[0] === '+' ? value : parseInt(value)
    const users = searchUsers(searchValue)
    setSearchOptions([])
    setSearching(true)
    users
      .then((r) => {
        if (r._cc_errors.length) {
          setSearchOptions([])
        } else {
          if (r.data !== null && r.data?.response?.items?.length) {
            const options = r.data.response.items.map((user) => (
              <Select.Option
                key={user.id}
                value={JSON.stringify(cleanUserData(user))}
                label={`${user.displayName} (#${user.id})`}
              >
                {getAvatar(user, 24)}
                {user.displayName} (#{user.id})
              </Select.Option>
            ))
            setSearchOptions(options)
          } else {
            setSearchOptions([])
          }
        }
      })
      .finally(() => setSearching(false))
  }

  return (
    <Select
      showSearch
      mode='multiple'
      loading={isSearching}
      optionLabelProp='label'
      labelInValue
      placeholder='Start printing user ID or name'
      filterOption={false}
      onSearch={debounce(onSearch, 800)}
      notFoundContent={isSearching ? <Spin size='small' /> : null}
      {...props}
    >
      {searchOptions}
    </Select>
  )
}

export default UsersSearch
