import React from 'react'
import clsx from 'clsx'
import moment from 'moment-timezone'

import global_styles from '@/components/admin/css/admin.module.css'
import LineChartAnalytics from '@/components/admin/pages/analytics/LineChartAnalytics'
import type { FC } from '@/model/commonModel'

const Home: FC = () => {
  const WauXAxisFormatter = (i: number, data: string[], timeZone: string) => {
    const formatDate = (value: string) => moment(value).tz(timeZone).format('MMM DD')
    return (
      formatDate(data[i]) +
      ' - ' +
      (data[i + 1]
        ? formatDate(
            moment(data[i + 1])
              .tz(timeZone)
              .subtract(1, 'days')
              .format('YYYY-MM-DD'),
          )
        : '...')
    )
  }

  return (
    <>
      <div className={global_styles.block}>
        <section className={clsx(global_styles.widget, global_styles.widget_fullwidth)}>
          <header>Daily active users (DAU):</header>
          <div className={global_styles.widget__content}>
            <LineChartAnalytics
              amplitudeChartId='dg20kqq'
              lineProps={[
                { name: 'Any event', color: '#8884d8' },
                { name: 'Join room', color: '#82ca9d' },
              ]}
              xAxisFormat={'MMM DD'}
            />
          </div>
        </section>
        <section className={clsx(global_styles.widget, global_styles.widget_fullwidth, global_styles.mt_2)}>
          <header>Weekly active users (WAU):</header>
          <div className={global_styles.widget__content}>
            <LineChartAnalytics
              amplitudeChartId='b5xx1vk'
              lineProps={[
                { name: 'Any event', color: '#8884d8' },
                { name: 'Join room', color: '#82ca9d' },
              ]}
              xAxisFormat={WauXAxisFormatter}
            />
          </div>
        </section>
        <section className={clsx(global_styles.widget, global_styles.widget_fullwidth, global_styles.mt_2)}>
          <header>Monthly active users (MAU):</header>
          <div className={global_styles.widget__content}>
            <LineChartAnalytics
              amplitudeChartId='ucooqhk'
              lineProps={[
                { name: 'Any event', color: '#8884d8' },
                { name: 'Join room', color: '#82ca9d' },
              ]}
              xAxisFormat={"MMM 'YY"}
            />
          </div>
        </section>
      </div>
    </>
  )
}

export default Home
