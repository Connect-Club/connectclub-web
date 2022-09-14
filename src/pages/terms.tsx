import React from 'react'
import clsx from 'clsx'
import Head from 'next/head'
import useTranslation from 'next-translate/useTranslation'

import HeaderPublic from '@/components/HeaderPublic'
import public_styles from '@/css/public.module.css'
import { isDevelopment } from '@/lib/utils'
import { FC } from '@/model/commonModel'

const Terms: FC<unknown> = () => {
  const { t } = useTranslation('terms')
  return (
    <div className={clsx(public_styles.page__wrap)}>
      <Head>
        <title>{t('title')}</title>
        <meta name='description' content={t('description')} />

        <meta property='og:title' content={t('title')} />
        <meta property='og:description' content={t('description')} />
        <meta property='og:url' content={`https://${isDevelopment ? 'stage.' : ''}connect.club/terms`} />
      </Head>
      <HeaderPublic />
      <div className='block container'>
        <h1 className={clsx(public_styles.h1)}>{t('h1')}</h1>
        <h2>{t('h2')}</h2>
        <section>
          <div dangerouslySetInnerHTML={{ __html: t('intro') }} />
          <div dangerouslySetInnerHTML={{ __html: t(`contents`) }} />
        </section>
      </div>
    </div>
  )
}

export default Terms
