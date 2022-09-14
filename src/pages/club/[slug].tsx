import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import QRCode from 'react-qr-code'
import Slider from 'react-slick'
import amplitude from 'amplitude-js'
import clsx from 'clsx'
import moment from 'moment'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import platform from 'platform-detect'
import PropTypes from 'prop-types'
import Cookies from 'universal-cookie'

import { getClub, useClubEvents } from '@/api/clubApi'
import { getEvent } from '@/api/eventApi'
import { getCurrentUser, useFrontendUser } from '@/api/userApi'
import WalletAuth from '@/components/auth/components/WalletAuth'
import public_styles from '@/css/public.module.css'
import { logout } from '@/lib/Api'
import { getUrlWithSizes } from '@/lib/helpers'
import { Loader, Logo } from '@/lib/svg'
import { useStore } from '@/lib/useStore'
import { getHrefUTM, isDevelopment } from '@/lib/utils'
import { getMobileOS } from '@/lib/utils'
import { isMobileDevice } from '@/lib/utils'
import { Club } from '@/model/clubModel'
import { FC, GetTokenType } from '@/model/commonModel'
import { WebRoomParams } from '@/model/roomModel'
import noImage from '@/public/img/svg/no-image.svg'

import styles from './club_frontend.module.css'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { params } = ctx

  if (!params?.slug || typeof params.slug !== 'string') {
    console.log('Club not found', params)
    return {
      notFound: true,
      revalidate: isDevelopment ? 5 : 10,
    }
  }

  const [club, errors] = await getClub(params.slug)

  if (errors.length || !club) {
    console.log('Club not found', params, club, errors)
    return {
      notFound: true,
    }
  }

  const cookies = ctx.req.cookies
  let requestParams = undefined

  if (cookies.ccUserToken) {
    try {
      const userToken = JSON.parse(cookies.ccUserToken)
      if (userToken.access_token) {
        const [currentUser] = await getCurrentUser(userToken.access_token)
        if (currentUser) {
          requestParams = { headers: { Authorization: 'Bearer ' + userToken.access_token } }
        }
      }
    } catch (e) {
      //
    }
  }

  const { id, deep_link_value } = ctx.query || {}

  const roomParams = {
    eventId: '',
    isEvent: false,
    enabled: true,
    expired: false,
    withToken: false,
    tokenUrl: '',
  } as WebRoomParams

  // Get information about event
  if (deep_link_value && !Array.isArray(deep_link_value)) {
    const dp = deep_link_value.split('_')
    if (dp.includes('eventId')) {
      roomParams['enabled'] = false
      roomParams['expired'] = true
      const eventId = dp[dp.indexOf('eventId') + 1].split('~')[0]
      const response = await getEvent(eventId, requestParams)
      if (response.data && !response._cc_errors.length && response.data.response) {
        roomParams['isEvent'] = true
        roomParams['eventId'] = eventId
        const event = response.data.response
        roomParams['enabled'] = event.state === 'join' && !!event.roomId && !!event.roomPass
        roomParams['expired'] = event.state === 'expired'
        roomParams['withToken'] = event.withToken
        roomParams['tokenUrl'] = event?.tokenLandingUrlInformation || ''
        if (roomParams['enabled']) {
          roomParams['roomId'] = event.roomId
          roomParams['pswd'] = event.roomPass

          // If room is ready, then redirect to it
          if (!roomParams['withToken'] || event['isOwnerToken'] || event['isOwned']) {
            const deepLink = `deep_link_value=${deep_link_value}_roomId_${roomParams.roomId}_pswd_${roomParams.pswd}`
            return {
              redirect: {
                permanent: false,
                destination: `https://web.${isDevelopment ? 'stage.' : ''}connect.club/?${deepLink}`,
              },
              props: {},
            }
          }
        }
      }
    }
  }

  return {
    props: {
      club,
      roomParams,
      deepLinkValue: deep_link_value || 'v=1',
      eventId: id || '',
    },
  }
}

declare const window: Window & {
  gtag: any
  dataLayer: any
  opera?: string
  MSStream: any
}

