import React, { ReactNode } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'

import Analytics from '@/components/Analytics'
import FooterPublic from '@/components/FooterPublic'
import { isDevelopment } from '@/lib/utils'
import { FC } from '@/model/commonModel'

type Props = {
  children: ReactNode
}
const PublicLayout: FC<Props> = ({ children }: Props) => {
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
      <main>{children}</main>
      <FooterPublic />
      <style global jsx>{`
        @font-face {
          font-family: 'Proxima Nova';
          src: url('/font/ProximaNova-Regular.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Proxima Nova';
          font-weight: bold;
          src: url('/font/ProximaNova-Bold.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Proxima Nova';
          font-weight: 900;
          src: url('/font/ProximaNova-Black.woff2') format('woff2');
        }
        :root {
          --link-color: #74a3f5;
          --link-color-hover: #0a0528;
          --first-black: rgba(10, 5, 40, 1);
          --second-black: rgba(10, 5, 40, 0.8);
          --third-black: rgba(10, 5, 40, 0.6);
        }
        body {
          background: #f9f9f9;
          font-family: 'Proxima Nova', 'Helvetica', serif;
        }
        p {
          color: var(--second-black);
        }
        .container {
          max-width: 1000px;
          padding: 0;
        }
        h1 {
          font-weight: 900;
        }
        header.header {
          margin-bottom: 6rem;
        }
        ul,
        ol {
          font-size: 1.6rem;
        }

        @media (max-width: 1100px) {
          main .container {
            max-width: 57rem;
          }
        }
        @media (max-width: 768px) {
          main .container {
            max-width: 33.5rem;
          }
        }
        @media (max-width: 375px) {
          main .container {
            max-width: 33.5rem;
            padding: 0 2rem;
          }
        }
      `}</style>
    </div>
  )
}

PublicLayout.propTypes = {
  children: PropTypes.element,
}

export default PublicLayout
