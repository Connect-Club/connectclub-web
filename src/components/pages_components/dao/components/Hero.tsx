import React from 'react'

import styles from '@/components/pages_components/membership/membership_frontend.module.css'
import { FC } from '@/model/commonModel'

import buttonClasses from './UI/button/Button.module.css'

const Hero: FC = () => {
  return (
    <section className='hero'>
      <div className='hero__container container'>
        <div className='hero__content' id={'hero'}>
          <h1 className='hero__title'>Welcome to Connect.Club DAO</h1>
          <p className='hero__subtitle'>We’re building Metaverse together!</p>
          <a
            href={`mailto:info@connect.club?subject=${encodeURIComponent('Connect.Club DAO')}`}
            className={`${buttonClasses.stnBtn} hero__btn`}
            title={'Become a member'}
          >
            Become a member
          </a>
        </div>
        <div className='hero__img-block'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className='hero__img' src='/united-token-data/img/hero-img.png' alt='Connect club gif' />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className='hero__gif' src='/united-token-data/img/4.gif' alt='Connect club gif' />
        </div>
      </div>
      <style global jsx>
        {`
          .${styles.button} {
            background: #137bf8;
          }
          .${styles.button}:hover {
            background: #2c86f3;
          }
          .${styles.button}:disabled {
            background: rgb(77 125 208 / 25%);
          }
          .${styles.link}, .${styles.black}, .third-black {
            color: #fff;
          }
          .${styles.link}:hover {
            color: rgb(250 250 250 / 80%);
          }
          .${styles.error} {
            color: #ff9090;
          }
        `}
      </style>
    </section>
  )
}

export default Hero
