import React from 'react'
import { Tag, Tooltip } from 'antd'
import Image from 'next/image'
import Link from 'next/link'
import PropTypes from 'prop-types'

import { getUrlWithSizes } from '@/lib/helpers'
import { Club } from '@/model/clubModel'
import { FC } from '@/model/commonModel'

type Props = {
  userClubs: Array<{
    id: Club['id']
    avatar: Club['avatar']
    title: Club['title']
  }>
  color: string
  children: React.ReactNode
}

const UserClubs: FC<Props> = ({ userClubs, color, children }) => {
  const TooltipTitle = () => (
    <div className={'d-flex gutter-03 align-items-center flex-flow-wrap'}>
      {userClubs.map((club) => {
        const clubTitle = club.title || 'No name'
        return (
          <Tooltip
            title={
              <Link href={`/admin/club/${club.id}`}>
                <a title={'Go to club page'}>{clubTitle}</a>
              </Link>
            }
            key={club.id}
          >
            {club.avatar ? (
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
            ) : (
              clubTitle
            )}
          </Tooltip>
        )
      })}
    </div>
  )

  return (
    <>
      {userClubs.length && (
        <Tooltip title={<TooltipTitle />}>
          <Tag color={color} style={{ margin: '0 5px' }}>
            {children}
          </Tag>
        </Tooltip>
      )}
    </>
  )
}

UserClubs.propTypes = {
  userClubs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      title: PropTypes.string,
    }),
  ).isRequired,
  color: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default UserClubs
