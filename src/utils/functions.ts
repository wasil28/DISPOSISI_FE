// utils/functions.js
// const { session, remove, refresh, update, reset, overwrite } = await useSession()
export const myAsyncFunction = async (parameter: any, currentPageName: any = null) => {
  if (currentPageName == null)
    currentPageName = window.location.pathname

  // Pengecekan dengan window.location.pathname
  const findPage = (items: any) => {
    for (const item of items) {
      const route = currentPageName.replace(/\//g, '').split('?')[0]
      const asideItems = item.to?.replace(/\//g, '')

      if (route === asideItems) {
        // Jika ditemukan match, lakukan sesuatu di sini
        return true // Hentikan pencarian setelah menemukan match
      }

      if (item.menu) {
        // Jika memiliki child menu, rekursif cek child menu
        const found = findPage(item.menu)
        if (found)
          return true // Hentikan pencarian jika ditemukan di dalam child menu
      }
    }
    return false // Tidak ditemukan pada item atau child menu
  }

  const isPageFound = findPage(parameter)

  if (!isPageFound)
    console.log('Anda tidak berada di halaman yang terdaftar')

  return isPageFound
}

export const getAsideMenu = async (parameter: any, currentPageName: any = null) => {
  if (currentPageName == null)
    currentPageName = window.location.pathname

  const getOtorisasi = (items: any) => {
    for (const item of items) {
      const route = currentPageName.replace(/\//g, '').split('?')[0]
      const asideItems = item.to?.replace(/\//g, '')

      if (route === asideItems) {
        // Jika ditemukan match, lakukan sesuatu di sini
        return item // Hentikan pencarian setelah menemukan match
      }

      if (item.menu) {
        // Jika memiliki child menu, rekursif cek child menu
        const found = getOtorisasi(item.menu)
        if (found)
          return found // Hentikan pencarian jika ditemukan di dalam child menu
      }
    }
    return null // Tidak ditemukan pada item atau child menu
  }

  const isPageFound = getOtorisasi(parameter)
  return isPageFound
}

export const isEmptyObject = (obj: any) => {
  return JSON.stringify(obj) === '{}'
}
