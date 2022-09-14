import React from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import Header from '@/components/room/Header'
import { Loader } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { CurrentUser } from '@/model/usersModel'

type Props = {
  user: CurrentUser
  isFrontend?: boolean
}

type DynamicComponentType = {
  args: string[]
  rootPage: string
  isFrontend?: boolean
}

const Home: FC<Props> = ({ user, isFrontend }) => {
  const router = useRouter()
  const { page } = router.query
  const args = page?.length && Array.isArray(page) ? page : []

  const DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
    () => import('@/components/admin/pages/rooms/Room'),
    // eslint-disable-next-line react/display-name
    {
      ssr: false,
      loading: () => (
        <div className='align-center'>
          <Loader />
        </div>
      ),
    },
  )

  return (
    <>
      <Header user={user} />
      <div className={global_styles.content}>
        <DynamicComponentWithNoSSR args={args} isFrontend={isFrontend} rootPage={'/room'} />
      </div>
    </>
  )
}

Home.propTypes = {
  user: PropTypes.object,
}

export default Home
