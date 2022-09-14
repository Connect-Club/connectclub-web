import React, { useEffect } from 'react'
import AOS from 'aos'

import { isMobileDevice } from '@/lib/utils'
import { FC } from '@/model/commonModel'

import About from './About'
import DAO from './DAO'
import Footer from './Footer'
import Groups from './Groups'
import Header from './Header'
import Hero from './Hero'
import Members from './Members'
import Roadmap from './Roadmap'
import Social from './Social'
import Team from './Team'

import 'aos/dist/aos.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const Main: FC = () => {
  useEffect(() => {
    AOS.init({
      offset: !isMobileDevice() ? 150 : 100,
      disable: false,
      duration: 1000,
    })
  }, [])

  return (
    <>
      <Header />
      <main className='main'>
        <Hero />
        <About />
        <DAO />
        <Roadmap />
        <Groups />
        <Members />
        <Team />
        <Social />
      </main>
      <Footer />
    </>
  )
}

export default Main
