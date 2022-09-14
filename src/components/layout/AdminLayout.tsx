import React, { ReactNode } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'

import { FC } from '@/model/commonModel'

type Props = {
  children: ReactNode
}
const AdminLayout: FC<Props> = ({ children }: Props) => {
  return (
    <div>
      <Head>
        <meta name='robots' content='noindex, nofollow' />
        <meta name='googlebot' content='noindex,nofollow' />
        <link rel='icon' href='/favicon.svg' />
        <link rel='mask-icon' href='/mask-icon.svg' color='#000000' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <title>Connect club</title>
      </Head>
      <main>{children}</main>
      <style global jsx>{`
        html {
          font-size: 100%;
        }
        body {
          font-size: 1rem;
        }
        html,
        body {
          width: 100%;
          height: 100%;
          min-height: 100%;
          background-color: #eef1f3;
        }
        ul,
        ol {
          font-size: inherit;
        }
        .ant-tooltip {
          max-width: 600px;
        }
      `}</style>
    </div>
  )
}

AdminLayout.propTypes = {
  children: PropTypes.element,
}

export default AdminLayout
