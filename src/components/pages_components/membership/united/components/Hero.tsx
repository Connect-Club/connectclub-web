import React from 'react'
import clsx from 'clsx'
import { ethers } from 'ethers'
import Image from 'next/image'

import Content from '@/components/pages_components/membership/Content'
import styles from '@/components/pages_components/membership/membership_frontend.module.css'
import Web3Provider from '@/components/pages_components/membership/Web3Provider'
import { Loader } from '@/lib/svg'
import { FC } from '@/model/commonModel'
import { MintComponentProps, SmartContract } from '@/model/cryptoModel'

type Props = Omit<MintComponentProps, 'abi' | 'smartContract'> & {
  abi: MintComponentProps['abi'] | null
  smartContract: SmartContract | undefined
}

const Hero: FC<Props> = ({ abi, smartContract, tokenId, qrCodeLink, amplitudeInst, appUrl, isMobile }) => {
  const price = smartContract ? ethers.utils.formatEther(smartContract.tokenPrice) : 0
  return (
    <section className='hero'>
      <div className='hero__container container'>
        <div className='hero__content' id={'hero'}>
          <h1 className='hero__title'>United Metaverse Pass</h1>
          <p className='hero__subtitle'>by Connect.Club</p>

          {smartContract && (
            <div className={'align-center'}>
              <div className={styles.price}>
                <Image src='/img/svg/etherium.svg' width={32} height={32} alt={`${price} ETH`} />
                <div>{`${price} ETH`}</div>
              </div>

              {abi === null ? (
                <Loader />
              ) : (
                <Web3Provider smartContract={smartContract}>
                  <Content
                    abi={abi}
                    tokenId={tokenId}
                    smartContract={smartContract}
                    appUrl={appUrl}
                    qrCodeLink={qrCodeLink}
                    amplitudeInst={amplitudeInst}
                    isMobile={isMobile}
                  />
                </Web3Provider>
              )}

              <div className={clsx(styles.hint)}>
                {smartContract.totalSupply} token
                {smartContract.totalSupply > 1 ? 's were' : ' was'} issued,{' '}
                {smartContract.maxTokenSupply - smartContract.totalSupply} remained
              </div>
            </div>
          )}
        </div>
        <div className='hero__img-block'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className='hero__img' src='/united-token-data/img/hero-img.png' alt='Connect club gif' />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className='hero__gif' src='/united-token-data/img/4.gif' alt='Connect club gif' />
        </div>
      </div>
      <style global jsx>
        {`
          .${styles.button} {
            background: #137bf8;
          }
          .${styles.button}:hover {
            background: #2c86f3;
          }
          .${styles.button}:disabled {
            background: rgb(77 125 208 / 25%);
          }
          .${styles.link}, .${styles.black}, .third-black {
            color: #fff;
          }
          .${styles.link}:hover {
            color: rgb(250 250 250 / 80%);
          }
          .${styles.error} {
            color: #ff9090;
          }
        `}
      </style>
    </section>
  )
}

export default Hero
