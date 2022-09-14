import React from 'react'
import { CloseCircleOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

import { useClubsObject } from '@/api/clubApi'
import { useFestivalEventsList } from '@/api/festivalApi'
import global_styles from '@/components/admin/css/admin.module.css'
import DeleteEventButton from '@/components/admin/pages/festival/DeleteEventButton'
import styles from '@/components/admin/pages/festival/festival.module.css'
import { getUrlWithSizes } from '@/lib/helpers'
import { Delete, Loader } from '@/lib/svg'
import { FC } from '@/model/commonModel'

const FestivalEventList: FC<unknown> = () => {
  // const [scenes, setScenes] = useState<Record<string, string>>({});

  const festivalCode = process.env.NEXT_PUBLIC_FESTIVAL_CODE3!

  /* Get all festival events */
  const [events, , isEventsLoading, setEvents] = useFestivalEventsList({
    limit: 500,
    festivalCode,
  })

  const [clubs] = useClubsObject({ limit: 1000 })

  /* Scenes */
  // const [plainScenes, , isSceneLoading] = useFestivalScenes(festivalCode);
  //
  // useEffect(() => {
  //     if (!isSceneLoading && plainScenes && plainScenes.length) {
  //         const formattedScenes = {} as Record<string, string>;
  //         plainScenes.forEach(scene => {
  //             formattedScenes[scene.id] = scene.sceneCode;
  //         });
  //         setScenes(formattedScenes);
  //
  //     }
  // }, [plainScenes, isSceneLoading]);

  return (
    <>
      <p className={global_styles.h3}>List of all Festival events:</p>
      {isEventsLoading ? (
        <Loader />
      ) : (
        <>
          {events.length > 10 && (
            <div>
              <Link href='/admin/festival/0' passHref shallow={true}>
                <Button type='primary'>+ Add new event</Button>
              </Link>
            </div>
          )}
          {events.length > 0 && (
            <div className='align-right'>
              <em>Total events: {events.length}</em>
            </div>
          )}
          <div className={clsx(global_styles['m-1'], styles.event_list)}>
            {events.length > 0 ? (
              <>
                <div className={styles.tr}>
                  <div className={clsx(styles.th, styles.event_name)}>Name</div>
                  {/*<div className={styles.th}>Scene</div>*/}
                  <div className={styles.th}>Club</div>
                  <div className={styles.th}>Start</div>
                  <div className={styles.th}>End</div>
                  <div className={styles.th}>Speakers</div>
                  <div className={styles.delete_icon}>
                    <a title='Delete event' className={global_styles.invisible}>
                      <Delete />
                    </a>
                  </div>
                </div>
                {events.map((event, index) => (
                  <div className={styles.tr} key={event.id}>
                    <div className={styles.event_name}>
                      {(event?.club?.id &&
                        clubs?.[event.club.id]?.clubRole &&
                        ['moderator', 'owner'].includes(clubs[event.club.id].clubRole!)) ||
                      !event?.club?.id ? (
                        <Link href={`/admin/festival/${event.id}`} shallow={true}>
                          <a title='Open event'>{event.title}</a>
                        </Link>
                      ) : (
                        <div className={'d-flex align-items-center gutter-03'}>
                          <Tooltip title={"Club event. You don't have enough rights to edit it"}>
                            <CloseCircleOutlined color='#faad14' />
                          </Tooltip>
                          {event.title}
                        </div>
                      )}
                    </div>
                    {/*<div>{scenes?.[event.festivalScene.id]}</div>*/}
                    <div>
                      {event?.club?.id && clubs?.[event.club.id] && (
                        <Tooltip title={clubs[event.club.id].title}>
                          {clubs[event.club.id].avatar ? (
                            <div
                              className={'relative flex-shrink-0'}
                              style={{
                                width: 50,
                                height: 50,
                              }}
                            >
                              <Image
                                src={getUrlWithSizes(clubs[event.club.id].avatar!, 50, 50)}
                                layout={'fill'}
                                objectFit={'contain'}
                                alt={'club image'}
                              />
                            </div>
                          ) : (
                            clubs[event.club.id].title
                          )}
                        </Tooltip>
                      )}
                    </div>
                    <div>{new Date(event.date * 1000).toLocaleString()}</div>
                    <div>{new Date(event.dateEnd * 1000).toLocaleString()}</div>
                    <div>
                      {event.participants.length &&
                        event.participants.map((speaker) => (
                          <div key={speaker.id}>
                            {speaker.displayName}: <span className={global_styles.hint}>#{speaker.id}</span>
                          </div>
                        ))}
                    </div>
                    <div className={styles.delete_icon}>
                      <DeleteEventButton
                        id={event.id}
                        onSuccess={() => setEvents((oldValue) => oldValue && oldValue.filter((el, i) => i !== index))}
                      />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              'It looks like there are no any events.'
            )}
            <div className={global_styles['mt-1']}>
              <Link href='/admin/festival/0' passHref shallow={true}>
                <Button type='primary'>+ Add new event</Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default FestivalEventList
