import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'react-qr-code'
import amplitude from 'amplitude-js'
import clsx from 'clsx'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import platform from 'platform-detect'

import { getEvent } from '@/api/eventApi'
import { useFrontendUser } from '@/api/userApi'
import WalletAuth from '@/components/auth/components/WalletAuth'
import public_styles from '@/css/public.module.css'
import { logout } from '@/lib/Api'
import { Loader, Logo } from '@/lib/svg'
import { useStore } from '@/lib/useStore'
import { getHrefUTM, isDevelopment } from '@/lib/utils'
import { getMobileOS } from '@/lib/utils'
import { isMobileDevice } from '@/lib/utils'
import { FC, GetTokenType } from '@/model/commonModel'
import { WebRoomParams } from '@/model/roomModel'

import styles from '../club/club_frontend.module.css'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { query } = ctx
  const roomParams = {
    eventId: '',
    isEvent: false,
    enabled: true,
    expired: false,
  } as WebRoomParams

  // Get information about event
  if (query.deep_link_value && !Array.isArray(query.deep_link_value)) {
    const dp = query.deep_link_value.split('_')
    if (dp.includes('eventId')) {
      roomParams['enabled'] = false
      roomParams['expired'] = true
      roomParams['isEvent'] = true
      const eventId = dp[dp.indexOf('eventId') + 1].split('~')[0]
      const response = await getEvent(eventId)
      if (response.data && !response._cc_errors.length && response.data.response) {
        roomParams['eventId'] = eventId
        const event = response.data.response
        roomParams['enabled'] = event.state === 'join' && !!event.roomId && !!event.roomPass
        roomParams['expired'] = event.state === 'expired'
        if (roomParams['enabled']) {
          roomParams['roomId'] = event.roomId
          roomParams['pswd'] = event.roomPass

          const deepLink = `deep_link_value=${query.deep_link_value}_roomId_${roomParams.roomId}_pswd_${roomParams.pswd}`

          return {
            redirect: {
              permanent: false,
              destination: `https://web.${isDevelopment ? 'stage.' : ''}connect.club/?${deepLink}`,
            },
            props: {},
          }
        }
      }
    } else if (dp.includes('roomId') && dp.includes('pswd')) {
      return {
        redirect: {
          permanent: false,
          destination: `https://web.${isDevelopment ? 'stage.' : ''}connect.club/?${new URLSearchParams(
            // @ts-ignore
            query,
          ).toString()}`,
        },
        props: {},
      }
    }
  }
  return {
    props: {
      roomParams,
      deepLinkValue: query.deep_link_value || 'v=1',
    },
  }
}

