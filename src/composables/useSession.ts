import { useAuthStore } from '~/stores/auth'

export const useSession = async () => {
  const store = useAuthStore()
  const tokenCookie = useCookie('auth_token', { maxAge: 60 * 60 * 8, path: '/' })
  const activeRoleCookie = useCookie('active_role_id', { maxAge: 60 * 60 * 8, path: '/' })

  // Hydrate token di SSR jika store masih kosong
  if (tokenCookie.value && !store.token) {
    store.token = tokenCookie.value as string
    
    // Perbaikan Hydration: Pastikan Pinia State terisi agar middleware /dashboard tidak mendapati token null!
    store.$patch({ token: tokenCookie.value as string })
  }

  // Data reaktif untuk template Vue
  const session = computed(() => store.$state)

  const update = async (payload: any) => {
    store.$patch(payload)
    if (payload.token) {
      tokenCookie.value = payload.token
    }
    if (payload.activeRole) {
      activeRoleCookie.value = String(payload.activeRole.id || payload.activeRole?.role?.id)
    }
  }

  const overwrite = async (payload: any) => {
    // Pada sidebase, overwrite mrpkn reset parsial. Kita samakan dengan update
    // krn kita menyimpan strukturnya.
    store.$patch(payload)
    if (payload.token) {
      tokenCookie.value = payload.token
    }
  }

  const remove = async () => {
    store.$reset()
    tokenCookie.value = null
    activeRoleCookie.value = null
    // Reset manual properti agar reaktif hilangnya terasa
    store.token = null
    store.user = null
    store.menuAside = []
    store.activeRole = null
    store.mySession = null
    store.konfigAplikasi = []
    store.otorisasi = null
    store.dataRole = []
  }

  const refresh = async () => {
    return Promise.resolve()
  }

  return { session, update, overwrite, remove, refresh }
}
