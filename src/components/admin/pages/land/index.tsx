import React from 'react'
import dynamic from 'next/dynamic'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import type { FC } from '@/model/commonModel'

type Props = {
  args: string[]
}
type DynamicComponentType = { landId: string }

const Index: FC<Props> = ({ args }: Props) => {
  const landId: string | undefined = args[0]

  let DynamicComponentWithNoSSR: React.ComponentType<DynamicComponentType>

  if (landId && landId !== '') {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/admin/pages/land/LandEdit'), {
      ssr: false,
    })
  } else {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/admin/pages/land/Home'), {
      ssr: false,
    })
  }

  return (
    <>
      <div className={global_styles.block}>
        <DynamicComponentWithNoSSR landId={landId} />
      </div>
    </>
  )
}

Index.propTypes = {
  args: PropTypes.arrayOf(PropTypes.string),
}

export default Index
