// @ts-nocheck
import { useCallback, useState } from 'react'
import type { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import type { Web3ReactHooks } from '@web3-react/core'
import type { MetaMask } from '@web3-react/metamask'
import { WalletConnect } from '@web3-react/walletconnect'

import { CHAINS, getAddChainParameters } from '../lib/chains'

function ChainSelect({
  chainId,
  switchChain,
  chainIds,
}: {
  chainId: number | undefined
  switchChain: ((chainId: number) => void) | undefined
  chainIds: number[]
}) {
  return (
    <select
      value={chainId}
      onChange={(event) => {
        switchChain?.(Number(event.target.value))
      }}
      disabled={switchChain === undefined}
    >
      <option value={-1}>Default Chain</option>
      {chainIds.map((chainId) => (
        <option key={chainId} value={chainId}>
          {CHAINS[chainId]?.name ?? chainId}
        </option>
      ))}
    </select>
  )
}

export function ConnectWithSelect({
  connector,
  chainId,
  isActivating,
  isActive,
  error,
  setError,
}: {
  connector: MetaMask | WalletConnect | CoinbaseWallet
  chainId: ReturnType<Web3ReactHooks['useChainId']>
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  isActive: ReturnType<Web3ReactHooks['useIsActive']>
  error: Error | undefined
  setError: (error: Error | undefined) => void
}) {
  const chainIds = Object.keys(CHAINS).map((chainId) => Number(chainId))

  const [desiredChainId, setDesiredChainId] = useState<number>(-1)

  const switchChain = useCallback(
    (desiredChainId: number) => {
      setDesiredChainId(desiredChainId)
      // if we're already connected to the desired chain, return
      if (desiredChainId === chainId) {
        setError(undefined)
        return
      }

      // if they want to connect to the default chain and we're already connected, return
      if (desiredChainId === -1 && chainId !== undefined) {
        setError(undefined)
        return
      }

      if (connector instanceof WalletConnect) {
        connector
          .activate(desiredChainId === -1 ? undefined : desiredChainId)
          .then(() => setError(undefined))
          .catch(setError)
      } else {
        connector
          .activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
          .then(() => setError(undefined))
          .catch(setError)
      }
    },
    [connector, chainId, setError],
  )

  const onClick = useCallback((): void => {
    setError(undefined)
    if (connector instanceof WalletConnect) {
      connector
        .activate(desiredChainId === -1 ? undefined : desiredChainId)
        .then(() => setError(undefined))
        .catch(setError)
    } else {
      connector
        .activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
        .then(() => setError(undefined))
        .catch(setError)
    }
  }, [connector, desiredChainId, setError])

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <ChainSelect chainId={desiredChainId} switchChain={switchChain} chainIds={chainIds} />
        <div style={{ marginBottom: '1rem' }} />
        <button onClick={onClick}>Try Again?</button>
      </div>
    )
  } else if (isActive) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <ChainSelect chainId={desiredChainId === -1 ? -1 : chainId} switchChain={switchChain} chainIds={chainIds} />
        <div style={{ marginBottom: '1rem' }} />
        <button
          onClick={() => {
            if (connector?.deactivate) {
              void connector.deactivate()
            } else {
              void connector.resetState()
            }
          }}
        >
          Disconnect
        </button>
      </div>
    )
  } else {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <ChainSelect
          chainId={desiredChainId}
          switchChain={isActivating ? undefined : switchChain}
          chainIds={chainIds}
        />
        <div style={{ marginBottom: '1rem' }} />
        <button
          onClick={
            isActivating
              ? undefined
              : () =>
                  connector instanceof WalletConnect
                    ? connector
                        .activate(desiredChainId === -1 ? undefined : desiredChainId)
                        .then(() => setError(undefined))
                        .catch(setError)
                    : connector
                        .activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
                        .then(() => setError(undefined))
                        .catch(setError)
          }
          disabled={isActivating}
        >
          Connect
        </button>
      </div>
    )
  }
}
