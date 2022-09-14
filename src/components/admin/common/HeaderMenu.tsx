import React from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { ArrowDown } from '@/lib/svg'
import type { FC } from '@/model/commonModel'
import { MenuType } from '@/model/menuModel'

type Props = {
  pages: MenuType[]
  defaultAddress: string
}
const HeaderMenu: FC<Props> = ({ pages, defaultAddress }) => {
  const router = useRouter()
  return (
    <>
      {pages.map((page) => (
        <div
          className={clsx(
            global_styles.header_menu__item,
            page.disabled ? global_styles.disabled_page : '',
            router.asPath.indexOf(page.link) !== -1 ? 'selected' : null,
          )}
          key={page.link}
        >
          <Link href={page.disabled ? defaultAddress : page.link}>
            <a title={page.name} className={page.subpages?.length ? global_styles.has_subpages : undefined}>
              {page.name}
              {page.subpages?.length ? (
                <ArrowDown width='10px' height='10px' color={page.disabled ? '#bbb' : '#fff'} />
              ) : (
                ''
              )}
            </a>
          </Link>
          {page.subpages?.length ? (
            <div className={global_styles.header_menu__dropdown}>
              {page.subpages.map((subpage) => (
                <div
                  className={clsx(
                    global_styles.header_menu__dropdown_item,
                    subpage.disabled ? global_styles.disabled_page : '',
                    router.asPath === subpage.link ? 'selected' : null,
                  )}
                  key={`s${subpage.link}`}
                >
                  <Link href={subpage.disabled || page.disabled ? defaultAddress : subpage.link}>
                    <a title={subpage.name}>
                      <span className={global_styles.header_menu__dropdown_name}>{subpage.name}</span>
                      <div className={global_styles.header_menu__dropdown_description}>{subpage.description}</div>
                    </a>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            ''
          )}
        </div>
      ))}
    </>
  )
}

HeaderMenu.propTypes = {
  pages: PropTypes.array,
  defaultAddress: PropTypes.string,
}

export default HeaderMenu
