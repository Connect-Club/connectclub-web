import create from 'zustand'
import { persist } from 'zustand/middleware'

type Props = {
  connector?: string
  setConnector: (con: Props['connector']) => void
  clearConnector: () => void
}
export const useWeb3Store = create(
  persist<Props>(
    (set) => ({
      connector: undefined,
      setConnector: (con: Props['connector']) => set({ connector: con }),
      clearConnector: () => set({ connector: undefined }),
    }),
    {
      name: 'cc-web3-connector',
    },
  ),
)
