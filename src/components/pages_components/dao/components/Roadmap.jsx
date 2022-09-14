import React from 'react'

import Sphere from './Sphere'

const Roadmap = () => {
  return (
    <section id='roadmap' className='roadmap'>
      <div className='roadmap__container container'>
        <h2 className='roadmap__title stn-title'>Roadmap</h2>
        <div className='roadmap__wrapper'>
          <div className='roadmap__column roadmap__column--1' data-aos='fade-right'>
            <h3 className='roadmap__caption'>PHASE 1: CONNECT.CLUB TOKEN</h3>
            <div className='roadmap__content roadmap__content--1'>
              <p className='stn-text'>
                The Connect.Club Governance Token goes live on the Ethereum (erc-20). Token holders will get exclusive
                opportunities to make fundamental decisions in the DAO.
              </p>
            </div>
          </div>
          <div className='roadmap__column roadmap__column--desctop roadmap__column--2' data-aos='fade-right'>
            <h3 className='roadmap__caption'>PHASE 2: DAO</h3>
            <div className='roadmap__content roadmap__content--2'>
              <p className='roadmap__text'>
                We plan to launch the nomination and voting process for token holders. You will be asked to create a
                profile and fill out some details that will be released, so people can see them and decide on their
                votes. The first role of the DAO council will be to create the formal governance frameworks for
                Connect.Club DAO. The council will split up and focus on different areas of the framework. The details
                will be released soon closer to the date of the launch
              </p>
            </div>
          </div>
        </div>
        <div className='roadmap__wrapper--2'>
          <div className='roadmap__wrapper-content'>
            <Sphere />
            <div>
              <div className='roadmap__column roadmap__column--tablet roadmap__column--2' data-aos='fade-right'>
                <h3 className='roadmap__caption'>PHASE 2: DAO</h3>
                <div className='roadmap__content roadmap__content--2'>
                  <p className='roadmap__text'>
                    We plan to launch the nomination and voting process for token holders. You will be asked to create a
                    profile and fill out some details that will be released, so people can see them and decide on their
                    votes. The first role of the DAO council will be to create the formal governance frameworks for
                    Connect.Club DAO. The council will split up and focus on different areas of the framework. The
                    details will be released soon closer to the date of the launch
                  </p>
                </div>
              </div>
              <div className='roadmap__column roadmap__column--3' data-aos='fade-right'>
                <h3 className='roadmap__caption'>PHASE 3: TOKEN IDO AND STAKING</h3>
                <div className='roadmap__content roadmap__content--3'>
                  <p className='roadmap__text'>
                    We are currently planning to launch Connect.Club marketplace where you can search and buy assets to
                    customize the room. The marketplace is the initial step to Connect.Club coin. Every token holder
                    will get our Coin once it’s launched.
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
