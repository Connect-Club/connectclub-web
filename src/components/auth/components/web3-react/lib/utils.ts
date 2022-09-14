// @ts-nocheck
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import type { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'

export function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
  if (connector instanceof Network) return 'Network'
  return 'Unknown'
}

export function getConnectorId(connector: Connector) {
  if (connector instanceof MetaMask) return 'metaMask'
  if (connector instanceof WalletConnect) return 'walletConnect'
  if (connector instanceof CoinbaseWallet) return 'coinbaseWallet'
  if (connector instanceof Network) return 'network'
  return undefined
}
