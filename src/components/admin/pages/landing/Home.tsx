import React from 'react'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'

import { useLandings } from '@/api/landingsApi'
import global_styles from '@/components/admin/css/admin.module.css'
import { Loader } from '@/lib/svg'
import { isDevelopment } from '@/lib/utils'
import type { FC } from '@/model/commonModel'

const Home: FC<unknown> = () => {
  const [landings, , isLoading] = useLandings()

  return (
    <>
      <p className={global_styles.h3}>List of all landings:</p>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {landings.length > 0 && (
            <div className={global_styles['mt-1']}>
              <div className={global_styles.tr}>
                <div className={clsx(global_styles.th, global_styles.name)}>Name</div>
                <div className={global_styles.th}>Status</div>
                <div className={global_styles.th}>Url</div>
                {/*<div className={styles.th} />*/}
              </div>
              {landings.map((landing) => (
                <div className={global_styles.tr} key={landing.id}>
                  <div className={clsx(global_styles.name)}>
                    <Link href={`/admin/landing/${landing.id}`}>
                      <a title={landing.name}>{landing.name || '<No name>'}</a>
                    </Link>
                  </div>
                  <div>
                    {landing.status === 'active' ? (
                      <div className={'d-flex align-items-center gutter-03'} style={{ color: 'green' }}>
                        <CheckCircleOutlined /> Active
                      </div>
                    ) : (
                      <div className={'d-flex align-items-center gutter-03'} style={{ color: 'gray' }}>
                        <CloseCircleOutlined /> Hidden
                      </div>
                    )}
                  </div>
                  <div>
                    {landing.status === 'active' ? (
                      <a
                        href={`https://${isDevelopment ? `stage.` : ``}connect.club/l/${landing.url}`}
                        target={'_blank'}
                        rel='noreferrer'
                      >
                        {landing.url}
                      </a>
                    ) : (
                      landing.url
                    )}
                  </div>
                  {/*<div><DeleteLanding id={landing.id} /></div>*/}
                </div>
              ))}
            </div>
          )}
          <div>
            <Link href={'/admin/landing/0'}>
              <a title={'Create new landing'}>
                <Button type='primary'>+ Create new landing</Button>
              </a>
            </Link>
          </div>
        </>
      )}
    </>
  )
}

export default Home
