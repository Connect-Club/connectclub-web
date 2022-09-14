import React, { useEffect, useState } from 'react'
import { Button, Tag, Tooltip } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import { getMembers, useMembers } from '@/api/clubApi'
import global_styles from '@/components/admin/css/admin.module.css'
import MakeModeratorLink from '@/components/admin/pages/club/MakeModeratorLink'
import UserInfo from '@/components/admin/pages/club/UserInfo'
import { getAvatar } from '@/lib/helpers'
import { Loader } from '@/lib/svg'
import { Club } from '@/model/clubModel'
import { FC } from '@/model/commonModel'

type Props = {
  id: Club['id']
  totalCount: number
  clubRole: Club['clubRole']
}
const Members: FC<Props> = ({ id, totalCount }) => {
  const limit = 100
  const [members, isLoading, setMembers, membersLastValue] = useMembers(id, {
    limit,
  })
  const [lastValue, setLastValue] = useState<number | null>(0)
  const [isMoreLoading, setMoreLoading] = useState<boolean>(false)
  const [total, setTotal] = useState<number>(0)

  /* Lazy load */
  const onLoadMore = async () => {
    await updateMembers(lastValue || 0)
  }

  const updateMembers = async (lastId = 0) => {
    setMoreLoading(true)

    const r = await getMembers(id, { limit, lastValue: lastId })

    setMoreLoading(false)
    if (!r._cc_errors.length && r.data !== null && r.data?.response?.items) {
      const updatedMembers = r.data.response.items
      if (!lastId) {
        setMembers(updatedMembers)
        setTotal(updatedMembers.length)
      } else {
        setMembers((prevValue) => {
          const newValue = [...prevValue, ...updatedMembers]
          setTotal(newValue.length)
          return newValue
        })
      }
      setLastValue(r.data.response.lastValue)
    }
  }

  const onModeratorChanged = async (userId: string) => {
    await setMembers((prevValue) => {
      const newData = [...prevValue]
      const index = prevValue.findIndex((item) => userId === item.id)
      if (index > -1) {
        newData.splice(index, 1, {
          ...prevValue[index],
          clubRole: 'moderator',
        })
      }
      return newData
    })
  }

  useEffect(() => {
    if (members.length > total) {
      setTotal(members.length)
    }
  }, [members.length, total])

  useEffect(() => {
    setLastValue(membersLastValue)
  }, [membersLastValue])

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className={isMoreLoading ? global_styles['is-loading'] : undefined}>
          <div className={clsx('d-flex flex-flow-wrap justify-content-between gutter-1')}>
            {members.length
              ? members.map((member) => (
                  <div
                    key={member.id}
                    className={clsx('d-flex align-items-center gutter-03')}
                    style={{ width: 'calc(50% - 1rem)' }}
                  >
                    <UserInfo user={member}>
                      {getAvatar(member, 32)}
                      <div className='d-flex align-items-center gutter-03'>
                        {member.displayName}
                        <span className={global_styles.small}>(# {member.id})</span>
                      </div>
                    </UserInfo>
                    {member.clubRole === 'moderator' || member.clubRole === 'owner' ? (
                      <Tooltip title={member.clubRole}>
                        <Tag
                          color={member.clubRole === 'owner' ? '#fa541c' : '#096dd9'}
                          className={global_styles.capitalize}
                        >
                          {member.clubRole?.charAt(0).toUpperCase()}
                        </Tag>
                      </Tooltip>
                    ) : (
                      <MakeModeratorLink
                        clubId={id}
                        userId={member.id}
                        name={member.displayName}
                        onSuccess={onModeratorChanged}
                      >
                        <Button>+</Button>
                      </MakeModeratorLink>
                    )}
                  </div>
                ))
              : 'List of members is empty'}
          </div>
          {total !== totalCount && (
            <Button className={global_styles['mt-1']} onClick={onLoadMore}>
              Load more
            </Button>
          )}
        </div>
      )}
    </>
  )
}

Members.propTypes = {
  id: PropTypes.string.isRequired,
  totalCount: PropTypes.number.isRequired,
  clubRole: PropTypes.string,
}

export default Members
