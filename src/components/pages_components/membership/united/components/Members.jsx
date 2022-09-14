import React from 'react'

import SampleSlider from './SampleSlider'

const Members = () => {
  const members = [
    {
      imgSrc: '/united-token-data/img/members1.png',
      name: 'Olivier Moingeon',
      link: 'https://connect.club/user/oligeon?utm_source=membership_united',
      role: 'Co-founder of Exclusible',
    },
    {
      imgSrc: '/united-token-data/img/members2.png',
      name: 'Tejas Chopra',
      link: 'https://connect.club/user/chopra_tejas?utm_source=membership_united',
      role: 'Netflix | TedX & International Keynote Speaker | NFT, Web3.0',
    },
    {
      imgSrc: '/united-token-data/img/members3.png',
      name: 'Livia Elektra',
      link: 'https://connect.club/user/elektra?utm_source=membership_united',
      role: 'Woman in Crypto | Founder | Building for Women | Artist',
    },
    {
      imgSrc: '/united-token-data/img/members4.png',
      name: 'Shira Lazar',
      link: 'https://connect.club/user/shiralazar?utm_source=membership_united',
      role: 'Founder/CEO of the Emmy Nominated digital media',
    },
    {
      imgSrc: '/united-token-data/img/members5.png',
      name: 'Hrish Lotlikar',
      link: 'https://connect.club/user/hrishlotlikar?utm_source=membership_united',
      role: 'Co-Founder & CEO at SuperWorld',
    },
    {
      imgSrc: '/united-token-data/img/members6.png',
      name: 'Nicole Sales',
      link: 'https://connect.club/user/nicoleasalesgiles?utm_source=membership_united',
      role: "Business Director, Digital Art Sales/NFTs at Christie's",
    },
    {
      imgSrc: '/united-token-data/img/members7.png',
      name: 'Mai Fujimoto',
      link: 'https://connect.club/user/missbitcoin?utm_source=membership_united',
      role: 'Miss Bitcoin Founder & CEO',
    },
    {
      imgSrc: '/united-token-data/img/members8.png',
      name: 'David Palmer',
      link: 'https://connect.club/user/d12dap?utm_source=membership_united',
      role: 'Blockchain Lead at Vodafone Business',
    },
    {
      imgSrc: '/united-token-data/img/members9.png',
      name: 'Dr Guenther Dobrauz',
      link: 'https://connect.club/user/gds?utm_source=membership_united',
      role: 'Partner & Leader PwC Legal Switzerland, Co-founder of exelixis capital',
    },
  ]

  return (
    <section id='members' className='members' data-aos='fade-right'>
      <div className='members__container container'>
        <h2 className='members__title stn-title'>Top members of the clubs at Connect.Club</h2>
        <div className='members__wrapper'>
          <SampleSlider object={members} />
        </div>
      </div>
    </section>
  )
}

export default Members
