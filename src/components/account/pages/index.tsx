import React from 'react'
import clsx from 'clsx'
import Link from 'next/link'

import global_styles from '@/components/admin/css/admin.module.css'
import { FC } from '@/model/commonModel'
import { CurrentUser } from '@/model/usersModel'

type Props = {
  user: CurrentUser
}

const AccountDashboard: FC<Props> = ({ user }) => {
  return (
    <>
      <div className={clsx(global_styles.block)}>
        <p className={'align-center'}>Hi, {user.name || user.username}! 👋</p>
        <p className={'align-center'}>Welcome to your personal account in Connect club!</p>
        <p className={'align-center'}>What can you do here?</p>
        <div className={'d-flex flex-flow-wrap justify-content-center'}>
          <div className={global_styles.widget}>
            <Link href={'/account/rooms'}>
              <a title={'Manage your rooms'}>Manage your rooms</a>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default AccountDashboard
