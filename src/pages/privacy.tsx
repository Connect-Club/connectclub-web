import React from 'react'
import clsx from 'clsx'
import Head from 'next/head'
import useTranslation from 'next-translate/useTranslation'

import HeaderPublic from '@/components/HeaderPublic'
import public_styles from '@/css/public.module.css'
import { isDevelopment } from '@/lib/utils'
import { FC } from '@/model/commonModel'

const Privacy: FC<unknown> = () => {
  const { t } = useTranslation('privacy')
  return (
    <div className={clsx(public_styles.page__wrap)}>
      <Head>
        <title>{t('title')}</title>
        <meta name='description' content={t('description')} />

        <meta property='og:title' content={t('title')} />
        <meta property='og:description' content={t('description')} />
        <meta property='og:url' content={`https://${isDevelopment ? 'stage.' : ''}connect.club/privacy`} />
      </Head>
      <HeaderPublic />
      <div className='block container'>
        <h1 className={clsx(public_styles.h1)}>{t('h1')}</h1>
        <h2>{t('h2')}</h2>
        <section>
          <div dangerouslySetInnerHTML={{ __html: t('intro') }} />
          {[
            'first_block',
            'second_block',
            'third_block',
            'fourth_block',
            'fifth_block',
            'sixth_block',
            'seventh_block',
            'eighth_block',
            'ninth_block',
            'tenth_block',
          ].map((block) => {
            return (
              <article className='mt-6' key={block}>
                <h3 className='second-black uppercase'>{t(`${block}.header`)}</h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: t(`${block}.description`),
                  }}
                />
              </article>
            )
          })}

          <div className='mt-6 mb-sm' dangerouslySetInnerHTML={{ __html: t(`contact.header`) }} />
          <div dangerouslySetInnerHTML={{ __html: t(`contact.description`) }} />
        </section>
      </div>
    </div>
  )
}

export default Privacy
