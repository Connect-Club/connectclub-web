import React, { useEffect, useMemo, useState } from 'react'
import CountUp from 'react-countup'
import clsx from 'clsx'
import moment from 'moment-timezone'
import PropTypes from 'prop-types'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useSubscription, useSubscriptionChart, useSubscriptionSummary } from '@/api/subscriptionApi'
import BackLink from '@/components/admin/common/BackLink'
import global_styles from '@/components/admin/css/admin.module.css'
import styles from '@/components/supercreator/supercreator.module.css'
import { Loader } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { CurrentUser } from '@/model/usersModel'

type ChartData = Array<{
  name: string
  uv: number
}>

type Props = {
  args: string[]
  user?: CurrentUser
}

const SubscriptionStatistics: FC<Props> = ({ args }) => {
  const subscriptionId = args[0]

  const timeZone = 'Europe/Moscow'
  const overview = 'day'
  const type = 'quantity'

  const [subscription, , isLoadingSubscription] = useSubscription(subscriptionId)
  const [summary, , isSummaryLoading] = useSubscriptionSummary(subscriptionId)
  const [chart, , isChartLoading] = useSubscriptionChart(subscriptionId, 0, 0, timeZone, overview, type)
  const [chartData, setChartData] = useState<ChartData>([] as ChartData)

  useEffect(() => {
    if (!isChartLoading && chart?.values?.length) {
      setChartData(
        chart.values.map((column) => ({
          // @ts-ignore
          name: moment(column.x * 1000)
            .tz(timeZone)
            .format(overview === 'day' ? 'DD.MM' : 'MMMM'),
          uv: column.y,
        })),
      )
    }
  }, [chart?.values, isChartLoading])

  // eslint-disable-next-line react/display-name
  const TotalQuantity = useMemo(
    () => () =>
      (
        <ResponsiveContainer width='100%' height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line type='monotone' dataKey='uv' stroke='#8884d8' />
            <CartesianGrid stroke='#ccc' strokeDasharray='5 5' />
            <XAxis dataKey='name' />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value: any) => [value, 'subscribers']} />
          </LineChart>
        </ResponsiveContainer>
      ),
    [chartData],
  )

  return (
    <div className={global_styles.block}>
      <div className={global_styles['mb-1']}>
        <span className={clsx(global_styles.h3, 'd-flex align-items-center')}>
          <BackLink url={`/supercreator/${subscriptionId}`}>Back</BackLink>
          Statistics
          {isLoadingSubscription ? <Loader width={'16px'} height={'16px'} /> : <>&quot;{subscription?.name}&quot;</>}
        </span>
      </div>

      {isLoadingSubscription ? (
        <Loader />
      ) : (
        <div className={global_styles['mb-1']}>
          <div className={'d-flex flex-flow-wrap gutter-1 flex-1'}>
            <section className={styles.widget}>
              <header>Total sales</header>
              <div className={styles.widget__content}>
                {isSummaryLoading ? (
                  <Loader width={'16px'} height={'16px'} />
                ) : (
                  <CountUp end={Number(summary?.totalSalesAmount || 0)} duration={2} prefix={'$'} />
                )}
              </div>
            </section>
            <section className={styles.widget}>
              <header>Total amount of sales</header>
              <div className={styles.widget__content}>
                {isSummaryLoading ? (
                  <Loader width={'16px'} height={'16px'} />
                ) : (
                  <CountUp end={Number(summary?.totalSalesCount || 0)} duration={1.5} />
                )}
              </div>
            </section>
            <section className={styles.widget}>
              <header>Active subscriptions</header>
              <div className={styles.widget__content}>
                {isSummaryLoading ? (
                  <Loader width={'16px'} height={'16px'} />
                ) : (
                  <CountUp end={Number(summary?.activeSubscriptions || 0)} duration={1.8} />
                )}
              </div>
            </section>
            <section className={clsx(styles.widget, styles.widget_fullwidth)}>
              <header>Number of subscribers:</header>
              <div className={styles.widget__content}>
                {isSummaryLoading ? <Loader width={'16px'} height={'16px'} /> : <TotalQuantity />}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

SubscriptionStatistics.propTypes = {
  args: PropTypes.arrayOf(PropTypes.string),
}

export default SubscriptionStatistics
