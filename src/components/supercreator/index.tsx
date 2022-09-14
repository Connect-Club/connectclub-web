import React from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import Header from '@/components/supercreator/Header'
import { FC } from '@/model/commonModel'
import { CurrentUser } from '@/model/usersModel'

type Props = {
  user: CurrentUser
}
type DynamicComponentType = { args: string[]; user: CurrentUser }

const Home: FC<Props> = ({ user }: Props) => {
  const router = useRouter()
  const { page } = router.query

  let DynamicComponentWithNoSSR: React.ComponentType<DynamicComponentType>

  let args: string[] = []
  let module = ''

  /* Load internal pages */
  if (page?.length) {
    ;[module, ...args] = page as string[]
  }

  if (module === 'statistics' && args.length) {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
      () => import('@/components/supercreator/SubscriptionStatistics'),
      { ssr: false },
    )
  } else if (module !== '') {
    args = [module]
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/supercreator/Subscription'), {
      ssr: false,
    })
  } else {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/supercreator/Home'), {
      ssr: false,
    })
  }

  return (
    <>
      <Header user={user} />
      <div className={global_styles.content}>
        <DynamicComponentWithNoSSR args={args} user={user} />
      </div>
    </>
  )
}

Home.propTypes = {
  user: PropTypes.object,
}

export default Home
