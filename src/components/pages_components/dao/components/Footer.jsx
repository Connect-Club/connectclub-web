import React from 'react'
import Link from 'next/link'

const Footer = () => {
  return (
    <footer className='footer'>
      <div className='footer__container container'>
        <Link href={'/'}>
          <a title={'Connect club'} target={'_blank'}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src='/united-token-data/img/footer-logo.svg' alt='Connect club' className='footer__logo' />
          </a>
        </Link>
        <div className='footer__content'>
          <ul className='footer__link-list'>
            <Link href={'/privacy'}>
              <a target='_blank' rel='noreferrer' className='footer__link'>
                Privacy policy
              </a>
            </Link>
            <Link href={'/terms'}>
              <a className='footer__link' target='_blank' rel='noreferrer'>
                Terms and Conditions
              </a>
            </Link>
          </ul>
          <ul className='footer__social-list'>
            <a href='https://discord.com/invite/kK3A9Bs8KV' className='footer__social' target='_blank' rel='noreferrer'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src='/united-token-data/img/discord.svg' alt='discord' />
            </a>
            <a href='https://twitter.com/ConnectClubHQ' className='footer__social' target='_blank' rel='noreferrer'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src='/united-token-data/img/twitter.svg' alt='twitter' />
            </a>
            <a
              href='https://apps.apple.com/app/connect-club-virtual-place/id1500718006'
              className='footer__social'
              target='_blank'
              rel='noreferrer'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src='/united-token-data/img/apple.svg' alt='apple' />
            </a>
            <a
              href='https://play.google.com/store/apps/details?id=com.connect.club'
              className='footer__social'
              target='_blank'
              rel='noreferrer'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src='/united-token-data/img/google-play.svg' alt='google-play' />
            </a>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer
