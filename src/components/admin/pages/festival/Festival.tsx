import React from 'react'
import dynamic from 'next/dynamic'
import PropTypes from 'prop-types'

import global_styles from '@/components/admin/css/admin.module.css'
import { Loader } from '@/lib/svg'
import { FC } from '@/model/commonModel'

type Props = {
  args: string[]
}

type DynamicComponentType = {
  eventId: string
}
const Festival: FC<Props> = ({ args }: Props) => {
  const eventId: string | undefined = args[0]

  let DynamicComponentWithNoSSR

  if (eventId !== undefined) {
    DynamicComponentWithNoSSR = dynamic<DynamicComponentType>(
      () => import('@/components/admin/pages/festival/FestivalEvent'),
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
  } else {
    DynamicComponentWithNoSSR = dynamic(
      () => import('@/components/admin/pages/festival/FestivalEventList'),
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
  }

  return (
    <>
      <div className={global_styles.block}>
        <DynamicComponentWithNoSSR eventId={eventId} />
      </div>
    </>
  )
}

Festival.propTypes = {
  args: PropTypes.arrayOf(PropTypes.string),
}

export default Festival
