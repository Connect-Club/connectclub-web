import React, { ReactNode } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'

import Analytics from '@/components/Analytics'
import { isDevelopment } from '@/lib/utils'
import type { FC } from '@/model/commonModel'

type Props = {
  children?: ReactNode
}
const LandLayout: FC<Props> = (props: Props) => {
  const { children } = props

  return (
    <div>
      <Head>
        {/*{parseInt(process.env.NEXT_PUBLIC_ROBOTS_NO_INDEX!) > 0 && (*/}
        {/*  <>*/}
        {/*    <meta name='robots' content='noindex, nofollow' />*/}
        {/*    <meta name='googlebot' content='noindex,nofollow' />*/}
        {/*  </>*/}
        {/*)}*/}
        <meta name='robots' content='noindex, nofollow' />
        <meta name='googlebot' content='noindex,nofollow' />
        <link rel='icon' href='/favicon.svg' />
        <link rel='mask-icon' href='/mask-icon.svg' color='#000000' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />

        <title>Connect.Club land</title>
        <meta name='description' content={'Connect.Club land'} />
        <meta property='og:title' content='Connect.Club land' />
        <meta property='og:description' content={'Connect.Club land'} />
        <meta property='og:url' content={`https://${isDevelopment ? 'stage.' : ''}connect.club/land`} />
        {/*<meta*/}
        {/*  property='og:image'*/}
        {/*  content={`https://${*/}
        {/*    isDevelopment ? 'stage.' : ''*/}
        {/*  }connect.club/api/get/ogimage?dao=1`}*/}
        {/*  key={'ogimage'}*/}
        {/*/>*/}
        {/*<meta*/}
        {/*  name='twitter:image'*/}
        {/*  content={`https://${*/}
        {/*    isDevelopment ? 'stage.' : ''*/}
        {/*  }connect.club/api/get/ogimage?dao=1`}*/}
        {/*/>*/}
        <meta property='og:image:type' content='image/png' key={'ogimagetype'} />
        <meta property='og:image:width' content='1200' key={'ogimagew'} />
        <meta property='og:image:height' content='630' key={'ogimageh'} />
        <meta name='twitter:card' content='summary_large_image' />

        {/* Facebook Pixel verify */}
        {!isDevelopment && <meta name='facebook-domain-verification' content='8ur8ku5en4uleq5k0tubdmw1cew06u' />}
      </Head>
      <Analytics />

      {children}
    </div>
  )
}

LandLayout.propTypes = {
  children: PropTypes.element,
}

export default LandLayout
