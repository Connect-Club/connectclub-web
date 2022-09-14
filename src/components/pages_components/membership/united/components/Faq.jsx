import React from 'react'

import DropdownItem from './DropdownItem'
// import Sphere from "./UI/sphere/Sphere";
const Faq = () => {
  const faq = [
    {
      title: 'What is United Metaverse by Connect.Club?',
      body: [
        `United Metaverse by Connect.Club is a community that believes in the future & power of Metaverse communication. Connecting with like-minded others is an essential part of belonging. Connected communities are strong communities. At United Metaverse by Connect.Club, people contribute to Metaverse Future by sharing our knowledge, observations, and insights to help people & businesses to develop the strategy for the Metaverse. We believe in a decentralized future, developing a virtual space using blockchain as a foundation.`,
      ],
    },
    {
      title: 'What can I do with a United Metaverse Pass?',
      body: [
        '1. Automatically become members of the private community and get access to various exclusive events;',
        '2. Communicate with our team directly including participating in strategy sessions online and offline;',
        '3. Get early access to all new features of Connect.Club app, including creating a gallery of verified NFT artworks, room constructor, web version, a possibility to launch their membership token that provides access to unique events, and more;',
        '4. Receive a special role on our Discord with access to exclusive channels and occasional bonus perks;',
        '5. Get early access to extended analytics of their club;',
        '6. Opportunity to create a Connect.Club profile through Wallet-verification;',
        '7. Opportunity to potentially participate in the creation of the Connect.Club DAO from the beginning.',
      ],
    },
    {
      title: 'Where can I buy a United Metaverse Pass? ',
      body: [`Click the “MINT” button and connect your wallet`],
    },
    {
      title: 'Why Ethereum?',
      body: [
        `Ethereum uses a Proof-Of-Work approach, meaning all the transactions get recorded internally on the Ethereum blockchain. This makes the transactions much more secure. `,
      ],
    },
    {
      title: 'How many NFTs will be launching?',
      body: ['10.000'],
    },
    {
      title: 'I’m an investor, how can I help this project?',
      body: [
        `Our mission is to launch DAO, early investors would have an opportunity to be involved in building
                Connect.Club decentralized autonomous organization. You can support us by buying United Metaverse Pass by Connect.Club or send email at info@connect.club with your proposal.`,
      ],
    },
  ]

  return (
    <section id='faq' className='faq'>
      <div className='faq__container container'>
        <h2 className='faq__title stn-title' data-aos='fade-right'>
          FAQ
        </h2>
        <div className='faq__wrapper'>
          <div className='faq__column' data-aos='fade-right'>
            {faq.map(
              (item, index) => index % 2 === 0 && <DropdownItem key={index} body={item.body} title={item.title} />,
            )}
          </div>
          <div className='faq__column' data-aos='fade-left'>
            {faq.map(
              (item, index) => index % 2 === 1 && <DropdownItem key={index} body={item.body} title={item.title} />,
            )}
          </div>
        </div>
      </div>
      {/* <Sphere /> */}
    </section>
  )
}

export default Faq
