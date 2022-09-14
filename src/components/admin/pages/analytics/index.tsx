import React from 'react'
import dynamic from 'next/dynamic'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import type { FC } from '@/model/commonModel'

type Props = {
  args: string[]
}
type DynamicComponentType = { subpage: string }

const Index: FC<Props> = ({ args }: Props) => {
  const subpage: string | undefined = args[0]

  let DynamicComponentWithNoSSR: React.ComponentType<DynamicComponentType>

  if (subpage && subpage === 'campaign-report') {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
      () => import('@/components/admin/pages/analytics/CampaignReport'),
      { ssr: false },
    )
  } else if (subpage && subpage === 'inviters') {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
      () => import('@/components/admin/pages/analytics/Inviters'),
      { ssr: false },
    )
  } else if (subpage && subpage === 'weekly-report') {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
      () => import('@/components/admin/pages/analytics/WeeklyReport'),
      { ssr: false },
    )
  } else if (subpage && subpage === 'push-notifications') {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
      () => import('@/components/admin/pages/analytics/PushNotifications'),
      { ssr: false },
    )
  } else if (subpage && subpage === 'sharing') {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
      () => import('@/components/admin/pages/analytics/Sharing'),
      { ssr: false },
    )
  } else if (subpage && subpage === 'retention') {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
      () => import('@/components/admin/pages/analytics/Retention'),
      { ssr: false },
    )
  } else if (subpage && subpage === 'consolidate-report') {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
      () => import('@/components/admin/pages/analytics/ConsolidateReport'),
      { ssr: false },
    )
  } else {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/admin/pages/analytics/Home'), {
      ssr: false,
    })
  }

  return (
    <>
      <div className={global_styles.block}>
        <DynamicComponentWithNoSSR subpage={subpage} />
      </div>
    </>
  )
}

Index.propTypes = {
  args: PropTypes.arrayOf(PropTypes.string),
}

export default Index
