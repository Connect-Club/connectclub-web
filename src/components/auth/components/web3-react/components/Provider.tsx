// @ts-nocheck
import React, { ReactNode, useCallback, useState } from 'react'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'

import { getAddChainParameters } from '@/components/auth/components/web3-react/lib/chains'
import { useWeb3Store } from '@/components/auth/components/web3-react/lib/store'
import { getConnectorId, getName } from '@/components/auth/components/web3-react/lib/utils'

import { coinbaseWallet, hooks as coinbaseWalletHooks } from '../connectors/coinbaseWallet'
import { hooks as metaMaskHooks, metaMask } from '../connectors/metaMask'
import { network } from '../connectors/network'
import { hooks as walletConnectHooks, walletConnect } from '../connectors/walletConnect'

export const connectors: [MetaMask | WalletConnect | CoinbaseWallet | Network, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  // [network, networkHooks],
]

const getConnector = (connectorName: string | undefined) => {
  if (connectorName === 'metaMask') return metaMask
  if (connectorName === 'walletConnect') return walletConnect
  if (connectorName === 'coinbaseWallet') return walletConnect
  if (connectorName === 'network') return network

  return undefined
}

export const useWeb3 = () => {
  const [error, setError] = useState(undefined)
  const web3Context = useWeb3React()
  const cachedConnector = useWeb3Store((state) => state.connector)
  const clearCachedConnector = useWeb3Store((state) => state.clearConnector)
  const setCachedConnector = useWeb3Store((state) => state.setConnector)

  const disconnect = useCallback(async () => {
    if (web3Context.connector?.deactivate) {
      await web3Context.connector.deactivate()
    } else {
      await web3Context.connector.resetState()
    }
    clearCachedConnector()
  }, [clearCachedConnector, web3Context.connector])

  const connect = useCallback(
    async (con: MetaMask | WalletConnect | CoinbaseWallet | Network, desiredChainId = -1) => {
      const activeConnector = con || web3Context.connector
      if (activeConnector) {
        try {
          if (activeConnector instanceof WalletConnect || activeConnector instanceof Network) {
            await activeConnector.activate(desiredChainId === -1 ? undefined : desiredChainId)
          } else {
            await activeConnector.activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
          }
          setError(undefined)
          setCachedConnector(getConnectorId(activeConnector))
        } catch (e: any) {
          setError(e)
          await disconnect()
          clearCachedConnector()
        }
      }
    },
    [clearCachedConnector, disconnect, setCachedConnector, web3Context.connector],
  )

  const reconnect = useCallback(async () => {
    const connector = getConnector(cachedConnector)
    if (connector) {
      try {
        await connector.activate()
      } catch (e) {
        console.debug('Failed to connect to network')
        clearCachedConnector()
      }
    } else {
      clearCachedConnector()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    ...web3Context,
    error,
    connect,
    reconnect,
    disconnect,
  }
}

export const Connectors = () => {
  const Connector = ({ connector }: { connector: MetaMask | WalletConnect | CoinbaseWallet | Network }) => {
    const { connect } = useWeb3()
    const onConnect = useCallback((): void => {
      connect(connector).then()
    }, [connect, connector])

    return <div onClick={onConnect}>{getName(connector)}</div>
  }

  return (
    <Provider>
      {connectors.map((connector, i) => (
        <Connector connector={connector[0]} key={i} />
      ))}
    </Provider>
  )
}

const Provider = ({ children }: { children: ReactNode }) => {
  const cachedConnector = useWeb3Store((state) => state.connector)

  return (
    <Web3ReactProvider connectors={connectors} connectorOverride={getConnector(cachedConnector)}>
      {children}
    </Web3ReactProvider>
  )
}

export default Provider
