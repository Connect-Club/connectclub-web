import React from 'react'
import Link from 'next/link'

import useModal from '../hooks/useModal'

import buttonClasses from './UI/button/Button.module.css'

const Header = () => {
  const [scrolled, setScrolled] = React.useState('')
  const { onToggle, isOpen, onClose } = useModal()

  const handleScroll = () => {
    if (window.scrollY > 500) {
      setScrolled(true)
    } else {
      setScrolled(false)
    }
  }

  const handleLinks = (e) => {
    const href = e.target.getAttribute('href')
    e.preventDefault()
    onClose()
    document.querySelector('html').classList.remove('hidden')
    document.querySelector(href).scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const onBurgerClick = () => {
    document.querySelector('html').classList.toggle('hidden')
    onToggle()
  }

  const links = [
    {
      title: 'About us',
      href: '#about',
    },
    {
      title: 'DAO',
      href: '#dao',
    },
    {
      title: 'Roadmap',
      href: '#roadmap',
    },
    {
      title: 'Clubs',
      href: '#clubs',
    },
    {
      title: 'Speakers',
      href: '#members',
    },
    {
      title: 'Team',
      href: '#team',
    },
    {
      title: 'FAQ',
      href: '#faq',
    },
    {
      title: 'Contacts',
      href: '#contacts',
    },
  ]

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={scrolled ? 'header header--sticky' : 'header'}>
      <div className='header__container container'>
        <Link href={'/'}>
          <a title={'Connect club'} target={'_blank'}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className='header__logo' src='/united-token-data/img/logo.svg' alt='Connect club' />
          </a>
        </Link>
        <div className={isOpen ? 'header__wrapper header__wrapper--active' : 'header__wrapper'}>
          <div className={isOpen ? 'header__body header__body--active' : 'header__body'}>
            <ul className='header__list'>
              {links.map((item, index) => (
                <li key={index} className='header__item'>
                  <a href={item.href} title={item.title} className='header__link' onClick={handleLinks}>
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
            <div className='header__block'>
              <a
                href='@/components/pages_components/dao/components/Header'
                className='header__link'
                target={'_blank'}
                rel={'noreferrer'}
                title={'White paper'}
              >
                White paper
              </a>
            </div>
            <a
              href={`mailto:info@connect.club?subject=${encodeURIComponent('Connect.Club DAO')}`}
              title={'Become a member'}
              className={`${buttonClasses.stnBtn} header__btn`}
            >
              Become a member
            </a>
          </div>
        </div>
        <button className={isOpen ? 'burger--open burger' : 'burger'} onClick={() => onBurgerClick()}>
          <div className='burger__line'></div>
          <div className='burger__line'></div>
          <div className='burger__line'></div>
        </button>
      </div>
    </header>
  )
}

export default Header
