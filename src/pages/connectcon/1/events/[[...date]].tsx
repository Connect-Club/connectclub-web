import React, { RefObject, useEffect, useRef, useState } from 'react'
import Slider from 'react-slick'
import clsx from 'clsx'
import moment from 'moment-timezone'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import useTranslation from 'next-translate/useTranslation'
import PropTypes from 'prop-types'

import { getFestivalEventsList, getFestivalScenes } from '@/api/festivalApi'
import styles from '@/components/festival/festival.module.css'
import FestivalLayout from '@/components/layout/FestivalLayout'
import { convertTwoDigits, shareEventLink } from '@/lib/helpers'
import { FCWithLayoutParams } from '@/model/commonModel'

type SwipeElement = {
  code: string
  ref: RefObject<HTMLAnchorElement>
}
type EventElementType = {
  element: SwipeElement
  withoutRef?: boolean
  handleOnTouchEnd?: (e: React.TouchEvent) => void
}
type SceneSheduleEvent = {
  id: string
  start: string
  end: string
  name: string
  description: string
}
type SceneSchedule = {
  [key: string]: {
    timeinterval: {
      start: [string, string]
      end: [string, string]
    }
    sceneEvents: {
      [key: string]: Array<SceneSheduleEvent>
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { date: [] } }, { params: { date: ['28aug'] } }, { params: { date: ['29aug'] } }],
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { params } = ctx
  const convertToTimezone = 'America/Los_Angeles'

  const sceneSchedule: SceneSchedule = {}

  /* Select date from path */
  let dateStart = '2021-08-27'
  if (params?.date) {
    switch (params.date[0]) {
      case '28aug':
        dateStart = '2021-08-28'
        break
      case '29aug':
        dateStart = '2021-08-29'
        break
    }
  }

  /* Get scene schedule events by date */
  const [events, errors] = await getFestivalEventsList({
    limit: 500,
    dateStart: dateStart,
    timezone: convertToTimezone,
    festivalCode: process.env.NEXT_PUBLIC_FESTIVAL_CODE,
  })

  /* Scenes */
  const [plainScenes, scenesErrors] = await getFestivalScenes(process.env.NEXT_PUBLIC_FESTIVAL_CODE!)
  const scenes = {} as Record<string, string>
  if (!scenesErrors.length && Array.isArray(plainScenes)) {
    plainScenes.forEach((scene) => {
      if (scene.id !== '3ce54ae0-f147-11eb-9a03-0242ac130003') {
        scenes[scene.id] = scene.sceneCode
      }
    })
  }
  const sceneIds = Object.keys(scenes)

  const getTimezoneHour = (
    date: number,
    timezone = 'Europe/Moscow',
    setHour: number | null = null,
  ): [string, string] => {
    const dateObj =
      setHour !== null
        ? moment(date * 1000)
            .tz('Europe/Moscow')
            .set({ hour: setHour })
            .tz(timezone)
        : moment(date * 1000).tz(timezone)
    return [dateObj.format('hh'), dateObj.format('A')]
  }
  const getTimezoneHourMinutes = (date: number, timezone = 'Europe/Moscow', setHour: number, setMinutes: number) => {
    const dateObj = moment(date * 1000)
      .tz('Europe/Moscow')
      .set({ hour: setHour, minute: setMinutes })
      .tz(timezone)
    return dateObj.format('hh:mm A')
  }

  /* Get event time intervals, divided by scenes */
  if (!errors.length && events.length && Object.keys(sceneIds).length) {
    events.forEach((event) => {
      if (typeof scenes[event.festivalScene.id] !== 'undefined') {
        const startHour = parseInt(
          moment(event.date * 1000)
            .tz('Europe/Moscow')
            .format('HH'),
        )
        let endHour = parseInt(
          moment(event.dateEnd * 1000)
            .tz('Europe/Moscow')
            .format('HH'),
        )
        const startMinutes = new Date(event.date * 1000).getMinutes()
        const endMinutes = new Date(event.dateEnd * 1000).getMinutes()

        if (endHour === 0) {
          endHour = 24
        }
        for (let i = startHour; i <= endHour; i++) {
          const localStartMinutes = i !== startHour && startHour !== endHour ? 0 : startMinutes
          const localEndHour = endHour + 1 - i > 1 || startHour === endHour ? i + 1 : endHour
          const localEndMinutes = endHour + 1 - i > 1 ? 0 : endMinutes

          if ((i === endHour && endMinutes > 0) || i !== endHour) {
            const key = `${convertTwoDigits(i)}-${convertTwoDigits(i + 1)}`
            if (typeof sceneSchedule[key] === 'undefined') {
              sceneSchedule[key] = {
                timeinterval: {
                  start: getTimezoneHour(event.date, convertToTimezone, i),
                  end: getTimezoneHour(event.date, convertToTimezone, i + 1),
                },
                sceneEvents: {
                  [sceneIds[0]]: [],
                  [sceneIds[1]]: [],
                  // [sceneIds[2]]: [],
                },
              }
            }
            sceneSchedule[key].sceneEvents[event.festivalScene.id].push({
              id: event.id,
              start: `${getTimezoneHourMinutes(event.date, convertToTimezone, i, localStartMinutes)}`,
              end: `${getTimezoneHourMinutes(
                event.date,
                convertToTimezone,
                localEndHour > endHour ? endHour : localEndHour,
                localEndMinutes,
              )}`,
              name: event.title,
              description: event.description,
            })
          }
        }
      }
    })
  }

  return {
    props: {
      sceneSchedule: sceneSchedule,
      scenes,
    },
    revalidate: 10,
  }
}

