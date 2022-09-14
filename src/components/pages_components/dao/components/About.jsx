import React from 'react'

import Sphere from './Sphere'

import buttonClasses from './UI/button/Button.module.css'

const About = () => {
  return (
    <section id='about' className='about'>
      <div className='about__container container'>
        <div className='about__left' data-aos='fade-left'>
          <Sphere />
        </div>
        <div className='about__wrapper' data-aos='fade-right'>
          <div className='about__content'>
            <h2 className='about__title stn-title'>About Connect.Club</h2>
            <p className='about__text stn-text'>
              Connect.Club is a part of the future Metaverse and a social network that allows like-minded individuals to
              find each other, create meaningful, human connections, and collaborate more efficiently. Connect.Club
              gives community builders the opportunity to start a club, develop and build a strong community in a
              designed virtual space for people to express their shared interests.
            </p>
            <div className='about__btn-block'>
              <a
                href='@/components/pages_components/dao/components/About'
                className={`${buttonClasses.stnBtn} about__btn about__btn--paper`}
                target={'_blank'}
                rel={'noreferrer'}
                title={'White paper'}
              >
                White paper
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
