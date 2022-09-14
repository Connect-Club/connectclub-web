import React, { ReactNode } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'

import Analytics from '@/components/Analytics'
import { isDevelopment } from '@/lib/utils'
import type { FC } from '@/model/commonModel'
import { FestivalLayoutProps } from '@/model/festivalModel'

type Props = FestivalLayoutProps & {
  children?: ReactNode
}
const LandingLayout: FC<Props> = (props: Props) => {
  const { children } = props

  return (
    <div>
      <Head>
        {parseInt(process.env.NEXT_PUBLIC_ROBOTS_NO_INDEX!) > 0 && (
          <>
            <meta name='robots' content='noindex, nofollow' />
            <meta name='googlebot' content='noindex,nofollow' />
          </>
        )}
        <link rel='apple-touch-icon' sizes='180x180' href='/img/festival/apple-touch-icon.png' />
        <link rel='icon' href='/img/festival/connectcon_favicon.svg' />
        <link rel='manifest' href='/img/festival/site.webmanifest' />
        {/*<link rel="mask-icon" href="/img/festival/safari-pinned-tab.svg" color="#5bbad5" />*/}
        <link rel='shortcut icon' href='/img/festival/favicon.ico' />
        <meta name='msapplication-TileColor' content='#da532c' />
        <meta name='msapplication-config' content='/img/festival/browserconfig.xml' />
        <meta name='theme-color' content='#0a0528' />
        <title>Connect club</title>
        <meta property='og:image' content='/img/festival/landing/connectcon-main-logo@1024.png' />
        <meta property='og:image:type' content='image/png' />
        <meta property='og:image:width' content='1181' />
        <meta property='og:image:height' content='271' />

        {/* Facebook Pixel verify */}
        {!isDevelopment && <meta name='facebook-domain-verification' content='8ur8ku5en4uleq5k0tubdmw1cew06u' />}
      </Head>

      <Analytics />

      {children}
    </div>
  )
}

LandingLayout.propTypes = {
  children: PropTypes.element,
}

export default LandingLayout
