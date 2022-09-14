import React from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import Login from '@/components/admin/Login/Login'
import { FullLogo } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { CurrentUser } from '@/model/usersModel'

import 'antd/dist/antd.css'

type Props = {
  user: CurrentUser
  isLoggedIn: boolean
  AdminComponent: React.ComponentType<{
    user: CurrentUser
    isFrontend?: boolean
  }>
  isFrontend?: boolean
  error?: string
}
const ConnectClubAdmin: FC<Props> = ({ isLoggedIn, user, AdminComponent, isFrontend = false, error = '' }: Props) => {
  return (
    <div className={clsx(global_styles.adminPage, isFrontend ? 'is-frontend' : '')}>
      {isLoggedIn && !error ? (
        <AdminComponent user={user} isFrontend={isFrontend} />
      ) : (
        <>
          <div className={global_styles.logo}>
            <Link href='/'>
              <a title='Connect club' style={{ width: '170px' }}>
                <FullLogo id='header' />
              </a>
            </Link>
          </div>
          <Login />
          {error && <div className={global_styles.error_block}>{error}</div>}
        </>
      )}
    </div>
  )
}

ConnectClubAdmin.propTypes = {
  isLoggedIn: PropTypes.bool,
  user: PropTypes.object,
  AdminComponent: PropTypes.elementType,
  error: PropTypes.string,
}

export default ConnectClubAdmin
