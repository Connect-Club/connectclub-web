import React from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import HeaderMenu from '@/components/admin/common/HeaderMenu'
import global_styles from '@/components/admin/css/admin.module.css'
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

const AccountHeader: FC<Props> = ({ user }: Props) => {
  const router = useRouter()
  const menuPages: MenuType[] = [{ name: 'Rooms', link: '/account/rooms' }]

  const handleLogout = async () => {
    await logout(async () => {
      await router.push('/account')
    })
  }

  return (
    <div className={global_styles.header}>
      <div className={global_styles.header_menu}>
        <div className={global_styles.header_menu__item}>
          <Link href='/account'>
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
                <div className={global_styles.header_menu__text_item}>{getFullName(user)}</div>
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

AccountHeader.propTypes = {
  user: PropTypes.object,
}

export default AccountHeader
