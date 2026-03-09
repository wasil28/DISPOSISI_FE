import { AuthApi, UserApi } from '~/apis'
import { useMenuStore } from '~/stores/menuStore'
import { getAsideMenu, myAsyncFunction } from '~/utils/functions'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const publicRoutes = ['/logout', '/', '/session-expired']
  if (publicRoutes.includes(to.path)) {
    return
  }

  const module = to.meta.customMeta?.module || null
  const fullPath = (module ? module : to.fullPath)

  const { session, refresh, update } = await useSession()
  const menuStore = useMenuStore()
  const activeRoleCookie = useCookie('active_role_id', { maxAge: 60 * 60 * 8, path: '/' })
  await refresh()

  // Validasi Check apakah ada token
  if (!session.value?.token) {
    return navigateTo('/logout', { replace: true })
  }

  // Check mysession
  if (!session.value?.mySession) {
    const mySession = await AuthApi.getSession(session.value.token)

    // Check jika ada session
    if (mySession.data?.mySession) {
      const userBssn = mySession.data.mySession.userBssn;
      let rolesUser = userBssn.roles || [];

      // Update session mySession
      await update({ dataRole: rolesUser })
      await update({ mySession: mySession.data.mySession })
      await refresh()

      if (rolesUser.length > 0) {
        rolesUser = rolesUser.sort((a: any, b: any) => a.id - b.id)
        const savedRoleId = activeRoleCookie.value ? Number(activeRoleCookie.value) : null
        const savedRole = savedRoleId ? rolesUser.find((r: any) => r.id === savedRoleId) : null
        
        // Ensure activeRole matches the structure NavBarItem expects: { role: { kode: ... } }
        await update({ activeRole: { role: savedRole ?? rolesUser[0] } })
      }

      // Request Menu dari API
      const roleId = session.value?.activeRole?.role?.id || session.value?.activeRole?.id
      if (roleId) {
        await fetchAndUpdateMenu(roleId)
      }
    } else {
      return navigateTo('/logout', { replace: true })
    }
  }
  else {
    // Request Menu dari API
    const roleId = session.value?.activeRole?.role?.id || session.value?.activeRole?.id
    if (roleId) {
      await fetchAndUpdateMenu(roleId)
    }
  }

  // Access control
  const isAccess = await myAsyncFunction(session.value.menuAside, fullPath)
  // if (!isAccess){
  //   return navigateTo('/unauthorized', { replace: true })
  // }

  const otorisasiModul = await getAsideMenu(session.value.menuAside, fullPath)
  const otorisasi = {
    allow_approve: Boolean(otorisasiModul?.allow_approve ?? true),
    allow_delete: Boolean(otorisasiModul?.allow_delete ?? true),
    allow_download: Boolean(otorisasiModul?.allow_download ?? true),
    allow_edit: Boolean(otorisasiModul?.allow_edit ?? true),
    allow_new: Boolean(otorisasiModul?.allow_new ?? true),
    allow_view: Boolean(otorisasiModul?.allow_view ?? true),
  }
  await update({ otorisasi })

  async function fetchAndUpdateMenu(roleId) {
    const paramHeader = {
      headers: {
        Authorization: `Bearer ${session.value.token}`,
      },
    }

    try {
      const dataMenu = await AuthApi.getMenu(roleId, paramHeader)

      if (dataMenu.status === 200) {
        // Set di pinia untuk sementara
        menuStore.setMenuItems(dataMenu.data)

        // get aside menu
        await update({ menuAside: menuStore.getMenuItems })
        await refresh()
      }
    }
    catch (error) {
      console.error('Error fetching menu:', error)
    }
  }
})
