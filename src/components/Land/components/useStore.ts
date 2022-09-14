import create from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { ParcelOnMap } from '@/model/landModel'

interface StoreState {
  onPointerMissedEvent: boolean
  activeParcel: ParcelOnMap | null
  isDebugMode: boolean
  setIsDebugMode: (value: StoreState['isDebugMode']) => void
  setActiveParcel: (id: StoreState['activeParcel']) => void
  emitOnPointerMissed: () => void
}

export const useStore = create(
  subscribeWithSelector<StoreState>((set, get) => ({
    onPointerMissedEvent: false,
    activeParcel: null,
    isDebugMode: false,
    setIsDebugMode: (value: StoreState['isDebugMode']) => set({ isDebugMode: value }),
    setActiveParcel: (id: StoreState['activeParcel']) => set({ activeParcel: id }),
    emitOnPointerMissed: () => set({ onPointerMissedEvent: !get().onPointerMissedEvent }),
  })),
)