type Props = {
  sceneSchedule: SceneSchedule
  scenes: Record<string, string>
}
const ConnectconEvents: FCWithLayoutParams<Props> = ({ sceneSchedule, scenes }) => {
  const { t } = useTranslation('connectcon/1/events')
  const slider = useRef<Slider>(null)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  const swipeElements: SwipeElement[] = [
    {
      code: 'first',
      ref: useRef<HTMLAnchorElement>(null),
    },
    {
      code: 'second',
      ref: useRef<HTMLAnchorElement>(null),
    },
    {
      code: 'third',
      ref: useRef<HTMLAnchorElement>(null),
    },
    {
      code: 'fourth',
      ref: useRef<HTMLAnchorElement>(null),
    },
  ]

  /* Slider initial settings */
  const initialSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    variableWidth: true,
    centerMode: true,
    arrows: true,
    slidesToScroll: 1,
  }

  // eslint-disable-next-line react/display-name
  const EventElement = ({ element, withoutRef = false }: EventElementType) => {
    /* Prevent redirect to link, when touch inactive slide */
    const handleOnTouchEnd = (e: React.MouseEvent<HTMLAnchorElement>) => {
      const slideElement = (e.target as HTMLAnchorElement)?.closest('.slick-slide') as HTMLDivElement
      if (
        e.cancelable &&
        !slideElement?.classList.contains('slick-active') &&
        slider.current &&
        slideElement?.dataset?.index
      ) {
        e.preventDefault()
        slider.current.slickGoTo(parseInt(slideElement.dataset.index))
      }
      if (!isMobile && e.cancelable) {
        e.preventDefault()
      }
    }
    return (
      <a
        href={t(`events.${element.code}.link`)}
        title={isMobile ? t(`events.${element.code}.title`) : t('not_mobile_links_title')}
        onClick={handleOnTouchEnd}
        className={clsx(styles.events__schedule_item, styles[`events__schedule_item_${element.code}`])}
        ref={withoutRef ? null : element.ref}
      >
        <div className={clsx(styles.events__schedule_item_title, element.code === 'first' ? 'pt-0' : 0)}>
          {t(`events.${element.code}.title`)}
        </div>
        <div
          className={styles.events__schedule_item_description}
          dangerouslySetInnerHTML={{
            __html: t(`events.${element.code}.description`),
          }}
        />
      </a>
    )
  }

  const handleOnSceneEventClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isMobile && e.cancelable) {
      e.preventDefault()
    }
  }

  useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])

  return (
    <div className='container'>
      <div className={styles.events__page}>
        <Head>
          <title>{t('title')}</title>
          <meta name='description' content={t('description')} />
          <meta name='robots' content='noindex, nofollow' />
          <meta name='googlebot' content='noindex,nofollow' />
        </Head>

        <div className={styles.events_time_wrapper}>
          <div className={styles.events__timeinterval_header}>9 AM - 11 PM PDT</div>
          <div className={styles.events__timeinterval_text}>{t('all_day_long_event')}</div>
        </div>
        <div className={clsx(styles.events__schedule, styles.slider_block)}>
          <Slider {...initialSettings} ref={slider}>
            {swipeElements.map((element) => (
              <EventElement element={element} withoutRef={true} key={element.code} />
            ))}
          </Slider>
        </div>

        <div className={styles.scenes_wrapper}>
          {Object.keys(sceneSchedule).map((key) => (
            <section className={clsx(styles.events, styles.scenes, 'd-flex')} key={key}>
              <div className={clsx(styles.events__timeinterval, 'sticky-timeline')}>
                <div className={styles.events__timeinterval_header}>
                  {sceneSchedule[key].timeinterval.start[0]}
                  <span className={styles.events__timeinterval_dayperiod}>
                    {sceneSchedule[key].timeinterval.start[1]}
                  </span>{' '}
                  - {sceneSchedule[key].timeinterval.end[0]}
                  <span className={styles.events__timeinterval_dayperiod}>
                    {sceneSchedule[key].timeinterval.end[1]}
                  </span>
                </div>
                <div className={styles.events__timeinterval_text}>PDT-7</div>
              </div>
              <div className={clsx(styles.scenes_inner_wrapper, 'd-flex')}>
                {Object.keys(sceneSchedule[key].sceneEvents).map((sceneId, index) => (
                  <div className={clsx(styles.events__scenes)} key={sceneId}>
                    <div className={clsx(styles.events__scenes_item, styles[`events__scenes_scene_${index + 1}`])}>
                      <div className={styles.events__scenes_heading}>#{scenes[sceneId]}</div>
                      {sceneSchedule[key].sceneEvents[sceneId].map((event) => (
                        <a
                          className={clsx(styles.events__scenes_row, 'd-flex', !isMobile ? styles.not_link : null)}
                          key={event.id}
                          href={shareEventLink(event.id, 'connectcon1_events')}
                          title={!isMobile ? t('not_mobile_links_title') : t('open_event')}
                          onClick={handleOnSceneEventClick}
                        >
                          <div className={styles.events__scenes_time}>
                            {event.start}-<br />
                            {event.end}
                          </div>
                          <div className={styles.events__scenes_content}>
                            <div className={styles.events__scenes_name}>{event.name}</div>
                            <div className={styles.events__scenes_description}>{event.description}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

const isMobileDevice = () => {
  try {
    document.createEvent('TouchEvent')
    return true
  } catch (e) {
    return false
  }
}

ConnectconEvents.propTypes = {
  sceneSchedule: PropTypes.object,
  scenes: PropTypes.object,
}

ConnectconEvents.getLayout = FestivalLayout
ConnectconEvents.getLayoutParams = {
  showEventsInHeader: true,
}

export default ConnectconEvents
