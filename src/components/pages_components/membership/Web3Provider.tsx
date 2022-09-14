import React, { useContext, useRef, useState } from 'react'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'

import { FC } from '@/model/commonModel'
import { ProviderRpcError, SmartContract, Web3ProviderContext } from '@/model/cryptoModel'

const initialValues: Web3ProviderContext = {
  provider: undefined,
  signer: undefined,
  chainId: undefined,
  error: '',
  accountId: undefined,
  connected: false,
  isConnecting: true,
  connect: async () => {
    //
  },
  reconnect: async () => {
    //
  },
  disconnect: async () => {
    //
  },
}
const Web3Context = React.createContext(initialValues)

export const useWeb3 = (): Web3ProviderContext => {
  return useContext(Web3Context)
}

type Props = {
  smartContract: SmartContract
  children: React.ReactNode
}
const Web3Provider: FC<Props> = ({ smartContract, children }) => {
  const web3Modal = useRef<null | Web3Modal>(null)

  /* Get web3modal instance */
  const getWeb3Modal = () => {
    if (web3Modal.current === null) {
      web3Modal.current = new Web3Modal({
        cacheProvider: true,
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: smartContract.infuraUrl.substring(smartContract.infuraUrl.lastIndexOf('/') + 1),
            },
          },
        },
      })
    }

    return web3Modal.current
  }

  /* Reconnect to cached provider */
  const onWeb3ReConnect = async () => {
    const web3Modal = getWeb3Modal()
    if (web3Modal.cachedProvider) {
      await onWeb3Connect()
    } else {
      setWeb3Provider((prev) => ({
        ...prev,
        isConnecting: false,
      }))
    }
  }

  /* Disconnect */
  const onWeb3Disconnect = async (provider?: any) => {
    const web3Modal = getWeb3Modal()
    await web3Modal.clearCachedProvider()
    if (provider?.disconnect && typeof provider.disconnect === 'function') {
      await provider.disconnect()
    }
    setWeb3Provider((prev) => ({
      ...prev,
      provider: undefined,
      signer: undefined,
      connected: false,
    }))
  }

  const getProvider = async () => {
    const web3Modal = getWeb3Modal()
    const connection = await web3Modal.connect()
    return new ethers.providers.Web3Provider(connection)
  }

  /* Connect */
  const onWeb3Connect = async () => {
    try {
      const provider = await getProvider()
      await subscribeProvider(provider)
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()
      const accountId = await signer.getAddress()

      setWeb3Provider((prev) => ({
        ...prev,
        disconnect: async () => {
          await onWeb3Disconnect(provider)
        },
        provider,
        isConnecting: false,
        chainId: network.chainId,
        accountId: accountId,
        connected: !!(provider && accountId),
      }))
    } catch (e) {
      console.log(e)
    }
  }

  const [web3Provider, setWeb3Provider] = useState<Web3ProviderContext>({
    ...initialValues,
    connect: onWeb3Connect,
    reconnect: onWeb3ReConnect,
    disconnect: onWeb3Disconnect,
  })

  const subscribeProvider = async (provider: any) => {
    if (!provider.provider || !provider.provider.on) {
      return
    }
    provider.provider.on('accountsChanged', async (accounts: string[]) => {
      if (accounts.length === 0) {
        window.location.reload()
      } else {
        const provider = await getProvider()
        setWeb3Provider((prev) => ({
          ...prev,
          provider,
          accountId: accounts[0],
        }))
      }
    })
    provider.provider.on('chainChanged', async (chainId: number) => {
      const provider = await getProvider()
      setWeb3Provider((prev) => ({
        ...prev,
        chainId,
        provider,
      }))
    })
    provider.provider.on('disconnect', async (error: ProviderRpcError) => {
      console.warn(error)
      await onWeb3Disconnect(provider)
    })
    provider.provider.on('error', async (error: ProviderRpcError) => {
      console.warn(error)
      await onWeb3Disconnect(provider)
    })
  }

  return <Web3Context.Provider value={web3Provider}>{children}</Web3Context.Provider>
}

export default Web3Provider
