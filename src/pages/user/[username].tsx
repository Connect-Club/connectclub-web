import React, { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import QRCode from 'react-qr-code'
import amplitude from 'amplitude-js'
import clsx from 'clsx'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import PropTypes from 'prop-types'
import Cookies from 'universal-cookie'

import { getPublicUser } from '@/api/userApi'
import public_styles from '@/css/public.module.css'
import { getUrlWithSizes } from '@/lib/helpers'
import { Logo } from '@/lib/svg'
import { getHrefUTM, isDevelopment } from '@/lib/utils'
import { getMobileOS } from '@/lib/utils'
import { isMobileDevice } from '@/lib/utils'
import { FC } from '@/model/commonModel'
import { PublicUser } from '@/model/usersModel'

import styles from '../club/club_frontend.module.css'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { params, query } = ctx

  if (!params?.username || typeof params.username !== 'string') {
    console.log('User not found', params)
    return {
      notFound: true,
      revalidate: isDevelopment ? 5 : 10,
    }
  }

  const [user, errors] = await getPublicUser(params.username.toLowerCase())

  if (errors.length || !user) {
    console.log('User not found', params, user, errors)
    return {
      notFound: true,
      revalidate: isDevelopment ? 5 : 10,
    }
  }

  return {
    props: {
      user,
      isInvitePage: !!query?.invite,
      queryParams: query,
    },
  }
}

