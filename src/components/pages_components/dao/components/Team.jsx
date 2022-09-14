import React from 'react'

import SampleSlider from './SampleSlider'

const Team = () => {
  const team = [
    {
      imgSrc: '/united-token-data/img/igormonakhov.png',
      name: '@igormonakhov ',
      link: 'https://connect.club/user/igormonakhov?utm_source=dao_page',
      role: 'Founder Connect.Club, ExFounder Embria, Angel Investor in Splitmetrics, Loona, Locals, Random Coffee, Voices',
    },
    {
      imgSrc: '/united-token-data/img/fffilimonov.png',
      name: '@fffilimonov  ',
      link: 'https://connect.club/user/fffilimonov?utm_source=dao_page',
      role: 'Cofounder/ Chief Technology Officer Connect.Club',
    },
    {
      imgSrc: '/united-token-data/img/winmary.png',
      name: '@winmary ',
      link: 'https://connect.club/user/winmary?utm_source=dao_page',
      role: 'Chief Operating Officer Connect.Club',
    },
    {
      imgSrc: '/united-token-data/img/ka3na.png',
      name: '@ka3na ',
      link: 'https://connect.club/user/ka3na?utm_source=dao_page',
      role: 'Chief Product Officer Connect.Club',
    },
    {
      imgSrc: '/united-token-data/img/seanalimov2021.jpg',
      name: '@seanalimov2021 ',
      link: 'https://connect.club/user/seanalimov2021?utm_source=dao_page',
      role: 'Global Program Director',
    },
    {
      imgSrc: '/united-token-data/img/n_kus.png',
      name: '@n_kus ',
      link: 'https://connect.club/user/n_kus?utm_source=dao_page',
      role: 'Chief Community Manager',
    },
  ]

  return (
    <section id='team' className='team' data-aos='fade-right'>
      <div className='team__container container'>
        <div className='team__top'>
          <h2 className='team__title stn-title'>Team</h2>
          <p className='team__text stn-text'>
            Connect.Club is team of dedicated leaders in the digital space. Fully doxxed, independent thinkers who are
            passionate about bringing people together in an increasingly complicated world.
          </p>
        </div>
        <div className='team__wrapper'>
          <SampleSlider object={team} />
        </div>
      </div>
    </section>
  )
}

export default Team
