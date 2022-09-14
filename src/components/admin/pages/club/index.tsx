import React from 'react'
import dynamic from 'next/dynamic'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import type { FC } from '@/model/commonModel'

type Props = {
  args: string[]
}
type DynamicComponentType = { clubId: string }

const Index: FC<Props> = ({ args }: Props) => {
  const clubId: string | undefined = args[0]

  let DynamicComponentWithNoSSR: React.ComponentType<DynamicComponentType>

  if (clubId && clubId !== '') {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/admin/pages/club/ClubEdit'), {
      ssr: false,
    })
  } else {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/admin/pages/club/Home'), {
      ssr: false,
    })
  }

  return (
    <>
      <div className={global_styles.block}>
        <DynamicComponentWithNoSSR clubId={clubId} />
      </div>
    </>
  )
}

Index.propTypes = {
  args: PropTypes.arrayOf(PropTypes.string),
}

export default Index
