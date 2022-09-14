import React from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import HeaderMenu from '@/components/admin/common/HeaderMenu'
import global_styles from '@/components/admin/css/admin.module.css'
import popup from '@/components/admin/InfoPopup'
import InviteLink from '@/components/admin/pages/users/InviteLink'
import { logout } from '@/lib/Api'
import { getAvatar, getFullName } from '@/lib/helpers'
import { ArrowDown, Home, Logout } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { CurrentUser } from '@/model/usersModel'

type Props = {
  user: CurrentUser
}
type MenuBaseType = {
  name: string
  link: string
  disabled?: boolean
}
type MenuType = MenuBaseType & {
  subpages?: Array<MenuBaseType & { description: string }>
}

const AdminHeader: FC<Props> = ({ user }: Props) => {
  const router = useRouter()
  const menuPages: MenuType[] = [
    {
      name: 'Users',
      link: '/admin/users',
      // subpages: [
      //     { name: 'All users', link: '/admin/users', description: 'List of all users' },
      //     // {
      //     //     name: 'Invites',
      //     //     link: '/admin/users/invites',
      //     //     disabled: true,
      //     //     description: 'Creating, deleting and editing of invites'
      //     // },
      // ]
    },
    { name: 'Rooms', link: '/admin/rooms' },
    { name: 'Backgrounds', link: '/admin/backgrounds' },
    { name: 'Landing', link: '/admin/landing' },
    { name: 'Festival', link: '/admin/festival' },
    { name: 'Clubs', link: '/admin/club' },
    {
      name: 'Analytics',
      link: '/admin/analytics/campaign-report',
      subpages: [
        {
          name: 'Overview',
          link: '/admin/analytics',
          description: 'DAU, WAU, MAU',
        },
        {
          name: 'Campaign report',
          link: '/admin/analytics/campaign-report',
          description: 'Building of the campaign report',
        },
        // { name: 'Weekly report', link: '/admin/analytics/weekly-report', description: 'Weekly reports for the last 3 weeks' },
        {
          name: 'Consolidated report',
          link: '/admin/analytics/consolidate-report',
          description: 'Full application report',
        },
        {
          name: 'Sharing',
          link: '/admin/analytics/sharing',
          description: 'Room, event, club sharing analytics',
        },
        {
          name: 'Retention',
          link: '/admin/analytics/retention',
          description: 'Users retention, cohorts',
        },
        {
          name: 'Push notifications',
          link: '/admin/analytics/push-notifications',
          description: 'Sent, opened, failed, processed notifications',
        },
        {
          name: 'Top inviters',
          link: '/admin/analytics/inviters',
          description: 'Top inviters among users',
        },
      ],
    },
    { name: 'Land', link: '/admin/land' },
  ]

  const handleLogout = async () => {
    await logout(async () => {
      await router.push('/admin')
    })
  }

  const onCreateInvite = (id: string, phone: string) => {
    popup.success(`Invite was sent to phone "${phone}"`)
  }

  return (
    <div className={global_styles.header}>
      <div className={global_styles.header_menu}>
        <div className={global_styles.header_menu__item}>
          <Link href='/admin'>
            <a title='Home page'>
              <Home color='#fff' />
            </a>
          </Link>
        </div>
        <HeaderMenu pages={menuPages} defaultAddress='/admin' />
        <div className={clsx(global_styles.header_menu__item, global_styles.header_profile)}>
          <div className={global_styles.header_menu__text_item}>
            {getAvatar(user, 32)}
            <ArrowDown width='10px' height='10px' color='#fff' />
            <div className={clsx(global_styles.header_menu__dropdown, global_styles.header_menu__dropdown_right)}>
              <div className={global_styles.header_menu__dropdown_item}>
                <div className={global_styles.header_menu__text_item}>
                  {getFullName(user)}
                  <div>ID: {user.id}</div>
                </div>
              </div>
              <div className={clsx(global_styles.header_menu__dropdown_item)}>
                <InviteLink onSuccess={onCreateInvite} />
              </div>
              <div className={clsx(global_styles.header_menu__dropdown_item)}>
                <Link href={`/admin/users?id=${user.id}`}>
                  <a title='Profile'>Profile</a>
                </Link>
              </div>
              <div
                className={clsx(global_styles.header_menu__dropdown_item, global_styles.header_menu__profile_logout)}
              >
                <a title='Logout' onClick={handleLogout}>
                  Logout <Logout height='12px' />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

AdminHeader.propTypes = {
  user: PropTypes.object,
}

export default AdminHeader
