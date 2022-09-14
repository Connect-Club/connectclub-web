import React, { useEffect, useState } from 'react'
import { CheckCircleOutlined, CloseCircleOutlined, ShareAltOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import { getClubEvents, useClubEvents } from '@/api/clubApi'
import global_styles from '@/components/admin/css/admin.module.css'
import CreateShortEventLink from '@/components/admin/pages/club/CreateShortEventLink'
import { Loader } from '@/lib/svg'
import { Club } from '@/model/clubModel'
import { FC } from '@/model/commonModel'

type Props = {
  id: Club['id']
  club: Club
}
const ClubEvents: FC<Props> = ({ id, club }) => {
  const limit = 100
  const [events, isLoading, setEvents, eventsLastValue] = useClubEvents(id, {
    limit,
  })

  const [isTableLoading, setTableLoading] = useState<boolean>(false)
  const [lastValue, setLastValue] = useState<number | null>(0)
  const [total, setTotal] = useState<number>(0)

  /* Lazy load */
  const onLoadMore = async () => {
    setTableLoading(true)

    const r = await getClubEvents(id, { limit, lastValue })

    setTableLoading(false)
    if (!r._cc_errors.length && r.data !== null && r.data?.response?.items) {
      const updatedRequests = r.data.response.items
      if (!lastValue) {
        setEvents(updatedRequests)
        setTotal(updatedRequests.length)
      } else {
        setEvents((prevValue) => {
          const newValue = [...prevValue, ...updatedRequests]
          setTotal(newValue.length)
          return newValue
        })
      }
      setLastValue(r.data.response.lastValue)
    }
  }

  useEffect(() => {
    if (events.length > total) {
      setTotal(events.length)
    }
  }, [events.length, total])

  useEffect(() => {
    setLastValue(eventsLastValue)
  }, [eventsLastValue])

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className={clsx(global_styles['m-1'], isTableLoading ? global_styles['is-loading'] : '')}>
            {events.length > 0 ? (
              <>
                <div className={global_styles.tr}>
                  <div className={clsx(global_styles.th, global_styles.name)}>Name</div>
                  <div className={global_styles.th}>Only members</div>
                  <div className={global_styles.th}>Start</div>
                  <div className={global_styles.th}>End</div>
                  <div className={global_styles.th}>Participants</div>
                  <div className={global_styles.th}>Share</div>
                </div>
                {events.map((event) => (
                  <div className={global_styles.tr} key={event.id}>
                    <div className={global_styles.name}>
                      {event.title}
                      {event.description && (
                        <div className={global_styles.hint} style={{ overflowWrap: 'break-word' }}>
                          {event.description}
                        </div>
                      )}
                    </div>
                    <div>
                      {event.forMembersOnly ? (
                        <div className={'d-flex align-items-center gutter-03'} style={{ color: 'green' }}>
                          <CheckCircleOutlined />
                        </div>
                      ) : (
                        <div className={'d-flex align-items-center gutter-03'} style={{ color: 'gray' }}>
                          <CloseCircleOutlined />
                        </div>
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
                    <div>
                      <CreateShortEventLink
                        eventName={event.title}
                        clubSlug={club.slug}
                        clubId={club.id}
                        eventId={event.id}
                      >
                        <ShareAltOutlined style={{ fontSize: '20px' }} />
                      </CreateShortEventLink>
                    </div>
                  </div>
                ))}
                {lastValue !== null && lastValue > 0 && (
                  <Button className={global_styles['mt-1']} onClick={onLoadMore}>
                    Load more
                  </Button>
                )}
              </>
            ) : (
              'It looks like there are no any events.'
            )}
          </div>
        </>
      )}
    </>
  )
}

ClubEvents.propTypes = {
  id: PropTypes.string.isRequired,
  club: PropTypes.object.isRequired,
}

export default ClubEvents
