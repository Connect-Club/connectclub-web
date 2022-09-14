import { useLayoutEffect } from 'react'
import create from 'zustand'
import createContext from 'zustand/context'
import { subscribeWithSelector } from 'zustand/middleware'

import { UserWithScope } from '@/model/usersModel'

interface GlobalState {
  user: UserWithScope | null
  setUser: (user: GlobalState['user']) => void
}

type StoreType = ReturnType<typeof initializeStore>

let store: StoreType

const zustandContext = createContext<StoreType>()

export const Provider = zustandContext.Provider
export const useGlobalStore = zustandContext.useStoreApi
export const getGlobalStore = useGlobalStore

const getDefaultInitialState = () => ({
  user: null,
})

export const initializeStore = (preloadedState = {} as Partial<GlobalState>) => {
  return create(
    subscribeWithSelector<GlobalState>((set) => ({
      ...getDefaultInitialState(),
      ...preloadedState,
      setUser: (user: GlobalState['user']) => set({ user }),
    })),
  )
}

const useBrowserLayoutEffect =
  typeof window !== 'undefined'
    ? useLayoutEffect
    : () => {
        //
      }

export function useCreateStore(serverInitialState: Partial<GlobalState>) {
  const isReusingStore = Boolean(store)
  store = store ?? initializeStore(serverInitialState)
  useBrowserLayoutEffect(() => {
    if (isReusingStore && typeof window !== 'undefined') {
      store.setState(
        {
          ...store.getState(),
          ...serverInitialState,
        },
        true,
      )
    }
  })

  // Server side code: For SSR & SSG, always use a new store.
  if (typeof window === 'undefined') {
    return () => initializeStore(serverInitialState)
  }
  // End of server side code

  return () => store
}

export const isAdmin = () => {
  if (typeof window !== 'undefined') {
    const user = getGlobalStore().getState().user
    if (user) {
      return user.scope.includes('admin')
    }
  }
  return false
}
