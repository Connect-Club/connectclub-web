import React, { useEffect } from 'react'
import AOS from 'aos'

import { isMobileDevice } from '@/lib/utils'
import { FC } from '@/model/commonModel'
import { MintComponentProps, SmartContract } from '@/model/cryptoModel'

import About from './About'
import Faq from './Faq'
import Footer from './Footer'
import Header from './Header'
import Hero from './Hero'
import Roadmap from './Roadmap'
import Social from './Social'
import Utilites from './Utilites'

import 'aos/dist/aos.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

type Props = Omit<MintComponentProps, 'abi' | 'smartContract'> & {
  abi: MintComponentProps['abi'] | null
  smartContract: SmartContract | undefined
}

const Main: FC<Props> = (props) => {
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
        <Hero {...props} />
        <About />
        <Utilites />
        <Roadmap />
        <Faq />
        <Social />
      </main>
      <Footer />
    </>
  )
}

export default Main
