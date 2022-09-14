import React, { useEffect, useState } from 'react'
import { CloseCircleOutlined } from '@ant-design/icons'
import { Button, Tag, Tooltip } from 'antd'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { getClubs, useClubs } from '@/api/clubApi'
import global_styles from '@/components/admin/css/admin.module.css'
import ClubSearch, { ClubSearchResult } from '@/components/admin/pages/club/ClubSearch'
import { getAvatar, getHumanDate, getUrlWithSizes } from '@/lib/helpers'
import { Loader } from '@/lib/svg'
import { isDevelopment } from '@/lib/utils'
import type { FC } from '@/model/commonModel'

const Home: FC = () => {
  const limit = 50
  const router = useRouter()

  const [clubs, isLoading, setClubs, clubsLastValue, clubsTotalCount] = useClubs({ limit })
  const [lastValue, setLastValue] = useState<number | null>(0)
  const [isMoreLoading, setMoreLoading] = useState<boolean>(false)

  /* Lazy load */
  const onLoadMore = async () => {
    await updateClubs(lastValue || 0)
  }

  const updateClubs = async (lastId = 0) => {
    setMoreLoading(true)

    const r = await getClubs({ limit, lastValue: lastId })

    setMoreLoading(false)
    if (!r._cc_errors.length && r.data !== null && r.data?.response?.items) {
      const updatedClubs = r.data.response.items
      if (!lastId) {
        setClubs(updatedClubs)
      } else {
        setLastValue(r.data.response.lastValue)
        setClubs((prevValue) => [...prevValue, ...updatedClubs])
      }
    }
  }

  const onClubSelect = async (value: ClubSearchResult) => {
    if (value.value) {
      await router.push(`/admin/club/${value.value}`)
    }
  }

  useEffect(() => {
    setLastValue(clubsLastValue)
  }, [clubsLastValue])

  return (
    <>
      <p className={global_styles.h3}>
        List of all clubs
        {!isLoading && (
          <>
            {` `}({clubsTotalCount})
          </>
        )}
        :
      </p>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {clubs.length > 10 && (
            <div>
              <Link href={'/admin/club/0'}>
                <a title={'Create new club'}>
                  <Button type='primary'>+ Create new club</Button>
                </a>
              </Link>
            </div>
          )}
          <div className={global_styles.mt_1}>
            <ClubSearch onChange={onClubSelect} style={{ width: '400px' }} />
          </div>
          {clubs.length > 0 && (
            <div className={clsx(global_styles['mt-1'], isMoreLoading ? global_styles['is-loading'] : null)}>
              <div className={global_styles.tr}>
                <div className={clsx(global_styles.th, global_styles.name)}>Name</div>
                <div className={clsx(global_styles.th, 'align-center')}>Slug</div>
                <div className={clsx(global_styles.th, 'align-center')}>Participants</div>
                <div className={clsx(global_styles.th, 'align-center', 'flex-0')}>Role</div>
                <div className={clsx(global_styles.th, 'align-center')}>Interests</div>
                <div className={clsx(global_styles.th, 'align-center')}>Created</div>
                <div className={global_styles.th}>Owner</div>
              </div>
              {clubs.map((club) => (
                <div className={global_styles.tr} key={club.id}>
                  <div className={clsx(global_styles.name)}>
                    <Link href={`/admin/club/${club.id}`}>
                      <a title={club.title} className={'d-flex gutter-03 align-items-center'}>
                        {club.avatar && (
                          <div
                            className={'relative flex-shrink-0'}
                            style={{
                              width: 50,
                              height: 50,
                            }}
                          >
                            <Image
                              src={getUrlWithSizes(club.avatar, 50, 50)}
                              layout={'fill'}
                              objectFit={'contain'}
                              alt={'club image'}
                            />
                          </div>
                        )}
                        <div>
                          {club.title}
                          {club.description && (
                            <div className={global_styles.hint} style={{ wordBreak: 'break-all' }}>
                              {club.description}
                            </div>
                          )}
                        </div>
                      </a>
                    </Link>
                  </div>
                  <div className={'align-center'}>
                    <a
                      href={`https://${isDevelopment ? `stage.` : ``}connect.club/club/${club.slug}`}
                      target={'_blank'}
                      rel='noreferrer'
                      title={'Go to web version'}
                    >
                      {club.slug}
                    </a>
                  </div>
                  <div className={'align-center'}>{club.countParticipants}</div>
                  <div className={'align-center flex-0'}>
                    {club.clubRole ? (
                      <Tooltip title={club.clubRole}>
                        <Tag
                          color={
                            club.clubRole === 'owner'
                              ? '#fa541c'
                              : club.clubRole === 'moderator'
                              ? '#096dd9'
                              : '#8c8c8c'
                          }
                          className={global_styles.capitalize}
                        >
                          {club.clubRole?.substring(0, 3)}
                        </Tag>
                      </Tooltip>
                    ) : (
                      <Tooltip title={`You don't belong to the club`}>
                        <CloseCircleOutlined />
                      </Tooltip>
                    )}
                  </div>
                  <div className={'align-center'}>
                    {club.interests.length > 0 ? (
                      <Tooltip
                        title={club.interests.map((interest, i) => (
                          <div key={i}>{interest.name}</div>
                        ))}
                      >
                        <div>{club.interests.length}</div>
                      </Tooltip>
                    ) : (
                      0
                    )}
                  </div>
                  <div>{getHumanDate(club.createdAt)}</div>
                  <div>
                    <Link href={`/admin/users?id=${club.owner.id}`}>
                      <a className='d-flex align-items-center gutter-03 flex-flow-wrap'>
                        {getAvatar(club.owner, 32, '', { marginRight: 0 })}
                        <span className={global_styles.small}>(# {club.owner.id})</span>
                        <div style={{ width: '100%' }}>{club.owner.displayName}</div>
                      </a>
                    </Link>
                  </div>
                </div>
              ))}
              {lastValue !== null && (
                <Button className={global_styles['my-1']} onClick={onLoadMore}>
                  Load more
                </Button>
              )}
            </div>
          )}
          <div>
            <Link href={'/admin/club/0'}>
              <a title={'Create new club'}>
                <Button type='primary'>+ Create new club</Button>
              </a>
            </Link>
          </div>
        </>
      )}
    </>
  )
}

export default Home
