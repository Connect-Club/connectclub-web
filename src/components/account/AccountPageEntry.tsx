import React from 'react'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

import AccountHeader from '@/components/account/AccountHeader'
import styles from '@/components/admin/css/account.module.css'
import global_styles from '@/components/admin/css/admin.module.css'
import { Loader } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { CurrentUser } from '@/model/usersModel'

type Props = {
  user: CurrentUser
}
type DynamicComponentType = { args: string[]; user: CurrentUser }

const AccountPageEntry: FC<Props> = ({ user }: Props) => {
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
    case 'rooms':
      DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/account/pages/rooms'), {
        ssr: false,
      })
      break
    case '':
      DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/account/pages/index'), {
        ssr: false,
      })
      break
  }

  return (
    <>
      <AccountHeader user={user} />
      <div className={clsx(global_styles.content, styles.account_page)}>
        <DynamicComponentWithNoSSR args={args} user={user} />
      </div>
    </>
  )
}

AccountPageEntry.propTypes = {
  user: PropTypes.object,
}

export default AccountPageEntry
