import React from 'react'
import dynamic from 'next/dynamic'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import type { FC } from '@/model/commonModel'

type Props = {
  args: string[]
}
type DynamicComponentType = { landingId: string }

const Home: FC<Props> = ({ args }: Props) => {
  const landingId: string | undefined = args[0]

  let DynamicComponentWithNoSSR: React.ComponentType<DynamicComponentType>

  if (landingId && landingId !== '') {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
      () => import('@/components/admin/pages/landing/LandingEdit'),
      { ssr: false },
    )
  } else {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(() => import('@/components/admin/pages/landing/Home'), {
      ssr: false,
    })
  }

  return (
    <>
      <div className={global_styles.block}>
        <DynamicComponentWithNoSSR landingId={landingId} />
      </div>
    </>
  )
}

Home.propTypes = {
  args: PropTypes.arrayOf(PropTypes.string),
}

export default Home
