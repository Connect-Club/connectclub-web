import React, { useEffect, useState } from 'react'
import amplitude from 'amplitude-js'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'

import styles from '@/css/home.module.css'
import public_styles from '@/css/public.module.css'
import { FullLogo } from '@/lib/svg'
import { getHrefUTM, isDevelopment } from '@/lib/utils'
import { FC } from '@/model/commonModel'

const Error404: FC = () => {
  const amplitudeKey = isDevelopment ? '4b60a0a8667ea48921f95986cf1e2e55' : '9eaaf824819a859f6180b3125d8e876b'
  const [amplitudeInst, setAmplitude] = useState<typeof amplitude | null>(null)
  const { t } = useTranslation('common')
  const router = useRouter()

  useEffect(() => {
    if (router.isReady) {
      const amplitudeParams = Object.assign(
        {},
        {
          page: router.asPath,
        },
        getHrefUTM(router),
      )

      if (amplitudeInst) {
        amplitudeInst.getInstance().init(amplitudeKey, undefined, {
          saveEvents: true,
          includeReferrer: true,
        })
      }

      queueMicrotask(() => {
        amplitudeInst && amplitudeInst.getInstance().logEvent('error404', amplitudeParams)
      })
    }
  }, [amplitudeInst, amplitudeKey, router])

  useEffect(() => {
    import('amplitude-js').then((mod) => setAmplitude(mod.default))
  }, [])

  return (
    <div className='block container mt-1 align-center' style={{ paddingBottom: '15rem' }}>
      <div className={clsx('d-flex align-items-center gutter-1 justify-content-center', styles.error_page_logo)}>
        <Link href='/'>
          <a title='Connect club' style={{ width: '170px' }}>
            <FullLogo id='header' />
          </a>
        </Link>
      </div>
      <h1 className={'align-center'}>{t('error404.title')}</h1>
      <div className={clsx('second-black', styles.error_page_description)}>{t('error404.description')}</div>
      <div className='mt-1'>
        <Link href={'/'}>
          <a className={clsx('button', styles.error_page_button)} title={t('error404.button')}>
            {t('error404.button')}
          </a>
        </Link>
      </div>
      <style global jsx>{`
        .${public_styles.footer} {
          position: absolute;
          bottom: 0;
          width: 100%;
        }
        @media screen and (min-width: 320px) and (max-width: 767px) and (orientation: landscape) {
          body {
            position: relative;
          }
        }
      `}</style>
    </div>
  )
}

export default Error404
