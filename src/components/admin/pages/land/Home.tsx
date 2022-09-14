import React from 'react'
import { Button } from 'antd'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

import { useLands } from '@/api/landApi'
import global_styles from '@/components/admin/css/admin.module.css'
import { getUrlWithSizes } from '@/lib/helpers'
import { isAdmin } from '@/lib/store'
import { Loader } from '@/lib/svg'
import { isDevelopment } from '@/lib/utils'
import type { FC } from '@/model/commonModel'

const Home: FC = () => {
  const [lands, , isLoading] = useLands()
  const isUserAdmin = isAdmin()
  return (
    <>
      <p className={global_styles.h3}>List of all parcels</p>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {isUserAdmin && (
            <div>
              <Link href={'/admin/land/0'}>
                <a title={'Create parcel'}>
                  <Button type='primary'>+ Create new parcel</Button>
                </a>
              </Link>
            </div>
          )}
          {lands && lands.length > 0 && (
            <>
              {lands.map((sector) => (
                <div className={clsx(global_styles['mt-1'])} key={sector.sector}>
                  <hr />
                  <h4 className={clsx(global_styles.h3)}>Sector {sector.sector}</h4>
                  <div className={global_styles.tr}>
                    <div className={clsx(global_styles.th, global_styles.name)}>Name</div>
                    <div className={clsx(global_styles.th)}>Coords</div>
                    <div className={clsx(global_styles.th)}>For sale</div>
                    <div className={clsx(global_styles.th)}>Owner</div>
                    <div className={clsx(global_styles.th)}>Room</div>
                  </div>
                  {sector.parcels.map((parcel) => (
                    <div className={global_styles.tr} key={parcel.id}>
                      <div className={clsx(global_styles.name)}>
                        <Link href={`/admin/land/${parcel.id}`}>
                          <a title={parcel.name} className={'d-flex gutter-03 align-items-center'}>
                            {parcel.thumb && (
                              <div
                                className={'relative flex-shrink-0'}
                                style={{
                                  width: 50,
                                  height: 50,
                                }}
                              >
                                <Image
                                  src={getUrlWithSizes(parcel.thumb, 50, 50)}
                                  layout={'fill'}
                                  objectFit={'contain'}
                                  alt={'land'}
                                />
                              </div>
                            )}
                            <div>
                              {parcel.name || `<Parcel # ${parcel.number}>`}
                              {parcel.description && (
                                <div className={global_styles.hint} style={{ wordBreak: 'break-all' }}>
                                  {parcel.description}
                                </div>
                              )}
                            </div>
                          </a>
                        </Link>
                      </div>
                      <div>
                        <a
                          href={`https://${isDevelopment ? `stage.` : ``}connect.club/land/?id=${parcel.id}`}
                          target={'_blank'}
                          rel='noreferrer'
                          title={'Open on the map'}
                        >
                          ({parcel.x}, {parcel.y})
                        </a>
                      </div>
                      <div>{parcel.available ? 'Sale' : '-'}</div>
                      <div>{parcel.ownerUsername}</div>
                      <div>
                        {parcel.roomId ? (
                          <Link href={`/admin/rooms/${parcel.roomId}`}>
                            <a title={'Open room'} target={'_blank'}>
                              {parcel.roomId}
                            </a>
                          </Link>
                        ) : (
                          '-'
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </>
      )}
    </>
  )
}

export default Home
