/**
 * This is layout inside admin page. From here all pages will be loaded from client.
 *
 * Why? For admin pages I decided to create one entry point, where token and accesses will be controlled.
 * Here we dynamically load pages, depends on route.
 * E.g, route "/admin/some/new/page" will be divided into module "some" and props ['new', 'page'];
 * All pages (modules) located here @/components/admin/pages
 *
 * Don't forget to specify module path in switch construction below and in availableModules
 * */

import React from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import AdminHeader from '@/components/admin/AdminHeader'
import global_styles from '@/components/admin/css/admin.module.css'
import { Loader } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { CurrentUser } from '@/model/usersModel'

type Props = {
  user: CurrentUser
}
type DynamicComponentType = { args: string[] }

const AdminPage: FC<Props> = ({ user }: Props) => {
  const router = useRouter()
  const { page } = router.query

  let DynamicComponentWithNoSSR: React.ComponentType<DynamicComponentType> = () => (
    <div className='align-center'>
      <Loader />
    </div>
  )

  let args: string[] = []
  let module = ''

  /* Load internal pages */
  if (page?.length) {
    ;[module, ...args] = page as string[]
  }

  switch (module) {
    case 'festival':
      DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
        () => import('@/components/admin/pages/festival/Festival'),
        { ssr: false },
      )
      break
    case 'users':
      DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/admin/pages/users/Users'), {
        ssr: false,
      })
      break
    case 'rooms':
      DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/admin/pages/rooms/Room'), {
        ssr: false,
      })
      break
    case 'backgrounds':
      DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
        () => import('@/components/admin/pages/backgrounds/Backgrounds'),
        { ssr: false },
      )
      break
    case 'landing':
      DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
        () => import('@/components/admin/pages/landing/index'),
        { ssr: false },
      )
      break
    case 'club':
      DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/admin/pages/club/index'), {
        ssr: false,
      })
      break
    case 'analytics':
      DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
        () => import('@/components/admin/pages/analytics/index'),
        { ssr: false },
      )
      break
    case 'land':
      DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/admin/pages/land/index'), {
        ssr: false,
      })
      break
    case '':
      DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/admin/pages/index'), {
        ssr: false,
      })
      break
  }

  return (
    <>
      <AdminHeader user={user} />
      <div className={global_styles.content}>
        <DynamicComponentWithNoSSR args={args} />
      </div>
    </>
  )
}

AdminPage.propTypes = {
  user: PropTypes.object,
}

export default AdminPage
