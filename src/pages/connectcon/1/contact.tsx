import React from 'react'
import clsx from 'clsx'
import Head from 'next/head'
import useTranslation from 'next-translate/useTranslation'

import styles from '@/components/festival/festival.module.css'
import FestivalLayout from '@/components/layout/FestivalLayout'
import { FCWithLayoutParams } from '@/model/commonModel'

const ConnectconContact: FCWithLayoutParams<never> = () => {
  const { t } = useTranslation('connectcon/1/contact')

  const columns = [
    {
      code: 'address',
      icon: '',
    },
    {
      code: 'email',
      icon: '',
    },
  ]

  return (
    <div className='container'>
      <Head>
        <title>{t('title')}</title>
        <meta name='description' content={t('description')} />
        <meta name='robots' content='noindex, nofollow' />
        <meta name='googlebot' content='noindex,nofollow' />
      </Head>
      <div className={clsx('d-flex flex-flow-wrap', styles.page_wrap)}>
        {columns.map((column) => (
          <section key={column.code} className={styles.contact_column}>
            <h2>{t(`columns.${column.code}.heading`)}</h2>
            <p
              dangerouslySetInnerHTML={{
                __html: t(`columns.${column.code}.content`),
              }}
            />
          </section>
        ))}
      </div>
      <style global jsx>{`
        body main {
          padding-top: 7rem !important;
        }
      `}</style>
    </div>
  )
}

ConnectconContact.getLayout = FestivalLayout
ConnectconContact.getLayoutParams = {
  linkInHeader: {
    name: 'connectcon/1/contact:h1',
    backlink: '/connectcon/1/events',
  },
}

export default ConnectconContact