type Props = {
  roomParams: WebRoomParams
  deepLinkValue: string
}
const WebFrontend: FC<Props> = ({ roomParams, deepLinkValue }) => {
  const amplitudeKey = isDevelopment ? '4b60a0a8667ea48921f95986cf1e2e55' : '9eaaf824819a859f6180b3125d8e876b'

  const router = useRouter()
  const deepLink = `deep_link_value=${deepLinkValue}${
    roomParams.isEvent && roomParams.enabled ? `_roomId_${roomParams.roomId}_pswd_${roomParams.pswd}` : ``
  }`
  const initialAppUrl = `https://app.connect.club/W0Im/${isDevelopment ? '3d6351c7' : 'ecff227c'}`
  const initialQRAppUrl = `https://app.connect.club/W0Im/${isDevelopment ? '71bfff2b' : '2cada15'}`
  const initialWebUrl = `https://web.${isDevelopment ? 'stage.' : ''}connect.club/`
  const [appUrl, setAppUrl] = useState(initialAppUrl)
  const [appUrlQR, setAppUrlQR] = useState(initialQRAppUrl)
  const [webUrl, setWebUrl] = useState(initialWebUrl)
  const [deepLinkUrl, setDeepLinkUrl] = useState(deepLink)
  const [landingAmplitudeDeviceId, setLandingAmplitudeDeviceId] = useState<string | null>(null)
  const [amplitudeInst, setAmplitude] = useState<typeof amplitude | null>(null)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [isChrome, setIsChrome] = useState<boolean | null>(null)

  const { t } = useTranslation('common')

  const [user, isUserLoading] = useFrontendUser()
  const setToken = useStore((state) => state.setToken)
  const clearToken = useStore((state) => state.clearToken)

  const handleOnClickApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (amplitudeInst) {
      amplitudeInst.getInstance().logEvent(
        'web_mediator.open_app',
        Object.assign(
          {},
          {
            isDesktop: !isMobile,
            platform: getMobileOS(),
          },
          getHrefUTM(),
        ),
      )
    }
    queueMicrotask(() => {
      location.href = appUrl
    })
  }

  const UserBlock = () => {
    const [isLoading, setIsLoading] = useState(false)
    const onUserDisconnect = async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()

      if (!isLoading) {
        setIsLoading(true)
        await logout()
        setIsLoading(false)

        clearToken()
      }
    }

    if (!user) {
      return null
    }

    return (
      <p className={'align-center'}>
        You are connected as <b>@{user.username}</b>.{` `}
        <a href='#' onClick={onUserDisconnect} title={'Disconnect'}>
          Disconnect?
          {isLoading && <Loader width={'16px'} height={'16px'} />}
        </a>
      </p>
    )
  }

  const Button = () => {
    const [checkEventAvailability, setCheckEventAvailability] = useState(!(!roomParams.isEvent || roomParams.enabled))
    const [isEnabled, setIsEnabled] = useState(roomParams.enabled)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const handleOnClickWeb = (e?: React.MouseEvent<HTMLAnchorElement>) => {
      e?.preventDefault()
      if (isEnabled) {
        if (amplitudeInst) {
          amplitudeInst.getInstance().logEvent(
            'web_mediator.open_web',
            Object.assign(
              {},
              {
                isDesktop: !isMobile,
                platform: getMobileOS(),
              },
              getHrefUTM(),
            ),
          )
        }
        queueMicrotask(() => {
          location.href = `${webUrl}${
            e?.target instanceof HTMLAnchorElement && e.target.dataset.guest
              ? `${webUrl.endsWith('club/') ? '?' : '&'}guest=1`
              : ''
          }`
        })
      }
    }

    const onWallectConnect = async (tokenData: GetTokenType) => {
      setToken(tokenData)
      /* Writing to local storage/cookies completes with delay. That's why we need to wait before click */
      setTimeout(() => {
        handleOnClickWeb()
      }, 800)
    }

    const onWalletError = () => {
      clearToken()
    }

    useEffect(() => {
      if (checkEventAvailability) {
        intervalRef.current = setInterval(() => {
          getEvent(roomParams.eventId)
            .then((r) => {
              if (r.data && !r._cc_errors.length && r.data.response) {
                if (r.data.response.state === 'join' && r.data.response.roomId && r.data.response.roomPass) {
                  const deepLink = `deep_link_value=${deepLinkValue}_roomId_${r.data.response.roomId}_pswd_${r.data.response.roomPass}`
                  window.location.href = `https://web.${isDevelopment ? 'stage.' : ''}connect.club/?${deepLink}`
                  // setCheckEventAvailability(false)
                  // setIsEnabled(true)
                  // setDeepLinkUrl(deepLink)
                }
              } else {
                intervalRef.current && clearInterval(intervalRef.current)
              }
            })
            .catch(() => {
              intervalRef.current && clearInterval(intervalRef.current)
              setCheckEventAvailability(false)
            })
        }, 10000)
      }
      return () => {
        intervalRef.current && clearInterval(intervalRef.current)
      }
    }, [checkEventAvailability])

    if (isUserLoading) {
      return null
    }

    return (
      <>
        <hr />
        <UserBlock />
        <div className={'d-flex gutter-1 justify-content-center align-items-center'} style={{ margin: '2.4rem 0' }}>
          {!roomParams.isEvent || roomParams.enabled || isEnabled ? (
            <>
              <a
                onClick={handleOnClickWeb}
                href={'#'}
                title={'Go to web version as guest (anonymous)'}
                className={styles.app_link}
                style={{ margin: 0 }}
                data-guest={'1'}
              >
                Go to event as guest (anonymous)
              </a>
              {user ? (
                <a
                  onClick={handleOnClickWeb}
                  href={'#'}
                  title={'Participate in event'}
                  className={styles.app_link}
                  style={{ margin: 0 }}
                >
                  🟢 Participate in event
                </a>
              ) : (
                <WalletAuth onSuccess={onWallectConnect} onError={onWalletError}>
                  <a href={'#'} title={'Participate in event'} className={styles.app_link} style={{ margin: 0 }}>
                    🟢 Participate in event (connect wallet)
                  </a>
                </WalletAuth>
              )}
            </>
          ) : (
            <a onClick={handleOnClickWeb} href={'#'} title={'Event is not ready yet'} className={styles.app_link}>
              🔴 Wait, please, event is not ready yet <Loader width={'16px'} height={'16px'} />
            </a>
          )}
        </div>
      </>
    )
  }

  useEffect(() => {
    const pathname = window.location.pathname
    let params: Record<string, string> = {}
    let searchParams = ''
    let urlParams = ''

    if (Object.keys(router.query).length && landingAmplitudeDeviceId !== null) {
      params = Object.keys(router.query).reduce((accum, curVal) => {
        if (!['shortlink', 'af_force_deeplink', 'pid', 'deep_link_sub1'].includes(curVal)) {
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
      const deepLinkSubQR = `deep_link_sub1=${landingAmplitudeDeviceId}~${utmCampaign}[QR]~${utmContent}~${utmSource}${
        utmCampaign ? `&c=${utmCampaign}[QR]` : ''
      }`
      if (Object.keys(params).length) {
        searchParams = new URLSearchParams(params).toString()
        delete params['deep_link_value']
        urlParams = new URLSearchParams(params).toString()
      }
      setAppUrl(`${initialAppUrl}?${deepLinkUrl}&${deepLinkSub}${urlParams ? `&${urlParams}` : ''}`)
      setAppUrlQR(`${initialQRAppUrl}?${deepLinkUrl}&${deepLinkSubQR}${urlParams ? `&${urlParams}` : ''}`)
      setWebUrl(`${initialWebUrl}?${deepLinkUrl}&${deepLinkSub}${urlParams ? `&${urlParams}` : ''}`)
    }

    window.history.replaceState(
      window.history.state,
      document.title,
      pathname + (searchParams ? '?' + searchParams : ''),
    )
  }, [deepLinkUrl, initialAppUrl, initialQRAppUrl, initialWebUrl, isMobile, landingAmplitudeDeviceId, router.query])

  useEffect(() => {
    if (router.isReady) {
      const amplitudeParams = Object.assign(
        {},
        {
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

      queueMicrotask(() => {
        amplitudeInst && amplitudeInst.getInstance().logEvent('web_mediator.pageview', amplitudeParams)
      })
    }
  }, [amplitudeInst, amplitudeKey, isMobile, router])

  useEffect(() => {
    setIsMobile(isMobileDevice())
    setIsChrome(platform.chrome)
    import('amplitude-js').then((mod) => setAmplitude(mod.default))
  }, [])

  return (
    <div className={clsx('container relative', styles.without_avatar)}>
      <Head>
        <title>Connect club - go to web version?</title>
        <meta
          name='description'
          content={`You are going to open the room in Connect club. Choose, where would you like to continue using the application: web version or mobile`}
        />
        <meta property='og:title' content={`Connect club - go to web version?`} />
        <meta
          property='og:description'
          content={`You are going to open the room in Connect club. Choose, where would you like to continue using the application: web version or mobile`}
        />
        <meta property='og:url' content={`https://${isDevelopment ? 'stage.' : ''}connect.club/web`} />
        <meta
          property='og:image'
          content={`https://${isDevelopment ? 'stage.' : ''}connect.club/api/get/ogimage?web=1`}
          key={'ogimage'}
        />
        <meta property='og:image:type' content='image/png' key={'ogimagetype'} />
        <meta property='og:image:width' content='1200' key={'ogimagew'} />
        <meta property='og:image:height' content='630' key={'ogimageh'} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta
          name='twitter:image'
          content={`https://${isDevelopment ? 'stage.' : ''}connect.club/api/get/ogimage?web=1`}
        />
      </Head>
      <div className={styles.header_logo}>
        <Link href='/'>
          <a title={'Connect club'}>
            <Logo color={['rgba(77, 125, 208, 0.08)', 'rgba(77, 125, 208, 0.08)']} width={73} id='header' />
          </a>
        </Link>
      </div>
      <div className={clsx(styles.club)}>
        <h1 className={styles.club__h1}>Web version</h1>
        {isChrome !== null && (
          <>
            {isMobile || !isChrome ? (
              <p className={clsx(styles.attention)}>
                Web version available only from {isMobile ? 'desktop version' : 'Chrome browser'}
              </p>
            ) : (
              <>
                {roomParams.expired ? (
                  <p className={styles.attention}>Room is no longer available</p>
                ) : (
                  <>
                    <p>
                      You are going to open the room in Connect club. Choose, where would you like to continue using the
                      application: web version or mobile
                    </p>
                    <p>Scan the QR to open the application, click the button to go to the web version</p>
                    <Button />
                    {!roomParams.enabled && (
                      <p className={'align-center'}>When the event is ready, you will be redirect automatically</p>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
      <div className={styles.apps_wrap}>
        <p>Get the app to join the conversation!</p>

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
          .${styles.club__h1} {
            margin-bottom: inherit;
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

export default WebFrontend
