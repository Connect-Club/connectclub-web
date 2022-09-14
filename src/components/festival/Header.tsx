import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'

import styles from '@/components/festival/festival.module.css'
import { BackLink } from '@/lib/svg'
import type { FC } from '@/model/commonModel'
import { FestivalLayoutProps } from '@/model/festivalModel'
import ConnectConLogo from '@/public/img/festival/svg/connectcon.svg'

type Props = Required<Omit<FestivalLayoutProps, 'hideHeader' | 'footerLogoColor'>>

const Header: FC<Props> = ({ showEventsInHeader, hideTimeline, linkInHeader }) => {
  const { t } = useTranslation('connectcon/1/common')
  const [isMenuOpen, setMenuVisibility] = useState<boolean>(false)
  const router = useRouter()
  const navRef = useRef<HTMLElement>(null)
  const menu = [
    { url: '/connectcon/1/events', title: t('nav.events') },
    { url: '/connectcon/1/speakers', title: t('nav.speakers') },
    { url: '/connectcon/1/contact', title: t('nav.contact') },
    // { url: '/connectcon/1/privacy', title: t('nav.privacy') }
  ]

  const toggleMenu = () => {
    const body = document && (document.querySelector('body') as HTMLBodyElement)
    if (isMenuOpen) {
      closeMenu()
    } else {
      body.classList.add('header__menu_opened')
    }
    setMenuVisibility(!isMenuOpen)
  }

  const closeMenu = () => {
    const body = document && (document.querySelector('body') as HTMLBodyElement)
    body.classList.remove('header__menu_opened')
    setMenuVisibility(false)
  }

  /* Sticky scroll */
  useEffect(() => {
    const stickyHeader = document.querySelector('.header') as HTMLElement,
      offsetTop = stickyHeader.offsetTop + 40,
      docBody = (document.documentElement || document.body.parentNode || document.body) as HTMLElement,
      hasOffset = window.pageYOffset !== undefined
    let scrollTop
    const handleScroll = () => {
      const body = document && (document.querySelector('body') as HTMLBodyElement)
      scrollTop = hasOffset ? window.pageYOffset : docBody.scrollTop
      if (scrollTop >= offsetTop) {
        body.classList.add('sticky-header')
      } else {
        body.classList.remove('sticky-header')
      }
    }
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  /* Close menu, when click outside the menu */
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    window.addEventListener('mousedown', handleMouseDown)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [navRef])

  return (
    <header
      className={clsx(
        'header container',
        showEventsInHeader ? styles.show_events_in_header : null,
        Object.keys(linkInHeader).length > 0 ? styles.link_in_header : null,
      )}
    >
      <div className='header__container container d-flex'>
        {Object.keys(linkInHeader).length === 0 ? (
          <div className={clsx('d-inline-flex cursor-pointer', styles.header__container_inner)} onClick={toggleMenu}>
            <div className='header__menu_toggle'>
              <div className={clsx(isMenuOpen ? 'is-active' : '', 'hamburger hamburger--squeeze')}>
                <div className='hamburger-box'>
                  <div className='hamburger-inner' />
                </div>
              </div>
            </div>
            <div className='logo'>
              <Image src={ConnectConLogo} width={135} height={12} alt='ConnectCon' />
            </div>
          </div>
        ) : (
          <div className='container'>
            <Link href={linkInHeader.backlink!}>
              <a title={t('connectcon/1/common:back')} className={styles.header__backlink}>
                <h1>
                  <BackLink size={40} color='#A5F981' /> {t(linkInHeader.name!)}
                </h1>
              </a>
            </Link>
          </div>
        )}
        <nav ref={navRef}>
          <ul>
            {menu.map((item) => (
              <li key={item.url} className={router.asPath === item.url ? 'selected' : undefined}>
                <Link href={item.url}>
                  <a title={item.title} onClick={closeMenu}>
                    {item.title}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {showEventsInHeader && (
        <>
          <div className={clsx('d-flex', styles.header__tabs)}>
            <div
              className={clsx(
                styles.header_tabs_tab,
                router.asPath !== '/connectcon/1/speakers' ? 'selected' : undefined,
              )}
            >
              <Link href='/connectcon/1/events'>
                <a title={t('tabs.events')}>{t('tabs.events')}</a>
              </Link>
            </div>
            <div
              className={clsx(
                styles.header_tabs_tab,
                router.asPath === '/connectcon/1/speakers' ? 'selected' : undefined,
              )}
            >
              <Link href='/connectcon/1/speakers'>
                <a title={t('tabs.speakers')}>{t('tabs.speakers')}</a>
              </Link>
            </div>
          </div>
          {!hideTimeline && (
            <div className={clsx(styles.header__timeline, 'd-flex')}>
              <div className={styles.header__timeline_month}>{t('header_month')}</div>
              <div
                className={clsx(
                  styles.header__timeline_day,
                  router.asPath === '/connectcon/1/events' ? 'selected' : undefined,
                )}
              >
                <Link href='/connectcon/1/events'>
                  <a title={`${t('header_month')}, 27`}>27</a>
                </Link>
              </div>
              <div
                className={clsx(
                  styles.header__timeline_day,
                  router.asPath === '/connectcon/1/events/28aug' ? 'selected' : undefined,
                )}
              >
                <Link href='/connectcon/1/events/28aug'>
                  <a title={`${t('header_month')}, 28`}>28</a>
                </Link>
              </div>
              <div
                className={clsx(
                  styles.header__timeline_day,
                  router.asPath === '/connectcon/1/events/29aug' ? 'selected' : undefined,
                )}
              >
                <Link href='/connectcon/1/events/29aug'>
                  <a title={`${t('header_month')}, 29`}>29</a>
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </header>
  )
}

export default Header
