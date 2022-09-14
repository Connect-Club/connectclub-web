import { JsonRpcSigner, Network, Web3Provider } from '@ethersproject/providers'
import amplitude from 'amplitude-js'
import { ContractInterface } from 'ethers'

import { Club } from '@/model/clubModel'

export type MintComponentProps = {
  tokenId: string
  smartContract: SmartContract
  abi: ContractInterface
  qrCodeLink: string
  appUrl: string
  isMobile: boolean | null
  amplitudeInst: typeof amplitude | null
}

export type Web3ProviderContext = {
  connected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  reconnect: () => Promise<void>
  disconnect: () => Promise<void>
  network?: Network
  provider?: Web3Provider
  signer?: JsonRpcSigner
  chainId?: number
  accountId?: string
  error: string
  smartContract?: SmartContract
}

export type ProviderRpcError = Error & {
  code: number
  data?: unknown
}

export type SmartContract = {
  url: string
  totalSupply: number
  maxTokenSupply: number
  contractAddress: string
  tokenPrice: string
  infuraUrl: string
  network: string
  balanceOf: number | null
  clubs: Array<{
    id: Club['id']
    description: Club['description']
    slug: Club['slug']
    title: Club['title']
    owner: Club['owner']
    interests: Club['interests']
    countParticipants: Club['countParticipants']
    avatar: Club['avatar']
  }>
}

export type TokenInfo = {
  attributes: Array<{
    trait_type: string
    value: string
  }>
  description: string
  external_url: string
  image: string
  name: string
}

export type AuthSignature = {
  nonce: string
  message: string
}
