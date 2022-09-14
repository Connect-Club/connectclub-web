import React from 'react'

import Sphere from './Sphere'

const DAO = () => {
  const data = [
    {
      title: 'How to become a<br />member of the DAO?',
      text: 'Every candidate, the number of tokens and the value of the token must be approved by a vote. After that, the required amount is transferred to the smart contract and tokens are issued.',
    },
    {
      title: 'How is the voting<br />process organized?',
      text: 'Our mechanism aims to make placing votes fair, transparent, and low-cost so that holders can participate in the decision-making of the DAO. Only the owner of the contract can issue a contract. Over the coming year we’ll be scheduling votes to decide on a range of economic issues',
    },
  ]

  return (
    <section id='dao' className='utilities'>
      <div className='utilities__container container'>
        <h2 className='utilities__title stn-title' data-aos='fade-right'>
          DAO
        </h2>
        <div className='utilities__wrapper'>
          <div className='utilities__column utilities__column--first'>
            <p className='stn-text' data-aos='fade-right'>
              Decentralized governance is crucial to building and managing a globally dispersed community—and therefore
              has a decisive role for the success of the Connect.Club ecosystem. It will allow DAO members to make
              decisions regarding Ecosystem Fund allocations, governance rules, projects, partnerships, and beyond. We
              are currently planning to launch Connect.Club marketplace where you can search and buy assets to customize
              the room. The marketplace is the initial step to Connect.Club coin. All token holders will be able to get
              first our coin when it is launched. Moreover, a percentage from the token membership sales will be given
              to the DAO contract
            </p>
          </div>
          <div className='utilities__column utilities__column--second'>
            {data.map((item, index) => (
              <div key={index} className='utilities__item' data-aos='fade-left'>
                <h3 className='roadmap__caption' dangerouslySetInnerHTML={{ __html: item.title }} />
                <p className='roadmap__text'>{item.text}</p>
              </div>
            ))}
            <p className='stn-text utilities__text--margined-top'>
              The number of votes = the number of tokens
              <br />
              All token holders should participate in the voting.
            </p>
            <Sphere />
          </div>
        </div>
      </div>
    </section>
  )
}

export default DAO
