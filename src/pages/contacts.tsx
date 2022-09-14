import React from 'react'
import clsx from 'clsx'
import Head from 'next/head'
import useTranslation from 'next-translate/useTranslation'

import HeaderPublic from '@/components/HeaderPublic'
import styles from '@/css/contacts.module.css'
import public_styles from '@/css/public.module.css'
import { isDevelopment } from '@/lib/utils'
import { FC } from '@/model/commonModel'

const Contacts: FC<unknown> = () => {
  const { t } = useTranslation('contacts')

  return (
    <>
      <Head>
        <title>{t('title')}</title>
        <meta name='description' content={t('description')} />
        <meta property='og:title' content={t('title')} />
        <meta property='og:description' content={t('description')} />
        <meta property='og:url' content={`https://${isDevelopment ? 'stage.' : ''}connect.club/contacts`} />
      </Head>
      <div className={clsx(public_styles.page__wrap)}>
        <HeaderPublic />
        <div className='container'>
          <h1 className={clsx(public_styles.h1)}>{t('h1')}</h1>
        </div>
        <div className='block container'>
          {['address', 'email'].map((column) => (
            <section key={column} className={styles.contact_column}>
              <h2>{t(`columns.${column}.heading`)}</h2>
              <p
                dangerouslySetInnerHTML={{
                  __html: t(`columns.${column}.content`),
                }}
              />
            </section>
          ))}
        </div>
      </div>
    </>
  )
}

export default Contacts
