import React, { ReactNode } from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'

import Analytics from '@/components/Analytics'
import Header from '@/components/festival/Header'
import Footer from '@/components/Footer'
import { isDevelopment } from '@/lib/utils'
import type { FC } from '@/model/commonModel'
import { FestivalLayoutProps } from '@/model/festivalModel'

type Props = FestivalLayoutProps & {
  children?: ReactNode
}
const FestivalLayout: FC<Props> = (props: Props) => {
  const {
    showEventsInHeader = false,
    hideTimeline = false,
    linkInHeader = {},
    hideHeader = false,
    footerLogoColor = '',
    children,
  } = props

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
        <meta property='og:image' content='/img/festival/landing/connectcon-main-logo@1024.png' key={'ogimage'} />
        <meta property='og:image:type' content='image/png' key={'ogimagetype'} />
        <meta property='og:image:width' content='1181' key={'ogimagew'} />
        <meta property='og:image:height' content='271' key={'ogimageh'} />

        {/* Facebook Pixel verify */}
        {!isDevelopment && <meta name='facebook-domain-verification' content='8ur8ku5en4uleq5k0tubdmw1cew06u' />}
      </Head>

      <Analytics />

      {!hideHeader && (
        <Header showEventsInHeader={showEventsInHeader} hideTimeline={hideTimeline} linkInHeader={linkInHeader} />
      )}
      <main>{children}</main>
      <Footer footerLogoColor={footerLogoColor} />
      <style global jsx>{`
        :root {
          --link-color: rgba(165, 249, 129, 1);
          --link-color-hover: rgba(165, 249, 129, 0.8);
          --hamburger-width: 12px;
          --hamburger-height: 2px;
          --hamburger-spacing: 3px;
          --special-color-1: rgba(255, 104, 171, 1);
          --special-color-2: rgba(165, 249, 129, 1);
          --special-color-3: rgba(102, 177, 246, 1);
        }
        body {
          background: #000;
          color: #000;
        }
        main {
          background: #fff;
          padding-top: 25rem !important;
        }
        .header {
          background: #000;
          padding: 0 1rem;
        }
        .header .logo {
          width: 135px;
        }
        .header__container {
          justify-content: center;
          padding: 2.5rem 1.2rem;
          transition: padding 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        }
        .hamburger {
          padding: 0 12px 0 0;
        }

        .header nav {
          background: #000;
          position: fixed;
          width: 100%;
          height: 67%;
          left: -100%;
          z-index: 3;
          transition: left 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
          top: 0;
          justify-content: center;
          align-items: center;
          display: flex !important;
        }
        .header nav ul {
          flex-direction: column;
          padding: 5rem 2.4rem 0;
          width: 100%;
          text-align: center;
        }
        .header nav ul a {
          font-size: 3.2rem;
          padding: 1.75rem 2rem;
          display: block;
        }
        .header nav ul li {
          margin: 0;
          border-bottom: none;
        }

        .header li.selected a {
          color: var(--link-color);
          background: url(/img/festival/selected-menu-item.png) center center no-repeat;
          background-size: 327px;
        }
        .header__menu_opened {
          overflow: visible;
          --hamburger-color: #000;
          --hamburger-hover-color: #000;
          --hamburger-width: 18px;
        }
        .header__menu_opened .header nav {
          left: 0;
        }
        .header__menu_opened .logo {
          visibility: hidden;
        }
        .header__menu_opened .hamburger {
          padding: 0;
        }
        .header__menu_toggle {
          position: absolute;
          left: 0;
        }
        .header__menu_opened .header__menu_toggle {
          width: 4rem;
          height: 4rem;
          background: #a5f981;
          border-radius: 50%;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          left: calc(50% - 2rem);
        }
        .header {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 5;
          max-width: 100%;
          width: 100%;
          transition: position 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        }
        .sticky-header .header__container {
          padding: 0.9rem 1.2rem;
        }

        .slick-list,
        .slick-slider,
        .slick-track {
          position: relative;
          display: block;
        }
        .slick-loading .slick-slide,
        .slick-loading .slick-track {
          visibility: hidden;
        }
        .slick-slider {
          box-sizing: border-box;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
          -khtml-user-select: none;
          -ms-touch-action: pan-y;
          touch-action: pan-y;
          -webkit-tap-highlight-color: transparent;
        }
        .slick-list {
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
        .slick-list:focus {
          outline: 0;
        }
        .slick-list.dragging {
          cursor: pointer;
          cursor: hand;
        }
        .slick-slider .slick-list,
        .slick-slider .slick-track {
          -webkit-transform: translate3d(0, 0, 0);
          -moz-transform: translate3d(0, 0, 0);
          -ms-transform: translate3d(0, 0, 0);
          -o-transform: translate3d(0, 0, 0);
          transform: translate3d(0, 0, 0);
        }
        .slick-track {
          top: 0;
          left: 0;
        }
        .slick-track:after,
        .slick-track:before {
          display: table;
          content: '';
        }
        .slick-track:after {
          clear: both;
        }
        .slick-slide {
          display: none;
          float: left;
          height: 100%;
          min-height: 1px;
        }
        .slick-slide img {
          display: block;
        }
        .slick-slide.slick-loading img {
          display: none;
        }
        .slick-slide.dragging img {
          pointer-events: none;
        }
        .slick-initialized .slick-slide {
          display: block;
        }
        .slick-vertical .slick-slide {
          display: block;
          height: auto;
          border: 1px solid transparent;
        }

        .footer__social_icons svg {
          fill: rgba(0, 0, 0, 0.32);
        }
        @media (max-width: 980px) {
          .header,
          .container:not(.header__container) {
            padding: 0;
          }
          .header nav {
            background: #000;
            height: 100%;
          }
          .header nav ul {
            flex-direction: column;
            padding: 5rem 2.4rem 0;
            width: 100%;
            text-align: center;
          }
          .header nav ul a {
            font-size: 3.2rem;
            padding: 1.75rem 2rem;
          }
          .header nav ul li {
            border-bottom: none;
          }

          .sticky-header .header {
            background: #000;
            padding: 0;
          }
          .header__menu_opened {
            overflow: hidden;
          }
        }
        @media screen and (max-height: 480px) {
          .header nav ul a {
            font-size: 2.5rem;
            padding: 0.3rem 2rem;
          }
        }
      `}</style>
    </div>
  )
}

FestivalLayout.propTypes = {
  children: PropTypes.element,
}

export default FestivalLayout
