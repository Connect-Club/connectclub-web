import { useEffect, useState } from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'

import { FullLogo } from '@/lib/svg'
import { FC } from '@/model/commonModel'

const Header: FC<unknown> = () => {
  const { t } = useTranslation('home')
  const [isMenuOpen, setMenuVisibility] = useState<boolean>(false)
  const router = useRouter()
  const menu = [
    { url: '/contacts', title: t('common:nav.contacts') },
    // { url: '/inviters', title: t('common:nav.inviters') },
    { url: '/privacy', title: t('common:nav.privacy') },
    { url: '/terms', title: t('common:nav.terms') },
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
      offsetTop = stickyHeader.offsetTop + 18,
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

  return (
    <header className='header container'>
      <div className='header__container d-flex'>
        <div className='logo'>
          <Link href='/'>
            <a title={t('common:logo-title')}>
              <FullLogo id='header' />
            </a>
          </Link>
        </div>
        <div className='header__menu_toggle d-block d-md-none'>
          <div className={clsx(isMenuOpen ? 'is-active' : '', 'hamburger hamburger--squeeze')} onClick={toggleMenu}>
            <div className='hamburger-box'>
              <div className='hamburger-inner' />
            </div>
          </div>
        </div>
        <nav>
          <ul>
            {menu.map((item) => (
              <li key={item.url} className={router.pathname === item.url ? 'selected' : undefined}>
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
    </header>
  )
}

export default Header
