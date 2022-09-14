import React, { useEffect } from 'react'
import { NextPage } from 'next'
import type { AppProps } from 'next/app'
import Router, { useRouter } from 'next/router'
import NProgress from 'nprogress'
import Cookies from 'universal-cookie'

// import '@/lib/wdyr';
import PublicLayout from '@/components/layout/PublicLayout'
import { Provider, useCreateStore } from '@/lib/store'
import { isDevelopment } from '@/lib/utils'
import type { FC } from '@/model/commonModel'
import { FestivalLayoutProps } from '@/model/festivalModel'

import '@/css/reset.css'
import '@/css/global.css'

type PageWithLayout = NextPage & {
  getLayout: React.ComponentType
  getLayoutParams: FestivalLayoutProps
}

declare const window: Window & {
  gtag: any
  dataLayer: any
}

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

const App: FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  const PageLayout = (Component as PageWithLayout).getLayout || PublicLayout
  const layoutParams = (Component as PageWithLayout).getLayoutParams || {}

  const router = useRouter()

  /* Save token data to cookies */
  if (typeof window !== 'undefined') {
    const cookies = new Cookies()
    if (pageProps.isLoggedIn && !pageProps.error && Object.keys(pageProps.ccUser).length > 0) {
      cookies.set('cc_user', pageProps.ccUser, { path: '/' })
    } else if ('isLoggedIn' in pageProps && !pageProps.isLoggedIn) {
      cookies.remove('cc_user')
    }
  }

  /* Initialize global store */
  const createStore = useCreateStore(
    pageProps.isLoggedIn && Object.keys(pageProps.user).length > 0 ? { user: pageProps.user } : {},
  )

  /* Google analytics and GTM */
  useEffect(() => {
    if (!isDevelopment) {
      const handleRouteChange = (url: string) => {
        if (typeof window.gtag !== 'undefined') {
          window.gtag('config', 'G-J8PBR72YD2', {
            page_path: url,
          })
          window.gtag('config', 'UA-124394398-3')
        }
        typeof window.dataLayer !== 'undefined' &&
          window.dataLayer.push({
            event: 'pageview',
            page: url,
          })
      }
      router.events.on('routeChangeComplete', handleRouteChange)
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange)
      }
    }
  }, [router.events])

  return (
    <Provider createStore={createStore}>
      <PageLayout {...layoutParams}>
        <Component {...pageProps} />
      </PageLayout>
    </Provider>
  )
}

export default App
