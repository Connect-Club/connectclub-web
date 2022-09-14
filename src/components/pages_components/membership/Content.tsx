import React, { useCallback, useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import clsx from 'clsx'
import { ethers } from 'ethers'

import { Loader, LoaderSpin } from '@/lib/svg'
import { getHrefUTM } from '@/lib/utils'
import { FC } from '@/model/commonModel'
import { MintComponentProps } from '@/model/cryptoModel'

import { useWeb3 } from './Web3Provider'

import styles from './membership_frontend.module.css'

const Content: FC<MintComponentProps> = ({
  abi,
  smartContract,
  tokenId,
  qrCodeLink,
  amplitudeInst,
  appUrl,
  isMobile,
}) => {
  const { connect, reconnect, connected, provider, chainId, disconnect, accountId, isConnecting } = useWeb3()
  const [balanceOf, setBalanceOf] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isPayable, setIsPayable] = useState(false)
  const [isBalanceIsLoading, setBalanceIsLoading] = useState(true)

  const mint = async () => {
    if (!isLoading && isPayable) {
      amplitudeInst &&
        amplitudeInst.getInstance().logEvent(
          'membership_landing.dirty_mint',
          Object.assign(
            {},
            {
              tokenId: tokenId,
            },
            getHrefUTM(),
          ),
        )

      const networkStatus = await prepareNetwork()
      if (networkStatus) {
        try {
          const MintableERC1155 = new ethers.Contract(smartContract.contractAddress, abi, provider?.getSigner())
          setIsLoading(true)
          const transactionResponse = await MintableERC1155.mintMembership(tokenId, [], {
            value: smartContract.tokenPrice,
          })
          const receipt = await transactionResponse.wait()
          if (receipt.status) {
            // const balanceOf = await MintableERC1155.balanceOf(accountId, tokenId);
            // setBalanceOf(balanceOf.toNumber());

            amplitudeInst &&
              amplitudeInst.getInstance().logEvent(
                'membership_landing.mint',
                Object.assign(
                  {},
                  {
                    tokenId: tokenId,
                  },
                  getHrefUTM(),
                ),
              )

            // if (!isMobile) {
            //     setIsLoading(false);
            // } else {
            //     queueMicrotask(() => {
            //        location.reload();
            //     });
            // }
            setTimeout(() => {
              location.reload()
            }, 5000)
          }
        } catch (e) {
          setIsLoading(false)
        }
      }
    }
  }

  const prepareNetwork = useCallback(
    async (isChange = true) => {
      if (connected) {
        const network = await provider?.getNetwork()
        if (network) {
          const networkName = network.name === 'homestead' ? 'mainnet' : network.name
          if (smartContract.network !== networkName && typeof window?.ethereum !== 'undefined') {
            try {
              isChange &&
                // @ts-ignore
                (await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [
                    {
                      chainId: smartContract.network === 'goerli' ? '0x5' : '0x1',
                    },
                  ],
                }))
            } catch (e) {
              setBalanceIsLoading(false)
            }
          } else {
            return true
          }
        }
      }
      return false
    },
    [connected, provider, smartContract.network],
  )

  const getBalanceOf = useCallback(
    async (isChange = true) => {
      const networkStatus = await prepareNetwork(isChange)
      let balance = 0
      if (connected && networkStatus) {
        try {
          const MintableERC1155 = new ethers.Contract(smartContract.contractAddress, abi, provider?.getSigner())
          const balanceOf = await MintableERC1155.balanceOf(accountId, tokenId)
          balance = balanceOf.toNumber()
        } catch (e) {
          console.log(e)
        }
      }
      const userWalletBalance = connected && networkStatus ? await provider?.getSigner().getBalance() : 0
      if (
        userWalletBalance &&
        ethers.utils.formatEther(userWalletBalance) >= ethers.utils.formatEther(smartContract.tokenPrice)
      ) {
        setIsPayable(true)
      } else {
        setIsPayable(false)
      }
      setBalanceOf(balance || 0)
    },
    [
      abi,
      accountId,
      connected,
      prepareNetwork,
      provider,
      smartContract.contractAddress,
      smartContract.tokenPrice,
      tokenId,
    ],
  )

  const truncateWalletAddress = (address: string) => {
    if (isMobile) {
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    }
    return address
  }

  const onDisconnectClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (!isLoading) {
      await disconnect()
    }
  }

  /* Check tha balance, when the network or account were changed */
  useEffect(() => {
    getBalanceOf(false).then()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, accountId])

  /* Change network on first page load */
  useEffect(() => {
    if (connected) {
      getBalanceOf().then(() => {
        setBalanceIsLoading(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected])

  /* Reconnect to the wallet */
  useEffect(() => {
    ;(async () => {
      await reconnect()
    })()
  }, [reconnect])

  return (
    <>
      {!connected && !isConnecting ? (
        <button onClick={connect} className={styles.button} title={'Connect wallet'}>
          Connect wallet
        </button>
      ) : (
        isConnecting && (
          <button disabled className={styles.button} title={'Connect wallet'}>
            Authorizing..
          </button>
        )
      )}
      {connected && (
        <>
          {isBalanceIsLoading ? (
            <Loader />
          ) : (
            <>
              {balanceOf === 0 ? (
                <>
                  <button onClick={mint} className={styles.button} title={'Mint'} disabled={isLoading || !isPayable}>
                    Mint
                    {isLoading && <LoaderSpin color={'#fff'} className={'ml-1'} />}
                  </button>
                  {!isPayable && (
                    <div className={clsx('mt-1', styles.error)}>Not enough ETH in your wallet or wrong network</div>
                  )}
                </>
              ) : (
                <>
                  {isMobile ? (
                    <a href={appUrl} title={'Go to club'} className={styles.button}>
                      Go to club
                    </a>
                  ) : (
                    <>
                      <div className={clsx(styles.black, 'mb-1')}>Go to club in Connect.club</div>
                      <QRCode value={qrCodeLink} size={140} />
                    </>
                  )}
                </>
              )}
              <div className={clsx(styles.hint, 'third-black')}>
                {accountId && (
                  <>
                    Wallet: {truncateWalletAddress(accountId)}{' '}
                    <span className={styles.disconnect}>
                      (
                      <a onClick={onDisconnectClick} title={'Disconnect'} className={styles.link}>
                        Disconnect
                      </a>
                      )
                    </span>
                    <div className={styles.hint}>
                      You have {balanceOf} token
                      {balanceOf > 1 || balanceOf === 0 ? 's' : ''}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}

export default Content
