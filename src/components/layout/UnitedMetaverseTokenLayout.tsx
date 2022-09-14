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
const UnitedMetaverseTokenLayout: FC<Props> = (props: Props) => {
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
        <link rel='icon' href='/favicon.svg' />
        <link rel='mask-icon' href='/mask-icon.svg' color='#000000' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <title>Connect club - A social network for genuine human connections</title>

        <meta property='og:image' content='/img/connect-club-main@1024.png' key={'ogimage'} />
        <meta property='og:image:type' content='image/png' key={'ogimagetype'} />
        <meta property='og:image:width' content='1028' key={'ogimagew'} />
        <meta property='og:image:height' content='235' key={'ogimageh'} />

        {/* Facebook Pixel verify */}
        {!isDevelopment && <meta name='facebook-domain-verification' content='8ur8ku5en4uleq5k0tubdmw1cew06u' />}
      </Head>
      <Analytics />

      {children}
    </div>
  )
}

UnitedMetaverseTokenLayout.propTypes = {
  children: PropTypes.element,
}

export default UnitedMetaverseTokenLayout
