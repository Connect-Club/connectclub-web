import React from 'react'

const Groups = () => {
  const groups = [
    {
      imgSrc: '/united-token-data/img/groups1.png',
      title: 'United Metaverse by Connect.Club',
      link: `https://connect.club/club/united-metaverse-by-connect-club?utm_source=dao_page`,
      subs: 498,
    },
    {
      imgSrc: '/united-token-data/img/groups2.png',
      title: 'Angel Investors',
      link: `https://connect.club/club/angel-investors?utm_source=dao_page`,
      subs: 367,
    },
    {
      imgSrc: '/united-token-data/img/groups3.png',
      title: 'Meta Vibes Tribe',
      link: `https://connect.club/club/meta-vibes-tribe?utm_source=dao_page`,
      subs: 257,
    },
    {
      imgSrc: '/united-token-data/img/groups4.png',
      title: 'THE PITCH CLUB',
      link: `https://connect.club/club/the-pitch-club?utm_source=dao_page`,
      subs: 272,
    },
    {
      imgSrc: '/united-token-data/img/groups5.png',
      title: 'NFTs.Tips',
      link: `https://connect.club/club/nfts-tips?utm_source=dao_page`,
      subs: 322,
    },
    {
      imgSrc: '/united-token-data/img/groups6.png',
      title: 'NFT',
      link: `https://connect.club/club/nft?utm_source=dao_page`,
      subs: 1816,
    },
    {
      imgSrc: '/united-token-data/img/groups7.png',
      title: 'EtherBucks NFT: Currency in the Metaverse',
      link: `https://connect.club/club/etherbucks-nft-currency-in-the-metaverse?utm_source=dao_page`,
      subs: 286,
    },
    {
      imgSrc: '/united-token-data/img/groups8.png',
      title: 'Metaverse Builders',
      link: `https://connect.club/club/metaverse-builders?utm_source=dao_page`,
      subs: 1062,
    },
    {
      imgSrc: '/united-token-data/img/groups9.png',
      title: 'Future MetaLeaders',
      link: `https://connect.club/club/future-metaleaders?utm_source=dao_page`,
      subs: 519,
    },
    {
      imgSrc: '/united-token-data/img/groups10.png',
      title: 'UNIQUEHORNS.NFT',
      link: `https://connect.club/club/uniquehorns-nft?utm_source=dao_page`,
      subs: 167,
    },
    {
      imgSrc: '/united-token-data/img/groups11.png',
      title: 'The Land of NFTS',
      link: `https://connect.club/club/the-land-of-nfts?utm_source=dao_page`,
      subs: 384,
    },
    {
      imgSrc: '/united-token-data/img/groups12.png',
      title: 'METAPRENEURS.888',
      link: `https://connect.club/club/metapreneurs-888?utm_source=dao_page`,
      subs: 102,
    },
    {
      imgSrc: '/united-token-data/img/groups13.png',
      title: 'Business Connections',
      link: `https://connect.club/club/business-connections?utm_source=dao_page`,
      subs: 451,
    },
    {
      imgSrc: '/united-token-data/img/groups14.png',
      title: 'MetaWorld',
      link: `https://connect.club/club/metaworld?utm_source=dao_page`,
      subs: 165,
    },
  ]
  return (
    <section id='clubs' className='groups'>
      <div className='groups__container container'>
        <h2 className='groups__title stn-title' data-aos='fade-right'>
          We are building Metaverse together with the following communities at Connect.Club
        </h2>
        <div className='groups__wrapper'>
          {groups.map((item, index) => (
            <div key={index} className='groups__item' data-aos='fade-right'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <a href={item.link} target={'_blank'} rel={'noreferrer'} title={item.title} className={'flex-shrink-0'}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imgSrc} alt='group icon' />
              </a>
              <div className='groups__content'>
                <h3 className='groups__caption'>
                  <a href={item.link} target={'_blank'} rel={'noreferrer'} title={item.title}>
                    {item.title}
                  </a>
                </h3>
                <p className='groups__subs'>{`• ${item.subs} members`}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Groups
