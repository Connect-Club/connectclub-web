import React from 'react'
import clsx from 'clsx'
import moment from 'moment-timezone'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import useTranslation from 'next-translate/useTranslation'
import PropTypes from 'prop-types'

import styles from '@/components/festival/festival.module.css'
import HeaderNFT220222 from '@/components/festival/HeaderNFT220222'
import FestivalLayout from '@/components/layout/FestivalLayout'
import { convertTwoDigits } from '@/lib/helpers'
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
    sceneEvents: Array<SceneSheduleEvent>
  }
}

export const getStaticProps: GetStaticProps = async () => {
  const convertToTimezone = 'America/New_York'

  const sceneSchedule: SceneSchedule = {}

  /* Get scene schedule events by date */
  // const [events, errors] = await getFestivalEventsList({
  //     limit: 500,
  //     dateStart: dateStart,
  //     timezone: convertToTimezone,
  //     festivalCode: process.env.NEXT_PUBLIC_FESTIVAL_CODE3
  // });

  const events = [
    {
      id: 'fe21af96-7cfc-4e45-a8c6-73b9003e0878',
      title: 'Panel: Unusual Business in NFTs',
      description:
        'You don’t have to be a digital artist to succeed as an NFT entrepreneur. Moreover, non-fungible tokens are not just for crypto artists and collectors. There are many loads of applications for NFTs across dozens of industries, which shows that the virtual world is already here. \nOn this session experts will join the panel on NFTs and Unusual Business as part of NFT Festival “Regulations. Opportunities. Investments. Business and Hype”',
      date: 1645556400,
      dateEnd: 1645560000,
      festivalCode: 'connectcon-nft-business',
      festivalSceneId: '',
      festivalScene: null,
      link: 'https://app.connect.club/W0Im/ecff227c?deep_link_value=clubId_nft_eventId_0990a012-0b1b-430f-887d-1c5e2f961bbb&deep_link_sub1=|connectcon-schedule-1&af_r=https%3A%2F%2Fconnect.club%2Fclub%2Fnft%3Fid%3D0990a012-0b1b-430f-887d-1c5e2f961bbb%26utm_campaign%3Dconnectcon-schedule-1',
    },
    {
      id: 'fe21af96-7cfc-4e45-a8c6-73b9003e0879',
      title: 'Interview with Mike Butcher',
      description:
        'Making for a special one-of-a-kind event, Mike Butcher, Editor-At-Large at Tech Crunch will interview Robert Norton, CEO & Co-Founder of Verisart, Former CEO & Co-Founder at Saatchi Art  and Sedition Art.\n' +
        'This exclusive interview will highlight the major topics of the NFT space and bring essential answers to all of our questions.',
      date: 1645560000,
      dateEnd: 1645561800,
      festivalCode: 'connectcon-nft-business',
      festivalSceneId: '',
      festivalScene: null,
      link: 'https://app.connect.club/W0Im/ecff227c?deep_link_value=clubId_nft_eventId_0990a012-0b1b-430f-887d-1c5e2f961bbb&deep_link_sub1=|connectcon-schedule-2&af_r=https%3A%2F%2Fconnect.club%2Fclub%2Fnft%3Fid%3D0990a012-0b1b-430f-887d-1c5e2f961bbb%26utm_campaign%3Dconnectcon-schedule-2',
    },
    {
      id: 'fe21af96-7cfc-4e45-a8c6-73b9003e0880',
      title: 'Panel: NFTs are high risk, but high reward space',
      description:
        'Today, big corporations are aggressively spinning strategies to enter the new space. Big crypto investors are preoccupied with assessing the perfect time to buy a booming NFT. It indicates the importance of NFTs implications. However, NFTs also has been a controversial topic for many people.\n' +
        'On this session NFT experts will discuss the risks and rewards for investing in NFTs as part of NFT Festival “Regulations. Opportunities. Investments. Business and Hype.”',
      date: 1645561800,
      dateEnd: 1645565400,
      festivalCode: 'connectcon-nft-business',
      festivalSceneId: '',
      festivalScene: null,
      link: 'https://app.connect.club/W0Im/ecff227c?deep_link_value=clubId_nft_eventId_0990a012-0b1b-430f-887d-1c5e2f961bbb&deep_link_sub1=|connectcon-schedule-3&af_r=https%3A%2F%2Fconnect.club%2Fclub%2Fnft%3Fid%3D0990a012-0b1b-430f-887d-1c5e2f961bbb%26utm_campaign%3Dconnectcon-schedule-3',
    },
    {
      id: 'fe21af96-7cfc-4e45-a8c6-73b9003e0881',
      title: 'Gallery: From physical ART space to NFT world',
      description:
        'Some people see NFT as Art, some as crypto investment. So what brings the success: talented Art or good looking roadmap?\n' +
        'On this panel we’ll discuss what brings success to the NFT projects, how important is the background of the artist and what is NFT for artists from the physical Art world.',
      date: 1645565400,
      dateEnd: 1645569000,
      festivalCode: 'connectcon-nft-business',
      festivalSceneId: '',
      festivalScene: null,
      link: 'https://app.connect.club/W0Im/ecff227c?deep_link_value=clubId_nft_eventId_99daef29-aa62-4606-8e35-0e14f2fbae3a&deep_link_sub1=|connectcon-schedule-4&af_r=https%3A%2F%2Fconnect.club%2Fclub%2Fnft%3Fid%3D99daef29-aa62-4606-8e35-0e14f2fbae3a%26utm_campaign%3Dconnectcon-schedule-4',
    },
  ]

  const errors = []

  /* Scenes */
  // const [plainScenes, scenesErrors] = await getFestivalScenes(process.env.NEXT_PUBLIC_FESTIVAL_CODE3!);
  // const scenes = {} as Record<string, string>;
  // if (!scenesErrors.length && plainScenes.length) {
  //     plainScenes.forEach((scene) => {
  //         scenes[scene.id] = scene.sceneCode;
  //     });
  // }
  // const sceneIds = Object.keys(scenes);
  // const initialSceneEvents = sceneIds.reduce((accum, curVal) => {
  //     accum[curVal] = [];
  //     return accum;
  // }, {} as { [key: string]: Array<SceneSheduleEvent> });

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
  if (!errors.length && events.length) {
    events.forEach((event) => {
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
              sceneEvents: [],
            }
          }
          sceneSchedule[key].sceneEvents.push({
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
            // @ts-ignore
            link: event.link,
          })
        }
      }
    })
  }

  return {
    props: {
      sceneSchedule: sceneSchedule,
    },
    revalidate: 10,
  }
}

