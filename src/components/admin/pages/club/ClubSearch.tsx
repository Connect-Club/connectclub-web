import React, { useState } from 'react'
import { Select, Spin } from 'antd'
import debounce from 'lodash/debounce'
import Image from 'next/image'

import { doRequest } from '@/lib/Api'
import { getUrlWithSizes } from '@/lib/helpers'
import { Club, Clubs } from '@/model/clubModel'
import { FC } from '@/model/commonModel'

export type ClubSearchResult = {
  value: string
  label: string
  key: string
  disabled: boolean | undefined
}

type Props = {
  [key: string]: any
  selectOptionValue?: (club: Club) => string
  limit?: number
}

const ClubSearch: FC<Props> = (props) => {
  const [searchOptions, setSearchOptions] = useState<JSX.Element[]>([])
  const [isSearching, setSearching] = useState<boolean>(false)

  const { selectOptionValue, limit, ...selectProps } = props

  const getClubValue = (club: Club) => {
    if (selectOptionValue) {
      return selectOptionValue(club)
    }
    return club.id
  }

  const onSearch = (value: string) => {
    const clubs = doRequest<Clubs>({
      method: 'GET',
      endpoint: process.env.NEXT_PUBLIC_API_GET_CLUBS!,
      data: {
        limit: limit || 20,
        query: encodeURIComponent(value),
      },
    })
    setSearchOptions([])
    setSearching(true)
    clubs
      .then((r) => {
        if (r._cc_errors.length) {
          setSearchOptions([])
        } else {
          if (r.data !== null && r.data?.response?.items?.length) {
            const options = r.data.response.items.map((club) => {
              const val = getClubValue(club)
              return (
                <Select.Option value={val} key={club.id} label={club.title}>
                  <div className={'d-flex align-items-center gutter-03'}>
                    {club?.avatar && (
                      <div
                        className={'relative flex-shrink-0'}
                        style={{
                          width: 50,
                          height: 50,
                        }}
                      >
                        <Image
                          src={getUrlWithSizes(club.avatar, 50, 50)}
                          layout={'fill'}
                          objectFit={'contain'}
                          alt={'club image'}
                        />
                      </div>
                    )}
                    {club.title}
                  </div>
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

  return (
    <Select
      showSearch
      loading={isSearching}
      optionLabelProp='label'
      labelInValue
      placeholder='Start printing club name or slug or owner'
      filterOption={false}
      onSearch={debounce(onSearch, 800)}
      notFoundContent={isSearching ? <Spin size='small' /> : null}
      style={{ width: '100%' }}
      {...selectProps}
    >
      {searchOptions}
    </Select>
  )
}

export default ClubSearch