type Props = {
  user: PublicUser
  isInvitePage: boolean
  queryParams: Record<string, string>
}
const UserFrontend: FC<Props> = ({ user, isInvitePage, queryParams }) => {
  const amplitudeKey = isDevelopment ? '4b60a0a8667ea48921f95986cf1e2e55' : '9eaaf824819a859f6180b3125d8e876b'
  const amplitudeCookieName = `amp_cl_${amplitudeKey.substring(0, 6)}`

  const { t } = useTranslation('common')
  const router = useRouter()
  const initialAppUrl = `https://app.connect.club/W0Im/${isDevelopment ? '3d6351c7' : 'ecff227c'}?deep_link_value=${
    queryParams?.deep_link_value || `u_${user.username}`
  }`
  const initialQRAppUrl = `https://app.connect.club/W0Im/${isDevelopment ? '71bfff2b' : '2cada15'}?deep_link_value=${
    queryParams?.deep_link_value || `u_${user.username}`
  }`
  const [appUrl, setAppUrl] = useState(initialAppUrl)
  const [appUrlQR, setAppUrlQR] = useState(initialQRAppUrl)
  const [landingAmplitudeDeviceId, setLandingAmplitudeDeviceId] = useState<string | null>(null)
  const [amplitudeInst, setAmplitude] = useState<typeof amplitude | null>(null)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const cookies = useMemo(() => new Cookies(), [])

  const handleOnClickApp = () => {
    if (amplitudeInst) {
      amplitudeInst.getInstance().logEvent(
        'user_landing.open_app',
        Object.assign(
          {},
          {
            userId: user.id,
            username: user.username,
            isDesktop: !isMobile,
            platform: getMobileOS(),
          },
          getHrefUTM(),
        ),
      )
      cookies.set(amplitudeCookieName, 1, { path: '/' })
    }
  }

  useEffect(() => {
    const pathname = window.location.pathname
    let params: Record<string, string> = {}
    let searchParams = ''
    let appUrlParams = ''

    if (Object.keys(router.query).length && landingAmplitudeDeviceId !== null) {
      params = Object.keys(router.query).reduce((accum, curVal) => {
        if (
          !['username', 'landingAmplitudeDeviceId', 'shortlink', 'af_force_deeplink', 'pid', 'deep_link_sub1'].includes(
            curVal,
          )
        ) {
          accum[curVal] = router.query[curVal] as string
        }
        return accum
      }, params)

      const utmContent = !isMobile ? 'qr' : params['utm_content'] || ''
      const utmSource = params['utm_source'] || (document.referrer ? new URL(document.referrer).hostname : '')
      const utmCampaign = params['utm_campaign'] || `without_utm${utmSource ? `[${utmSource}]` : ``}`
      const deepLinkSub = `deep_link_sub1=${landingAmplitudeDeviceId}~${utmCampaign}~${utmContent}~${utmSource}${
        utmCampaign ? `&c=${utmCampaign}` : ''
      }`
      const deepLinkSubQR = `deep_link_sub1=${landingAmplitudeDeviceId}~${utmCampaign}[QR_user]~${utmContent}~${utmSource}${
        utmCampaign ? `&c=${utmCampaign}[QR_user]` : ''
      }`
      if (Object.keys(params).length) {
        searchParams = new URLSearchParams(params).toString()
        delete params['deep_link_value']
        appUrlParams = new URLSearchParams(params).toString()
      }
      setAppUrl((prev) => `${prev}&${deepLinkSub}${appUrlParams ? `&${appUrlParams}` : ''}`)
      setAppUrlQR((prev) => `${prev}&${deepLinkSubQR}${appUrlParams ? `&${appUrlParams}` : ''}`)
    }

    window.history.replaceState(
      window.history.state,
      document.title,
      pathname + (searchParams ? '?' + searchParams : ''),
    )
  }, [isMobile, landingAmplitudeDeviceId, router.pathname, router.query, user.id, user.username])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    if (router.isReady) {
      const amplitudeParams = Object.assign(
        {},
        {
          userId: user.id,
          username: user.username,
          isDesktop: !isMobile,
          platform: getMobileOS(),
        },
        getHrefUTM(router),
      )

      if (amplitudeInst) {
        amplitudeInst.getInstance().init(amplitudeKey, undefined, {
          saveEvents: true,
          includeReferrer: true,
        })

        setLandingAmplitudeDeviceId(amplitudeInst.getInstance().options.deviceId || '')
      }

      timeout = setTimeout(() => {
        amplitudeInst && amplitudeInst.getInstance().logEvent('user_landing.pageview_three_seconds', amplitudeParams)
      }, 3000)

      queueMicrotask(() => {
        amplitudeInst && amplitudeInst.getInstance().logEvent('user_landing.pageview', amplitudeParams)
      })
    }
    return () => {
      timeout && clearTimeout(timeout)
    }
  }, [amplitudeInst, amplitudeKey, isMobile, router, router.isReady, user.id, user.username])

  useEffect(() => {
    setIsMobile(isMobileDevice())
    import('amplitude-js').then((mod) => setAmplitude(mod.default))
  }, [])

  const title = `Connect club - ${user.displayName}`

  return (
    <div
      className={clsx(
        'container relative',
        !user.avatar ? styles.without_avatar : undefined,
        isInvitePage ? styles.invite_page : undefined,
      )}
    >
      <Head>
        <title>{title}</title>
        <meta name='description' content={`Connect club. ${user.about}`} />
        <meta property='og:title' content={`Connect club - ${user.displayName}`} />
        <meta property='og:description' content={`Connect club. ${user.about}`} />
        <meta
          property='og:url'
          content={`https://${isDevelopment ? 'stage.' : ''}connect.club/user/${user.username}`}
        />
        <meta
          property='og:image'
          content={`https://${isDevelopment ? 'stage.' : ''}connect.club/api/get/ogimage?username=${user.username}${
            isInvitePage ? `&invite=1` : ``
          }`}
          key={'ogimage'}
        />
        <meta property='og:image:type' content='image/png' key={'ogimagetype'} />
        <meta property='og:image:width' content='1200' key={'ogimagew'} />
        <meta property='og:image:height' content='630' key={'ogimageh'} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta
          name='twitter:image'
          content={`https://${isDevelopment ? 'stage.' : ''}connect.club/api/get/ogimage?username=${user.username}${
            isInvitePage ? `&invite=1` : ``
          }`}
        />
      </Head>
      {isMobile && (
        <a className={styles.app_link} onClick={handleOnClickApp} href={appUrl} title={'Open in the app...'}>
          Open in the app...
        </a>
      )}
      <div className={styles.header_logo}>
        <Link href='/'>
          <a title={'Connect club'}>
            <Logo color={['rgba(77, 125, 208, 0.08)', 'rgba(77, 125, 208, 0.08)']} width={73} id='header' />
          </a>
        </Link>
      </div>
      <div className={clsx(styles.club)}>
        {user.avatar && (
          <div className={styles.club__logo}>
            <Image
              src={getUrlWithSizes(user.avatar, 360, 360)}
              layout={'fill'}
              objectFit={'cover'}
              alt={user.displayName}
            />
          </div>
        )}
        {isInvitePage && <div className={styles.additional_info}>You have been invited by</div>}
        <h1 className={styles.club__h1}>{user.displayName}</h1>
        <div className={styles.club__count}>@ {user.username}</div>
        {user.about && (
          <ReactMarkdown
            linkTarget={'_blank'}
            className='line-break'
            components={{
              // eslint-disable-next-line @typescript-eslint/no-unused-vars,react/display-name
              a: ({ node, children, ...props }) => {
                const linkProps = props
                if (props.target === '_blank') {
                  linkProps['rel'] = 'noopener noreferrer'
                }
                return <a {...linkProps}>{children}</a>
              },
            }}
          >
            {user.about}
          </ReactMarkdown>
        )}
      </div>
      <div className={styles.apps_wrap}>
        <p>
          Don’t have a Connect.Club account?
          <br />
          Get the app to join the conversation!
        </p>
        {isMobile !== null && (
          <div className={clsx(styles.apps, 'd-flex align-items-baseline apps_block')}>
            {!isMobile ? (
              <QRCode value={appUrlQR} />
            ) : (
              <>
                <div className='app-store-icon'>
                  <a onClick={handleOnClickApp} rel='noreferrer' href={appUrl} title={t('app-store-alt')}>
                    <Image src='/img/svg/app-store.svg' width={168} height={56} alt={t('app-store-alt')} />
                  </a>
                </div>
                <a
                  onClick={handleOnClickApp}
                  rel='noreferrer'
                  href={appUrl}
                  className='google-play-icon'
                  title={t('google-play-alt')}
                >
                  <Image src='/img/svg/google-play.svg' width={189} height={56} alt={t('google-play-alt')} />
                </a>
              </>
            )}
          </div>
        )}
      </div>
      <style jsx global>
        {`
          .${public_styles.footer} {
            display: none;
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
          .slick-dotted.slick-slider {
            margin-bottom: 30px;
          }
          .slick-dots {
            position: absolute;
            bottom: -25px;
            display: block;
            width: 100%;
            padding: 0;
            margin: 0;
            list-style: none;
            text-align: center;
          }
          .slick-dots li {
            position: relative;
            display: inline-block;
            width: 20px;
            height: 20px;
            margin: 0 5px;
            padding: 0;
            cursor: pointer;
          }
          .slick-dots li button {
            font-size: 0;
            line-height: 0;
            display: block;
            width: 20px;
            height: 20px;
            padding: 5px;
            cursor: pointer;
            color: transparent;
            border: 0;
            outline: 0;
            background: 0 0;
          }
          .slick-dots li button:focus,
          .slick-dots li button:hover {
            outline: 0;
          }
          .slick-dots li button:focus:before,
          .slick-dots li button:hover:before {
            opacity: 1;
          }
          .slick-dots li button:before {
            font-family: slick;
            font-size: 6px;
            line-height: 20px;
            position: absolute;
            top: 0;
            left: 0;
            width: 20px;
            height: 20px;
            content: '•';
            text-align: center;
            opacity: 0.25;
            color: #000;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .slick-dots li.slick-active button:before {
            opacity: 0.75;
            color: #000;
          }
          @media (max-width: 1100px) {
            main .container {
              max-width: 100% !important;
              padding: 0 5rem;
            }
          }
        `}
      </style>
    </div>
  )
}

UserFrontend.propTypes = {
  user: PropTypes.object,
}

export default UserFrontend
