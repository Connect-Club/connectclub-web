import React from 'react'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import EditUserInfo from '@/components/admin/pages/users/EditUserInfo'
import UserClubs from '@/components/admin/pages/users/UserClubs'
import styles from '@/components/admin/pages/users/users.module.css'
import { getAvatar } from '@/lib/helpers'
import { FC } from '@/model/commonModel'
import { ShortUserInfo, User } from '@/model/usersModel'

type Props = {
  user: User | ShortUserInfo
  showUserId?: boolean
  rowId?: string // ID of user row,
  updateUserById?: (userId: string | string[]) => void
}
const UserNameBlock: FC<Props> = ({ user, updateUserById, rowId = '0', showUserId = false }) => {
  const UserAdditionalInfo = () => <div>Source: {user.source}</div>

  return (
    <>
      {getAvatar(user, 32)}
      <div>
        <div className='d-flex align-items-center gutter-03'>
          {user.country && (
            <Tooltip title={user.city}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.flag}
                src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/${user.country.toLowerCase()}.svg`}
                alt={`[${user.country}]`}
              />
            </Tooltip>
          )}
          {updateUserById ? (
            <>
              <EditUserInfo user={user} rowId={rowId} onSuccess={updateUserById}>
                {user.name || '<No name>'}
              </EditUserInfo>{' '}
            </>
          ) : (
            user.name || '<No name>'
          )}
          <span className={global_styles.small}>(# {showUserId ? user.id : user?.username || user.id})</span>
        </div>
        {user.surname && <div className={global_styles.hint}>{user.surname}</div>}
      </div>
      {user.memberOf && user.memberOf.length > 0 && (
        <UserClubs userClubs={user.memberOf} color={'#d46b08'}>
          C
        </UserClubs>
      )}
      {user.source && (
        <Tooltip title={<UserAdditionalInfo />}>
          <InfoCircleOutlined color={'#434343'} />
        </Tooltip>
      )}
    </>
  )
}

UserNameBlock.propTypes = {
  user: PropTypes.object.isRequired,
  showUserId: PropTypes.bool,
  rowId: PropTypes.string,
  updateUserById: PropTypes.func,
}

export default UserNameBlock
