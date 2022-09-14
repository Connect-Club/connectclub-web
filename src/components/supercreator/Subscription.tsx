import React, { useCallback, useEffect, useState } from 'react'
import { EditOutlined, LineChartOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import PropTypes from 'prop-types'

import { getSubscription, useSubscriptionEvents, useSubscriptionSummary } from '@/api/subscriptionApi'
import BackLink from '@/components/admin/common/BackLink'
import global_styles from '@/components/admin/css/admin.module.css'
import popup from '@/components/admin/InfoPopup'
import CreateEditSubscription from '@/components/supercreator/CreateEditSubscription'
import styles from '@/components/supercreator/supercreator.module.css'
import { Loader } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import type { Subscription } from '@/model/subscriptionModel'
import { CurrentUser } from '@/model/usersModel'

type Props = {
  args: string[]
  user?: CurrentUser
}

const SubscriptionPage: FC<Props> = ({ args }) => {
  const subscriptionId = args[0]
  const [isLoading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription>({} as Subscription)
  const [events, , isLoadingEvents] = useSubscriptionEvents(subscriptionId)
  const [summary, , isSummaryLoading] = useSubscriptionSummary(subscriptionId)

  const getSubscriptionData = useCallback(async () => {
    setLoading(true)
    const data = await getSubscription(subscriptionId)
    if (!data._cc_errors.length && data.data) {
      setSubscription(data.data.response)
    }
    setLoading(false)
  }, [subscriptionId])

  const onCopyLink = () => {
    popup.success('Copied!')
    navigator.clipboard.writeText('https://sadasdasd').then()
  }

  useEffect(() => {
    const getData = async () => {
      await getSubscriptionData()
    }
    getData().then()
  }, [getSubscriptionData, subscriptionId])

  return (
    <div className={global_styles.block}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className={'d-flex'}>
            <span className={clsx(global_styles.h3, 'd-flex align-items-center')}>
              <BackLink url='/supercreator'>Back</BackLink>
              {subscription.name} <br />
            </span>
            <div className={styles.right_block}>
              <div className={styles.subscription_price}>{subscription.price} / month</div>
              <div className={clsx(global_styles.hint)}>
                Created: {new Date(subscription.createdAt * 1000).toLocaleString()}
              </div>
            </div>
          </div>
          <div className={clsx(global_styles['mb-1'], global_styles.small)}>{subscription.description}</div>
          <div className={clsx(global_styles['mb-1'], styles.anticon_align_fix, 'd-flex align-items-center')}>
            <CreateEditSubscription onSuccess={getSubscriptionData} subscription={subscription}>
              <EditOutlined /> Edit subscription
            </CreateEditSubscription>
            <Link href={`/supercreator/statistics/${subscription.id}`}>
              <a title='Statistics' className={global_styles['ml-1']}>
                <LineChartOutlined /> Statistics
              </a>
            </Link>
            <div className={styles.subscription_total}>
              {isSummaryLoading ? (
                <Loader width={'16px'} height={'16px'} />
              ) : (
                <>
                  <Image src={'/img/svg/dollar.svg'} width={16} height={16} alt={'Total sales'} /> Total sales:{' '}
                  {summary?.totalSalesAmount || 0}
                </>
              )}
            </div>
          </div>

          <div className={global_styles['mb-1']}>
            <div className={global_styles.info_block}>
              Link to subscription: https://sadasdasd <Button onClick={onCopyLink}>Copy</Button>
            </div>
          </div>

          {isLoadingEvents ? (
            <Loader />
          ) : (
            <div>
              {events.length > 0 ? (
                <>
                  <p>List of all events:</p>
                  <div className={global_styles['mt-1']}>
                    <div className={styles.tr}>
                      <div className={clsx(styles.th, styles.name)}>Name</div>
                      <div className={styles.th}>Start</div>
                      <div className={styles.th}>End</div>
                      <div className={styles.th}>Listeners</div>
                    </div>
                    {events.map((event) => (
                      <div className={styles.tr} key={event.id}>
                        <div className={styles.name}>{event.title}</div>
                        <div>{new Date(event.date * 1000).toLocaleString()}</div>
                        <div>{new Date(event.dateEnd * 1000).toLocaleString()}</div>
                        <div>{event.listenerCount}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>You don&apos;t have any events yet. Use application to create it.</>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

SubscriptionPage.propTypes = {
  args: PropTypes.arrayOf(PropTypes.string),
  user: PropTypes.object,
}

export default SubscriptionPage