type Props = {
  club: Club
  eventId: string
  roomParams: WebRoomParams
  deepLinkValue: string
}
const ClubFrontend: FC<Props> = ({ club, eventId, roomParams, deepLinkValue }) => {
  const amplitudeKey = isDevelopment ? '4b60a0a8667ea48921f95986cf1e2e55' : '9eaaf824819a859f6180b3125d8e876b'
  const amplitudeCookieName = `amp_cl_${amplitudeKey.substring(0, 6)}`

  const { t } = useTranslation('common')
  const router = useRouter()
  const initialAppUrl = `https://app.connect.club/W0Im/${isDevelopment ? '3d6351c7' : 'ecff227c'}`
  const initialQRAppUrl = `https://app.connect.club/W0Im/${isDevelopment ? '71bfff2b' : '2cada15'}`
  const [appUrl, setAppUrl] = useState(initialAppUrl)
  const [appUrlQR, setAppUrlQR] = useState(initialQRAppUrl)
  const [landingAmplitudeDeviceId, setLandingAmplitudeDeviceId] = useState<string | null>(null)
  const [activeEventId, setActiveEventId] = useState(eventId)
  const [amplitudeInst, setAmplitude] = useState<typeof amplitude | null>(null)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [autoplay, setAutoplay] = useState<boolean>(true)
  const [isChrome, setIsChrome] = useState<boolean | null>(null)
  const [events, isEventsLoading] = useClubEvents(club.id, { limit: 20 })
  const cookies = useMemo(() => new Cookies(), [])
  const slider = useRef<Slider>(null)

  const [user, isUserLoading] = useFrontendUser()
  const setToken = useStore((state) => state.setToken)
  const clearToken = useStore((state) => state.clearToken)

  /* Slider initial settings */
  const initialSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    arrows: false,
    slidesToScroll: 1,
    slidesToShow: 1,
    autoplay: autoplay,
    adaptiveHeight: true,
    autoplaySpeed: 10000,
  }

  const handleOnClickApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (amplitudeInst) {
      amplitudeInst.getInstance().logEvent(
        'club_landing.open_app',
        Object.assign(
          {},
          {
            clubId: club.id,
            clubSlug: club.slug,
            isDesktop: !isMobile,
            platform: getMobileOS(),
          },
          getHrefUTM(),
        ),
      )
      cookies.set(amplitudeCookieName, 1, { path: '/' })
    }
    window.gtag &&
      window.gtag('event', 'open_app', {
        event_category: 'App button click',
        event_name: 'open_app',
        club_slug: club.slug,
        is_desktop: !isMobile,
        non_interaction: true,
      })
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
    const deepLink = `deep_link_value=${deepLinkValue}${
      roomParams.isEvent && roomParams.enabled ? `_roomId_${roomParams.roomId}_pswd_${roomParams.pswd}` : ``
    }`
    const initialWebUrl = `https://web.${isDevelopment ? 'stage.' : ''}connect.club/`
    const [checkEventAvailability, setCheckEventAvailability] = useState(!roomParams.enabled)
    const [webUrl, setWebUrl] = useState(`${initialWebUrl}?${deepLink}`)
    const [isEnabled, setIsEnabled] = useState(roomParams.enabled)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const handleOnClickWeb = (e?: React.MouseEvent<HTMLAnchorElement>) => {
      e?.preventDefault()
      if (isEnabled) {
        if (amplitudeInst) {
          amplitudeInst.getInstance().logEvent(
            'club_web_mediator.open_web',
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
                  setCheckEventAvailability(false)
                  setIsEnabled(true)
                  setWebUrl(`${initialWebUrl}?${deepLink}`)
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
    }, [checkEventAvailability, initialWebUrl])

    if (isUserLoading) {
      return null
    }

    return (
      <>
        <hr />
        <UserBlock />
        <div className={'d-flex gutter-1 justify-content-center align-items-center'} style={{ margin: '2.4rem 0' }}>
          {roomParams.withToken ? (
            <div>
              <div className={'mb-1'} style={{ color: '#4d7dd0', fontWeight: 'bold' }}>
                💎 This event for NFT holders only
              </div>
              <div className={'d-flex gutter-1 justify-content-center align-items-center'}>
                <a
                  href={roomParams.tokenUrl}
                  className={styles.app_link}
                  title={'NFT more info'}
                  target={'_blank'}
                  rel={'noreferrer'}
                  style={{ margin: 0 }}
                >
                  Get NFT to access the event
                </a>
                {!user && (
                  <WalletAuth
                    onSuccess={(tokenData) => {
                      setToken(tokenData)
                      setTimeout(() => location.reload(), 500)
                    }}
                    onError={onWalletError}
                  >
                    <a href={'#'} title={'Log in'} className={styles.app_link} style={{ margin: 0 }}>
                      🟢 Log in (connect wallet)
                    </a>
                  </WalletAuth>
                )}
              </div>
            </div>
          ) : !roomParams.isEvent || roomParams.enabled || isEnabled ? (
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
    let pathname = window.location.pathname
    let params: Record<string, string> = {}
    let searchParams = ''

    if (Object.keys(router.query).length && landingAmplitudeDeviceId !== null) {
      params = Object.keys(router.query).reduce((accum, curVal) => {
        if (!['slug', 'shortlink', 'af_force_deeplink', 'pid', 'deep_link_sub1'].includes(curVal)) {
          accum[curVal] = router.query[curVal] as string
        }
        return accum
      }, params)

      const utmContent = !isMobile ? 'qr' : params['utm_content'] || ''
      const utmSource = params['utm_source'] || (document.referrer ? new URL(document.referrer).hostname : '')
      const utmCampaign = params['utm_campaign'] || `without_utm${utmSource ? `[${utmSource}]` : ``}`

      const deepLinkValue = !router.query['deep_link_value']
        ? `&deep_link_value=clubId_${club.id}${router.query?.id ? `_eventId_${router.query.id}` : ``}`
        : ''

      const deepLinkSub = `deep_link_sub1=${landingAmplitudeDeviceId}~${utmCampaign}~${utmContent}~${utmSource}${
        utmCampaign ? `&c=${utmCampaign}` : ''
      }${deepLinkValue || ''}`
      const deepLinkSubQR = `deep_link_sub1=${landingAmplitudeDeviceId}~${utmCampaign}[QR]~${utmContent}~${utmSource}${
        utmCampaign ? `&c=${utmCampaign}[QR]` : ''
      }${deepLinkValue || ''}`
      if (Object.keys(params).length) {
        searchParams = new URLSearchParams(params).toString()
      }
      setAppUrl((prev) => `${prev}?${deepLinkSub}${searchParams ? `&${searchParams}` : ''}`)
      setAppUrlQR((prev) => `${prev}?${deepLinkSubQR}${searchParams ? `&${searchParams}` : ''}`)

      if (router.query?.id) {
        setActiveEventId(String(router.query.id))
      }

      if (router.query.slug === club.id) {
        pathname = router.pathname.replace(/\[slug]/, club.slug)
      }
    }

    window.history.replaceState(
      window.history.state,
      document.title,
      pathname + (searchParams ? '?' + searchParams : ''),
    )
  }, [club.id, club.slug, isMobile, landingAmplitudeDeviceId, router, router.query])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    if (router.isReady) {
      const amplitudeParams = Object.assign(
        {},
        {
          clubId: club.id,
          clubSlug: club.slug,
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
        amplitudeInst && amplitudeInst.getInstance().logEvent('club_landing.pageview_three_seconds', amplitudeParams)
      }, 3000)

      queueMicrotask(() => {
        amplitudeInst && amplitudeInst.getInstance().logEvent('club_landing.pageview', amplitudeParams)
      })
    }
    return () => {
      timeout && clearTimeout(timeout)
    }
  }, [amplitudeInst, amplitudeKey, club.id, club.slug, isMobile, landingAmplitudeDeviceId, router, router.isReady])

  useEffect(() => {
    if (!isEventsLoading && events.length && activeEventId && slider.current) {
      events.forEach((event, index) => {
        if (event.id === activeEventId) {
          slider.current!.slickGoTo(index)
          setAutoplay(false)
        }
      })
    }
  }, [activeEventId, events, isEventsLoading])

  useEffect(() => {
    setIsMobile(isMobileDevice())
    setIsChrome(platform.chrome)
    import('amplitude-js').then((mod) => setAmplitude(mod.default))
  }, [])

  const title = `Connect club - ${club.title}`

  return (
    <div className={clsx('container relative', !club.avatar ? styles.without_avatar : undefined)}>
      <Head>
        <title>{title}</title>
        <meta name='description' content={`Connect club. ${club.description}`} />
        <meta property='og:title' content={`Connect club - ${club.title}`} />
        <meta property='og:description' content={`Connect club. ${club.description}`} />
        <meta
          property='og:url'
          content={`https://${isDevelopment ? 'stage.' : ''}connect.club/club/${club.slug}${
            eventId ? `?id=${eventId}` : ``
          }`}
        />
        <meta
          property='og:image'
          content={`https://${isDevelopment ? 'stage.' : ''}connect.club/api/get/ogimage?clubSlug=${
            club.slug
          }&eventId=${eventId}`}
          key={'ogimage'}
        />
        <meta property='og:image:type' content='image/png' key={'ogimagetype'} />
        <meta property='og:image:width' content='1200' key={'ogimagew'} />
        <meta property='og:image:height' content='630' key={'ogimageh'} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta
          name='twitter:image'
          content={`https://${isDevelopment ? 'stage.' : ''}connect.club/api/get/ogimage?clubSlug=${
            club.slug
          }&eventId=${eventId}`}
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
        {club.avatar && (
          <div className={styles.club__logo}>
            <Image src={getUrlWithSizes(club.avatar, 360, 360)} layout={'fill'} objectFit={'cover'} alt={club.title} />
          </div>
        )}
        <h1 className={styles.club__h1}>{club.title}</h1>
        <div className={styles.club__count}>
          {club.countParticipants} {`member${club.countParticipants > 1 ? `s` : ``}`}
        </div>
        {club.description && (
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
            {club.description}
          </ReactMarkdown>
        )}
        {isChrome !== null && roomParams.isEvent && (
          <>
            {isMobile || !isChrome ? (
              <p className={clsx(styles.info, 'mt-1')}>
                Web version available only from {isMobile ? 'desktop version' : 'Chrome browser'}
              </p>
            ) : (
              <>
                {roomParams.expired ? (
                  <p className={clsx(styles.info, 'mt-1')}>Room is no longer available</p>
                ) : (
                  <>
                    {!roomParams.withToken && (
                      <>
                        <hr />
                        <p>Click the button to watch the event on web version right now</p>
                      </>
                    )}
                    <Button />
                    {!roomParams.enabled && (
                      <p>
                        The button above will change automatically and let you come in, when the event will be ready.
                        Thank you for cooperation!
                      </p>
                    )}
                    <hr />
                  </>
                )}
              </>
            )}
          </>
        )}
        {isEventsLoading ? (
          <Loader />
        ) : (
          <>
            {events.length > 0 && (
              <div className={styles.club__events}>
                <h2>Upcoming events</h2>
                <div className={styles.club__events_list}>
                  <Slider {...initialSettings} ref={slider}>
                    {events.map((event) => (
                      <div key={event.id} className={styles.club__event}>
                        <div className={styles.club__event_time}>
                          {moment.unix(event.date).format('LT・ddd・MMM DD')}
                        </div>
                        <div className={styles.club__event_title}>{event.title}</div>
                        <div className={styles.club__event_participants}>
                          {event.participants.map((participant) => (
                            <div key={participant.id} className={styles.club__event_participant_img}>
                              {participant.avatar ? (
                                <Image
                                  src={getUrlWithSizes(participant.avatar, 28 * 3, 28 * 3)}
                                  layout={'fill'}
                                  objectFit={'contain'}
                                  alt={club.title}
                                />
                              ) : (
                                <Image
                                  src={noImage}
                                  width={28}
                                  height={28}
                                  alt={participant.displayName}
                                  quality={100}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        {event.description && <div className={styles.club__event_desc}>{event.description}</div>}
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
            )}
          </>
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

ClubFrontend.propTypes = {
  club: PropTypes.object,
}

export default ClubFrontend
