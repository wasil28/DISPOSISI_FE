import { AuthApi, UserApi } from '~/apis'
import { useMenuStore } from '~/stores/menuStore'
import { getAsideMenu, myAsyncFunction } from '~/utils/functions'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const module = to.meta.customMeta?.module||null

  const fullPath = (module ? module : to.fullPath)

  const { session, refresh, update } = await useSession()
  const menuStore = useMenuStore()
  await refresh()

  // Validasi Check apakah ada token
  if (!session.value?.token)
    return navigateTo('/logout', { replace: true })

  // Check mysession
  if (!session.value?.mySession) {
    const mySession = await AuthApi.getSession(session.value.token)

    // Check jika ada session
    if (mySession.data.mySession) {
      const { data } = await UserApi.getDataByEmail(mySession.data.mySession?.userBssn.email, session.value?.token)

      // Update session mySession
      await update({ dataRole: data.userRoles })
      await update({ mySession: mySession.data.mySession })
      await refresh()

      const rolesUser = data.userRoles.sort((a, b) => a.id - b.id)
      await update({ activeRole: rolesUser[0] })

      // Request Menu dari API
      const roleId = session.value.activeRole.role.id
      await fetchAndUpdateMenu(roleId)
    }
  }
  else {
    // Request Menu dari API

    const roleId = session.value.activeRole.role.id
    await fetchAndUpdateMenu(roleId)
  }

  // Access control
  const isAccess = await myAsyncFunction(session.value.menuAside, fullPath)
  if (!isAccess){
    return navigateTo('/unauthorized', { replace: true })
  }

  const otorisasiModul = await getAsideMenu(session.value.menuAside, fullPath)
  const otorisasi = {
    allow_approve: Boolean(otorisasiModul.allow_approve),
    allow_delete: Boolean(otorisasiModul.allow_delete),
    allow_download: Boolean(otorisasiModul.allow_download),
    allow_edit: Boolean(otorisasiModul.allow_edit),
    allow_new: Boolean(otorisasiModul.allow_new),
    allow_view: Boolean(otorisasiModul.allow_view),
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
      else {
        // Kondisi ketika gagal get menu
        // Handle failure scenario
      }
    }
    catch (error) {
      // Handle errors here
      console.error('Error fetching menu:', error)
    }
  }

  // Old otorisasi
  // if (!session.value?.menuAside) {
  //   const mySession = await AuthApi.getSession(session.value.token)

  //   // Check Jika ada session
  //   if (mySession.data.mySession) {
  //     // Check status admisi
  //     if (mySession.data.mySession?.userBssn.status === 0)
  //       return navigateTo('/mahasiswa/admisi')

  //     // Update session mySession
  //     await update({ mySession: mySession.data.mySession })
  //     await refresh()

  //     // Request Menu dari API
  //     const paramHeader = {
  //       headers: {
  //         Authorization: `Bearer ${session.value.token}`,
  //       },
  //     }
  //     const roleId = mySession.data.mySession?.userBssn.idGroup

  //     const dataMenu = await AuthApi.getMenu(roleId, paramHeader)
  //     if (dataMenu.status === 200) {
  //       // Set di pinia untuk sementara
  //       menuStore.setMenuItems(dataMenu.data)
  //       console.log('get menu ', menuStore.getMenuItems)

  //       // get aside menu
  //       await update({ menuAside: menuStore.getMenuItems })
  //       await refresh()

  //       // get data otorisasi per menu
  //       // const otorisasiModul = await getAsideMenu(menuStore.getMenuItems, to.fullPath)
  //       // console.log(otorisasiModul)
  //       // const otorisasi = {
  //       //   allow_approve: Boolean(otorisasiModul.allow_approve),
  //       //   allow_delete: Boolean(otorisasiModul.allow_delete),
  //       //   allow_download: Boolean(otorisasiModul.allow_download),
  //       //   allow_edit: Boolean(otorisasiModul.allow_edit),
  //       //   allow_new: Boolean(otorisasiModul.allow_new),
  //       //   allow_view: Boolean(otorisasiModul.allow_view),
  //       // }
  //       // await update({ otorisasi })
  //       // await refresh()

  //       // Pengecekan otorisasi antara menu & page
  //       // const isAccess = await myAsyncFunction(menuStore.getMenuItems, to.fullPath)
  //       // if (!isAccess) {
  //       //   // Jika tidak akses redirect ke unauth
  //       //   return navigateTo('/unauthorized')
  //       // }
  //     }
  //     else {
  //       // Kondisi ketika gagal get menu
  //     }
  //   }
  // }
  // else {
  //   console.log('Ter Otorisasi')
  //   const isAccess = await myAsyncFunction(session.value.menuAside, to.fullPath)
  //   if (!isAccess)
  //     return navigateTo('/unauthorized')

  //   const otorisasiModul = await getAsideMenu(session.value.menuAside, to.fullPath)
  //   const otorisasi = {
  //     allow_approve: Boolean(otorisasiModul.allow_approve),
  //     allow_delete: Boolean(otorisasiModul.allow_delete),
  //     allow_download: Boolean(otorisasiModul.allow_download),
  //     allow_edit: Boolean(otorisasiModul.allow_edit),
  //     allow_new: Boolean(otorisasiModul.allow_new),
  //     allow_view: Boolean(otorisasiModul.allow_view),
  //   }
  //   await update({ otorisasi })
  // }
})
