import Cookies from 'universal-cookie'
import create from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { isDevelopment } from '@/lib/utils'
import { GetTokenType } from '@/model/commonModel'
import { Web3ProviderContext } from '@/model/cryptoModel'

interface StoreState {
  token: GetTokenType | null
  setToken: (token: StoreState['token']) => void
  clearToken: () => void
  web3Provider: Web3ProviderContext | null
  setWeb3Provider: (web3: Partial<StoreState['web3Provider']>) => void
}

const cookies = new Cookies()

export const useStore = create(
  subscribeWithSelector<StoreState>((set) => ({
    token: cookies.get('ccUserToken'),
    setToken: (token: StoreState['token']) => {
      cookies.set('ccUserToken', token, {
        domain: `.${isDevelopment ? 'stage.' : ''}connect.club`,
        path: '/',
      })
      set({ token })
    },
    clearToken: () => {
      set({ token: null })
      cookies.remove('ccUserToken', {
        domain: `.${isDevelopment ? 'stage.' : ''}connect.club`,
        path: '/',
      })
    },
    web3Provider: null,
    setWeb3Provider: (web3: Partial<StoreState['web3Provider']>) => set((state) => ({ ...state, ...web3 })),
  })),
)
