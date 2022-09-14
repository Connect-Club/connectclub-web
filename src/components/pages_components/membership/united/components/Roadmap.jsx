import React from 'react'

import Sphere from './Sphere'

const Roadmap = () => {
  return (
    <section id='roadmap' className='roadmap'>
      <div className='roadmap__container container'>
        <h2 className='roadmap__title stn-title'>Roadmap</h2>
        <div className='roadmap__wrapper'>
          <div className='roadmap__column roadmap__column--1' data-aos='fade-right'>
            <h3 className='roadmap__caption'>PHASE 1: PUBLIC MINT</h3>
            <div className='roadmap__content roadmap__content--1'>
              <p className='roadmap__text'>
                Only Membership owners will receive exclusive opportunities. There will only ever be 10 000 NFT for our
                club creators. Сonnect.Club Membership will be minted in April
              </p>
            </div>
          </div>
          <div className='roadmap__column roadmap__column--desctop roadmap__column--2' data-aos='fade-right'>
            <h3 className='roadmap__caption'>PHASE 2: UTILITIES</h3>
            <div className='roadmap__content roadmap__content--3'>
              <p className='roadmap__text'>
                📌 creating gallery of verified NFT artworks
                <br />
                📌 room constructor
                <br />
                📌 web version
                <br />
                📌 possibility to launch their membership token that provides access to unique event at Connect.Club
                <br />
                📌 opportunity to create a Connect.Club profile through Wallet-verification
              </p>
            </div>
          </div>
        </div>
        <div className='roadmap__wrapper--2'>
          <div className='roadmap__wrapper-content'>
            <Sphere />
            <div>
              <div className='roadmap__column roadmap__column--tablet roadmap__column--2' data-aos='fade-right'>
                <h3 className='roadmap__caption'>PHASE 2: UTILITIES</h3>
                <div className='roadmap__content roadmap__content--2'>
                  <p className='roadmap__text'>
                    📌 creating gallery of verified NFT artworks
                    <br />
                    📌 room constructor
                    <br />
                    📌 web version
                    <br />
                    📌 possibility to launch their membership token that provides access to unique event at Connect.Club
                    <br />
                    📌 opportunity to create a Connect.Club profile through Wallet-verification
                  </p>
                </div>
              </div>
              <div className='roadmap__column roadmap__column--3' data-aos='fade-right'>
                <h3 className='roadmap__caption'>PHASE 3: BUILDING DAO</h3>
                <div className='roadmap__content roadmap__content--4'>
                  <p className='roadmap__text'>
                    Building DAO for United Metaverse token Holders. They will get exclusive opportunities to make
                    fundamental decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Roadmap
