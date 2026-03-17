import { create } from 'zustand'

type ProvidersStore = {
  availableProviders: string[]
  loaded: boolean
  fetchProviders: () => Promise<void>
  isAvailable: (providerId: string) => boolean
}

export const useProvidersStore = create<ProvidersStore>((set, get) => ({
  availableProviders: [],
  loaded: false,

  fetchProviders: async () => {
    try {
      const res = await fetch('/api/providers')
      if (res.ok) {
        const data = await res.json()
        set({ availableProviders: data.providers, loaded: true })
      }
    } catch {
      set({ loaded: true })
    }
  },

  isAvailable: (providerId: string) => {
    return get().availableProviders.includes(providerId)
  },
}))
