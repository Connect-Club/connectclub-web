import React, { useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'

import FestivalLayout from '@/components/layout/FestivalLayout'
import { FCWithLayout } from '@/model/commonModel'

const ConnectconIndex: FCWithLayout<never> = () => {
  const { t } = useTranslation('connectcon/2/home')
  const router = useRouter()

  useEffect(() => {
    router.push('/connectcon/2')
  }, [router])

  return (
    <div className='container'>
      <Head>
        <title>{t('title')}</title>
        <meta name='description' content={t('description')} />
      </Head>
    </div>
  )
}

ConnectconIndex.getLayout = FestivalLayout

export default ConnectconIndex
