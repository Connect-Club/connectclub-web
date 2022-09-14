import React from 'react'

import Sphere from './Sphere'

const Social = () => {
  return (
    <section id='contacts' className='social'>
      <div className='social__container container'>
        <h2 className='social__title stn-title'>Social media</h2>
        <div className='social__wrapper'>
          <div className='social__column social__column--1'>
            <p className='social__vertical social__subtitle'>Join the Community</p>
            <div className='social__content'>
              <p className='social__text stn-text'>Want to learn more? Have questions? Jump into our community!</p>
              <a target='_blank' rel='noreferrer' href='https://discord.com/invite/kK3A9Bs8KV' className='social__link'>
                Discord
              </a>
              <a
                target='_blank'
                rel='noreferrer'
                href='https://twitter.com/ConnectClubHQ'
                className='social__link social__link--unmargined'
              >
                Twitter
              </a>
            </div>
          </div>
          <div className='social__column social__column--2'>
            <div className='social__content'>
              <p className='social__subtitle social__subtitle--app'>Download Connect.Club app:</p>
              <a
                target='_blank'
                rel='noreferrer'
                href='https://apps.apple.com/app/connect-club-virtual-place/id1500718006'
                className='social__link'
              >
                App Store
              </a>
              <a
                target='_blank'
                rel='noreferrer'
                href='https://play.google.com/store/apps/details?id=com.connect.club'
                className='social__link'
              >
                Google Play
              </a>
            </div>
          </div>
        </div>
        <Sphere />
      </div>
    </section>
  )
}

export default Social
