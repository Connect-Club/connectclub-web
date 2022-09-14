import React from 'react'
import Link from 'next/link'

import buttonClasses from '@/components/pages_components/dao/components/UI/button/Button.module.css'

import Sphere from './Sphere'

const Utilites = () => {
  const data = [
    {
      imgSrc: '/united-token-data/img/utilites1.svg',
      text: 'Automatically become members of the private community and get access to various exclusive events;',
    },
    {
      imgSrc: '/united-token-data/img/utilites2.svg',
      text: 'Communicate with our team directly including participating in strategy sessions online and offline;',
    },
    {
      imgSrc: '/united-token-data/img/utilites3.svg',
      text: 'Get early access to all new features of Connect.Club app, including creating a gallery of verified NFT artworks, room constructor, web version, a possibility to launch their membership token that provides access to unique events, and more;',
    },
    {
      imgSrc: '/united-token-data/img/utilites4.svg',
      text: 'Receive a special role on our Discord with access to exclusive channels, occasional bonus perks, and more',
    },
    {
      imgSrc: '/united-token-data/img/utilites5.svg',
      text: 'Get early access to extended analytics of their club;',
    },
    {
      imgSrc: '/united-token-data/img/utilites6.svg',
      text: 'Opportunity to create a Connect.Club profile through Wallet-verification',
    },
    {
      imgSrc: '/united-token-data/img/utilites7.svg',
      text: 'Opportunity to potentially participate in the creation of the Connect.Club DAO from the beginning',
    },
  ]

  return (
    <section id='utility' className='utilities'>
      <div className='utilities__container container'>
        <h2 className='utilities__title stn-title' data-aos='fade-right'>
          Utilities for token owners
        </h2>
        <div className='utilities__wrapper'>
          <div className='utilities__column utilities__column--first'>
            <p className='stn-text utilities__text--margined' data-aos='fade-right'>
              There will be only 10 000 NFT. Only token owners will receive exclusive opportunities:
            </p>
            {data.map(
              (item, index) =>
                index < 3 && (
                  <div key={index} className='utilities__item' data-aos='fade-right'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imgSrc} alt='utilities icon' className='utilities__img' />
                    <p className='utilities__text'>{item.text}</p>
                  </div>
                ),
            )}
          </div>
          <div className='utilities__column utilities__column--second'>
            {data.map(
              (item, index) =>
                index >= 3 && (
                  <div key={index} className='utilities__item' data-aos='fade-left'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imgSrc} alt='utilities icon' className='utilities__img' />
                    <div>
                      <p className='utilities__text'>{item.text}</p>
                      {index === data.length - 1 && (
                        <div className={'utilities__button_block'}>
                          <Link href={'/dao'}>
                            <a className={`${buttonClasses.stnBtn} utilities__button`} title={'Become a member'}>
                              Become a member
                            </a>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ),
            )}
            <p className='stn-text utilities__text--margined-top utilities__text_bottom'>
              These NFTs reward the early supporters of the project and will continue to provide more benefits as we
              move forward.
            </p>
            <Sphere />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Utilites
