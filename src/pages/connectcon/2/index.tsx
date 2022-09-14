import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Script from 'next/script'
import useTranslation from 'next-translate/useTranslation'

import styles from '@/components/festival/festival.module.css'
import Speakers from '@/components/festival/Speakers'
import FestivalLayout from '@/components/layout/FestivalLayout'
import { FCWithLayoutParams } from '@/model/commonModel'

declare const window: Window & {
  gtag: any
  dataLayer: any
  fbq: any
}

const ConnectconIndex: FCWithLayoutParams<unknown> = () => {
  const { t } = useTranslation('connectcon/2/home')

  const router = useRouter()

  const [activeHash, setActiveHash] = useState<string>('')

  // @ts-ignore
  const speakers = [...Array(3).keys()].map((index) => {
    return {
      image: t(`sections.fourth.speakers.${index + 1}.image`),
      name: t(`sections.fourth.speakers.${index + 1}.name`),
      description: t(`sections.fourth.speakers.${index + 1}.description`),
      anchor: t(`sections.fourth.speakers.${index + 1}.anchor`),
    }
  })

  const scenes = ['first', 'second', 'third'].map((stage) => {
    return {
      code: stage,
      title: t(`sections.seventh.scenes.${stage}.title`),
      anchor: t(`sections.seventh.scenes.${stage}.anchor`),
      style: t(`sections.seventh.scenes.${stage}.style`),
      subtitle:
        t(`sections.seventh.scenes.${stage}.subtitle`) !== `connectcon/2/home:sections.seventh.scenes.${stage}.subtitle`
          ? t(`sections.seventh.scenes.${stage}.subtitle`)
          : '',
      // @ts-ignore
      rows: [...Array(4).keys()]
        .map((index) => {
          if (
            t(`sections.seventh.scenes.${stage}.rows.${index + 1}`) !==
            `connectcon/2/home:sections.seventh.scenes.${stage}.rows.${index + 1}`
          ) {
            return t(`sections.seventh.scenes.${stage}.rows.${index + 1}`)
          }
        })
        .filter((n) => n),
    }
  })

  /* Fade in / fade out "Join button" */
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop
      const joinButton = document.querySelector(`.${styles.landing__join_button}`) as HTMLDivElement
      if (joinButton) {
        if (scrollTop <= 10) {
          joinButton.style.opacity = '0'
        } else {
          joinButton.style.opacity = '1'
        }
      }
    }
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (router.asPath.indexOf('#') !== -1) {
      setActiveHash(router.asPath)
    }
  }, [router.asPath])

  return (
    <div className={clsx(styles.landing, 'container')}>
      <Head>
        <title>{t('title')}</title>
        <meta name='description' content={t('description')} />
        <meta name='format-detection' content='telephone=no' />
      </Head>
      <Script src='//embed.typeform.com/next/embed.js' />
      <div className={styles.landing__logo}>
        <Image
          src='/img/festival/landing/connectcon-main-logo.png'
          priority={true}
          width={685}
          height={156}
          quality={100}
          alt={t('title')}
        />
      </div>

      {/* Section 1 */}
      <div className={clsx(styles.landing__section, 'promo-block relative')}>
        <h1 className={styles.landing__h1}>
          {t('sections.first.heading')}
          <div className={'date mt-2'} dangerouslySetInnerHTML={{ __html: t('sections.first.date') }} />
        </h1>
        <div className={'mt-2'} dangerouslySetInnerHTML={{ __html: t('sections.first.content') }} />
        <div>
          <button className={'popup-button mt-2'} data-tf-popup='FSP3PjSl'>
            Reserve my spot
          </button>
        </div>
      </div>

      {/* Section 4 */}
      <div className={clsx(styles.landing__section)}>
        <div className={styles.landing__h2}>{t('sections.fourth.heading')}</div>
        <div className={styles.landing__speakers}>
          <Speakers speakers={speakers} makeAnchors activeSpeaker={activeHash} />
        </div>
        <div className='align-center'>
          <a
            href='https://connectclub.notion.site/Speakers-621c806971fd4cec843dcf085ed50cb9'
            rel='noreferrer'
            target='_blank'
            title={t('sections.fourth.button_name')}
            className={styles.landing__button}
          >
            {t('sections.fourth.button_name')}
          </a>
        </div>
      </div>

      {/* Section 7*/}
      <div className={clsx(styles.landing__section, styles.landing__section_scenes)}>
        <div className={styles.landing__h2}>{t('sections.seventh.heading')}</div>
        <section className={clsx(styles.events, styles.scenes, 'd-flex')}>
          <div className={clsx(styles.scenes_inner_wrapper, 'd-flex')}>
            {scenes.map((scene) => (
              <div
                className={clsx(
                  styles.events__scenes,
                  activeHash !== '' && activeHash !== `${router.pathname}#${scene.anchor}`
                    ? styles[`not_active`]
                    : null,
                )}
                key={scene.code}
              >
                <div
                  id={scene.anchor}
                  className={clsx(
                    styles.events__scenes_item,
                    styles[`events__scenes_scene_${scene.style}`],
                    scene.subtitle === '' ? styles.events__scenes_without_subtitle : null,
                  )}
                >
                  <div className={styles.events__scenes_heading}>{scene.title}</div>
                  {scene.subtitle !== '' && (
                    <div>
                      <div className={styles.events__scenes_heading_subtitle}>{scene.subtitle}</div>
                    </div>
                  )}
                  {scene.rows.map((rowContent, index2) => (
                    <div className={clsx(styles.events__scenes_row, 'd-flex')} key={index2}>
                      <div className={styles.events__scenes_time} />
                      <div className={styles.events__scenes_content}>
                        <div className={styles.events__scenes_name}>{rowContent}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Section 2 */}
      <div className={styles.landing__section}>
        <div className={styles.landing__h2}>{t('sections.second.heading')}</div>
        <div dangerouslySetInnerHTML={{ __html: t('sections.second.content_1') }} />
        <button className={'popup-button mt-2'} data-tf-popup='FSP3PjSl'>
          Register now
        </button>
      </div>

      {/* Section 6 */}
      <div className={styles.landing__section}>
        <div className={styles.landing__h2}>{t('sections.sixth.heading')}</div>
        <div className={clsx('d-flex flex-flow-wrap', styles.landing__screenshots)}>
          <div>
            <Image
              src='/img/festival/landing/app_screenshot_2.png'
              width={240}
              height={485}
              quality={100}
              alt={`${t('sections.sixth.heading')} - 2`}
            />
          </div>
          <div>
            <Image
              src='/img/festival/landing/app_screenshot_1.png'
              width={240}
              height={485}
              quality={100}
              alt={`${t('sections.sixth.heading')} - 1`}
            />
          </div>
        </div>
      </div>

      {/* Section 5 */}
      <div className={clsx(styles.landing__section)}>
        <div className={styles.landing__h2}>{t('sections.fifth.heading')}</div>
        <div dangerouslySetInnerHTML={{ __html: t('sections.fifth.content') }} />
      </div>

      {/* Section 8 */}
      <div className={clsx(styles.landing__section, styles.landing__section_bordered, 'mb-0')}>
        <div className={styles.landing__h2}>{t('sections.eighth.heading')}</div>
        <p style={{ fontSize: '1.6rem' }}>
          <b>{t('sections.eighth.write_to')}</b>
        </p>
        <p className={styles.p_smaller}>
          E-mail:{' '}
          <a
            href='mailto:info@connect.club'
            className={styles.original_link_color}
            title={`${t('sections.eighth.write_to')} info@connect.club`}
          >
            info@connect.club
          </a>
        </p>
      </div>

      {/* Section 3 */}
      {/*<div className={styles.landing__section}>*/}
      {/*    <div className={styles.landing__h2}>*/}
      {/*        {t('sections.third.heading')}*/}
      {/*    </div>*/}
      {/*    <div dangerouslySetInnerHTML={{ __html: t('sections.third.content') }} />*/}
      {/*</div>*/}

      {/*<div className={styles.landing__join_button}>*/}
      {/*    <a href="https://bit.ly/connect_con_registration"*/}
      {/*       target='_blank'*/}
      {/*       title={t('join_button')}*/}
      {/*       rel="noreferrer"*/}
      {/*       onClick={() => {*/}
      {/*           if (!isDevelopment) {*/}
      {/*               window.gtag && window.gtag('event', 'send', {*/}
      {/*                   'event_label': 'feedback',*/}
      {/*                   'event_category': 'form',*/}
      {/*                   'non_interaction': true*/}
      {/*               });*/}
      {/*               window.fbq && window.fbq('track', 'AddToWishlist');*/}
      {/*           }*/}
      {/*       }}*/}
      {/*    >{t('join_button')}</a>*/}
      {/*</div>*/}

      <style>{`
                .${styles.landing__section} ul li { margin-bottom: 2rem; width: 100% }
                @media (max-width: 980px) {
                    .${styles.landing__section} ul li {  width: 100% }
                }
            `}</style>
      <style jsx>{`
        .popup-button {
          all: unset;
          font-family: Helvetica, Arial, sans-serif;
          display: inline-block;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background-color: rgb(117, 220, 208);
          color: rgb(10, 41, 37);
          font-size: 20px;
          border-radius: 4px;
          padding: 0 33px;
          font-weight: bold;
          height: 50px;
          cursor: pointer;
          line-height: 50px;
          text-align: center;
          margin: 0;
          text-decoration: none;
        }
        .popup-button:hover {
          background-color: #5cd6c8;
        }
        .date {
          font-size: 3rem;
        }
        @media (max-width: 980px) {
          .popup-button {
            display: flex;
            margin: 0 auto;
          }
        }
      `}</style>
      <style global jsx>{`
        html,
        body,
        main {
          background: #0a0528 !important;
        }
        body main {
          padding-top: 0 !important;
        }
        .footer {
          background: #080725 !important;
          color: rgba(255, 255, 255, 0.24);
          border-top: none;
        }
        .footer__social_icons svg {
          fill: rgba(255, 255, 255, 0.24);
        }
      `}</style>
    </div>
  )
}

ConnectconIndex.getLayout = FestivalLayout
ConnectconIndex.getLayoutParams = {
  hideHeader: true,
  footerLogoColor: 'rgba(255, 255, 255, .24)',
}

export default ConnectconIndex
