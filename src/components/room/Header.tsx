import React from 'react'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import HeaderMenu from '@/components/admin/common/HeaderMenu'
import global_styles from '@/components/admin/css/admin.module.css'
import { logout } from '@/lib/Api'
import { getAvatar, getFullName } from '@/lib/helpers'
import { ArrowDown, Logout } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import type { MenuType } from '@/model/menuModel'
import { CurrentUser } from '@/model/usersModel'

type Props = {
  user: CurrentUser
}

const Header: FC<Props> = ({ user }: Props) => {
  const router = useRouter()
  const menuPages: MenuType[] = [
    {
      name: 'Rooms',
      link: '/room',
    },
  ]

  const handleLogout = async () => {
    await logout(async () => {
      await router.push('/room')
    })
  }

  return (
    <div className={global_styles.header}>
      <div className={global_styles.header_menu}>
        <HeaderMenu pages={menuPages} defaultAddress='/room' />
        <div className={clsx(global_styles.header_menu__item, global_styles.header_profile)}>
          <div className={global_styles.header_menu__text_item}>
            {getAvatar(user, 32)}
            <ArrowDown width='10px' height='10px' color='#fff' />
            <div className={clsx(global_styles.header_menu__dropdown, global_styles.header_menu__dropdown_right)}>
              <div className={global_styles.header_menu__dropdown_item}>
                <div className={global_styles.header_menu__text_item}>
                  {getFullName(user)}
                  <div>@{user.username}</div>
                </div>
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

Header.propTypes = {
  user: PropTypes.object,
}

export default Header
