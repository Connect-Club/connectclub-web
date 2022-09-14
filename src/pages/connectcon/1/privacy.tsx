import React from 'react'
import clsx from 'clsx'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import useTranslation from 'next-translate/useTranslation'

import styles from '@/components/festival/festival.module.css'
import FestivalLayout from '@/components/layout/FestivalLayout'
import { FCWithLayoutParams } from '@/model/commonModel'

export const getStaticProps: GetStaticProps = () => {
  return {
    notFound: true,
  }
}

const ConnectconPrivacy: FCWithLayoutParams<never> = () => {
  const { t } = useTranslation('connectcon/1/privacy')
  return (
    <div className='container'>
      <Head>
        <title>{t('title')}</title>
        <meta name='description' content={t('description')} />

        <meta name='robots' content='noindex, nofollow' />
        <meta name='googlebot' content='noindex,nofollow' />
      </Head>
      <div className={clsx(styles.page_wrap)}>
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
      <style global jsx>{`
        body main {
          padding-top: 7rem !important;
        }
      `}</style>
    </div>
  )
}

ConnectconPrivacy.getLayout = FestivalLayout
ConnectconPrivacy.getLayoutParams = {
  linkInHeader: {
    name: 'connectcon/1/privacy:h1',
    backlink: '/connectcon/1/events',
  },
}

export default ConnectconPrivacy
