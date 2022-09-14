import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import clonedeep from 'lodash.clonedeep'
import moment from 'moment-timezone'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import useTranslation from 'next-translate/useTranslation'
import PropTypes from 'prop-types'

import { getFestivalEventsList, getFestivalScenes } from '@/api/festivalApi'
import styles from '@/components/festival/festival.module.css'
import HeaderNFT081221 from '@/components/festival/HeaderNFT081221'
import FestivalLayout from '@/components/layout/FestivalLayout'
import { convertTwoDigits, shareEventLink } from '@/lib/helpers'
import { FCWithLayoutParams } from '@/model/commonModel'

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

export const getStaticProps: GetStaticProps = async () => {
  const convertToTimezone = 'America/New_York'

  const sceneSchedule: SceneSchedule = {}

  /* Select date from path */
  const dateStart = '2021-12-08'

  /* Get scene schedule events by date */
  const [events, errors] = await getFestivalEventsList({
    limit: 500,
    dateStart: dateStart,
    timezone: convertToTimezone,
    festivalCode: process.env.NEXT_PUBLIC_FESTIVAL_CODE3,
  })

  /* Scenes */
  const [plainScenes, scenesErrors] = await getFestivalScenes(process.env.NEXT_PUBLIC_FESTIVAL_CODE3!)
  const scenes = {} as Record<string, string>
  if (!scenesErrors.length && plainScenes.length) {
    plainScenes.forEach((scene) => {
      scenes[scene.id] = scene.sceneCode
    })
  }
  const sceneIds = Object.keys(scenes)
  const initialSceneEvents = sceneIds.reduce((accum, curVal) => {
    accum[curVal] = []
    return accum
  }, {} as { [key: string]: Array<SceneSheduleEvent> })

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
        let startHour = parseInt(
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

        if (startHour === 0 && endHour === 0) {
          startHour = 24
        }
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
                sceneEvents: clonedeep(initialSceneEvents),
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
const ConnectconEvents: FCWithLayoutParams<Props> = ({ sceneSchedule }) => {
  const { t } = useTranslation('connectcon/nft/events')
  const [isMobile, setIsMobile] = useState<boolean>(false)

  const handleOnSceneEventClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isMobile && e.cancelable) {
      e.preventDefault()
    }
  }

  useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])

  return (
    <>
      <HeaderNFT081221 />
      <div className='container'>
        <div className={styles.events__page}>
          <Head>
            <title>{t('title')}</title>
            <meta name='description' content={t('description')} />
          </Head>

          <div className={styles.events_time_wrapper}>
            <div className={styles.events__timeinterval_header}>11 AM - 9 PM EST</div>
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
                  <div className={styles.events__timeinterval_text}>EST-5</div>
                </div>
                <div className={clsx(styles.scenes_inner_wrapper, 'd-flex')}>
                  {Object.keys(sceneSchedule[key].sceneEvents).map((sceneId, index) => (
                    <div className={clsx(styles.events__scenes)} key={sceneId}>
                      <div className={clsx(styles.events__scenes_item, styles[`events__scenes_scene_${index + 1}`])}>
                        {/*<div className={styles.events__scenes_heading}>*/}
                        {/*    #{scenes[sceneId]}*/}
                        {/*</div>*/}
                        {sceneSchedule[key].sceneEvents[sceneId].map((event, eventKey) => (
                          <a
                            className={clsx(styles.events__scenes_row, 'd-flex', !isMobile ? styles.not_link : null)}
                            key={`${event.id}-${eventKey}`}
                            href={shareEventLink(event.id, 'share_event_connectcon_nft')}
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
    </>
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
  hideHeader: true,
}

export default ConnectconEvents
