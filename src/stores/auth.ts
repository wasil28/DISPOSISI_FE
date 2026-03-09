import { defineStore } from 'pinia'

export const useAuthStore = defineStore('authUser', {
  state: () => ({
    token: null as string | null,
    user: null as any,
    menuAside: [] as any[],
    activeRole: null as any,
    mySession: null as any,
    konfigAplikasi: [] as any[],
    otorisasi: null as any,
    dataRole: [] as any[],
  }),
})
