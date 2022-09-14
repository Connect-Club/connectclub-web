import React from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'

import LandMap from '@/components/Land'
import styles from '@/components/Land/land.module.css'
import LandLayout from '@/components/layout/LandLayout'
import { FullLogo } from '@/lib/svg'
import { isDevelopment } from '@/lib/utils'
import { FCWithLayout } from '@/model/commonModel'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {
      isDebug: parseInt(String(ctx.query.debug)) && isDevelopment,
    },
  }
}

type Props = {
  isDebug: boolean
}

const LandFrontend: FCWithLayout<Props> = ({ isDebug = false }) => {
  return (
    <div className={styles.map_container}>
      <header className={styles.header}>
        <Link href='/'>
          <a title='Connect club' style={{ width: '170px' }}>
            <FullLogo id='header' />
          </a>
        </Link>
        <div className={styles.pages}>
          <Link href='#'>
            <a title='Page 1'>Page 1</a>
          </Link>
          <Link href='#'>
            <a title='Page 2'>Page 2</a>
          </Link>
        </div>
      </header>
      <LandMap isDebug={isDebug} />
    </div>
  )
}

LandFrontend.getLayout = LandLayout

export default LandFrontend