type Props = {
  sceneSchedule: SceneSchedule
  scenes: Record<string, string>
}
const ConnectconEvents: FCWithLayoutParams<Props> = ({ sceneSchedule }) => {
  const { t } = useTranslation('connectcon/nft-business/events')
  // const [isMobile, setIsMobile] = useState<boolean>(false);

  // const handleOnSceneEventClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  //     if (!isMobile && e.cancelable) {
  //         e.preventDefault()
  //     }
  // }

  // useEffect(() => {
  //     setIsMobile(isMobileDevice());
  // }, []);

  return (
    <>
      <HeaderNFT220222 />
      <div className='container'>
        <div className={styles.events__page}>
          <Head>
            <title>{t('title')}</title>
            <meta name='description' content={t('description')} />

            <meta property='og:image' content='/img/festival/nft-business/connectcon_preview.png' key={'ogimage'} />
            <meta property='og:image:type' content='image/png' key={'ogimagetype'} />
            <meta property='og:image:width' content='1372' key={'ogimagew'} />
            <meta property='og:image:height' content='252' key={'ogimageh'} />
          </Head>

          <div className={styles.events_time_wrapper}>
            <div className={styles.events__timeinterval_header}>{/*2 PM - 6 PM ET*/}</div>
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
                  <div className={styles.events__timeinterval_text}>ET-5</div>
                </div>
                <div className={clsx(styles.scenes_inner_wrapper, 'd-flex')}>
                  <div className={clsx(styles.events__scenes)}>
                    <div className={clsx(styles.events__scenes_item, styles[`events__scenes_scene_${1}`])}>
                      {/*<div className={styles.events__scenes_heading}>*/}
                      {/*    #{scenes[sceneId]}*/}
                      {/*</div> */}
                      {sceneSchedule[key].sceneEvents.map((event, eventKey) => (
                        <a
                          className={clsx(styles.events__scenes_row, 'd-flex')}
                          key={`${event.id}-${eventKey}`}
                          // @ts-ignore
                          href={event.link}
                          title={t('open_event')}
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
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// const isMobileDevice = () => {
//     try {
//         document.createEvent("TouchEvent");
//         return true;
//     } catch (e) {
//         return false;
//     }
// }

ConnectconEvents.propTypes = {
  sceneSchedule: PropTypes.object,
  scenes: PropTypes.object,
}

ConnectconEvents.getLayout = FestivalLayout
ConnectconEvents.getLayoutParams = {
  hideHeader: true,
}

export default ConnectconEvents
