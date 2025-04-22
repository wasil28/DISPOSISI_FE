// utils/error.handler.js
import Swal from 'sweetalert2'

const loadingCount = 0
const loadingPromise = null
let loadingAwait = 0
let loadingSwal = null

const showSwal = (icon: string, title: string, text: string) => {
  Swal.fire({
    icon,
    title,
    text,
  })
}

// const startLoading = () => {
//   if (loadingCount === 0) {
//     Swal.fire({
//       title: 'Memuat...',
//       allowOutsideClick: false,
//       didOpen: () => {
//         Swal.showLoading()
//       },
//     })
//   }
//   loadingCount++
// }

// const stopLoading = () => {
//   loadingCount--
//   if (loadingCount === 0)
//     Swal.close()
// }

// const startLoading = () => {
//   if (!loadingPromise) {
//     loadingPromise = Swal.fire({
//       title: 'Memuat...',
//       allowOutsideClick: false,
//       didOpen: () => {
//         Swal.showLoading()
//       },
//     }).then(() => {
//       loadingPromise = null
//     })
//   }
// }

// const stopLoading = () => {
//   if (loadingPromise)
//     loadingPromise.then(Swal.close)
// }
// const startLoading = () => {
//   if (loadingAwait != 0) {
//     Swal.fire({
//       title: 'Memuat...',
//       allowOutsideClick: false,
//       didOpen: () => {
//         Swal.showLoading()
//       },
//     })
//   }
// }

// const stopLoading = () => {
//   // if (loadingPromise)
//   //   loadingPromise.then(Swal.close)
//   if (loadingAwait == 0)
//     Swal.close()
// }

const startLoading = () => {
  // if (loadingAwait > 0 && !loadingSwal) {
    loadingSwal = Swal.fire({
      title: 'Memuat...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })
  // }
}

const stopLoading = () => {
  // if (loadingAwait === 0 && loadingSwal) {
    loadingSwal?.close() // Menutup swal loading yang sedang ditampilkan
    loadingSwal = null // Reset loadingSwal
  // }
}

const handleClientError = (statusCode: number) => {
  if (statusCode === 404)
    showSwal('warning', 'Data Tidak Ditemukan', `Data yang Anda cari tidak ditemukan. (err: ${statusCode})`)
  else if (statusCode === 403)
    showSwal('warning', 'Terjadi kesalahan', `Autentikasi gagal. Silakan hubungi Admin. (err: ${statusCode})`)
  else if (statusCode === 500)
    showSwal('warning', 'Terjadi kesalahan', `Terjadi kesalahan pada server. Silakan hubungi Admin. (err: ${statusCode})`)
  else if (statusCode === 502)
    showSwal('warning', 'Terjadi kesalahan', `Server tidak merespon. Silakan hubungi Admin. (err: ${statusCode})`)
  else if (statusCode === 503)
    showSwal('warning', 'Terjadi kesalahan', `Terjadi kesalahan pada server. Silakan hubungi Admin. (err: ${statusCode})`)
  else
    showSwal('error', 'Terjadi kesalahan', `Terjadi kesalahan pada sistem. Silakan hubungi Admin. (err: ${statusCode})`)
}

const handleServerError = () => {
  showSwal('error', 'Kesalahan Server', 'Terjadi kesalahan pada server. Silakan coba lagi nanti.')
}

const handleNetworkError = () => {
  showSwal('error', 'Kesalahan Jaringan', 'Terjadi kesalahan jaringan. Silakan coba lagi nanti.')
}

export const handleApiError = (error: any) => {
  console.error('Error from API:', error)

  if (error.response) {
    const statusCode = error.response.status

    if (statusCode >= 400 && statusCode < 500)
      handleClientError(statusCode)
    else if (statusCode >= 500)
      handleServerError()
  }
  else {
    handleNetworkError()
  }

  stopLoading() // Berhenti loading setelah menangani kesalahan
  if (error.response.status == 401)
    return window.location.href = '/logout'
  else
    return error.response.data
}

export const handleGraphError = (error: any) => {
  console.log('Error from API:', error)

  if (error.response) {
    const statusCode = error.response.status

    if (statusCode >= 400 && statusCode < 500)
      handleClientError(statusCode)
    else if (statusCode >= 500)
      handleServerError()
  }
  else {
    handleNetworkError()
  }

  stopLoading() // Berhenti loading setelah menangani kesalahan
  if (error.response.status == 401)
    return window.location.href = '/logout'
  else
    showSwal('error', 'Kesalahan API', error.response.data.errors[0].message)
  return null
}

export const returnDataGraph = (response: any) => {
  stopLoading()
  if (response.data.data == null || response.data.errors) {
    if (response.data.errors[0].message == 'Sesi anda telah berakhir.')
      return window.location.href = '/logout'

    showSwal('error', 'Terjadi Kesalahan', response.data.errors[0].message)
    return null
  }
  else if (!response.data.errors && !response.data.error) {
    const dynamicProperty = Object.keys(response.data.data)[0]
    return response.data.data[dynamicProperty]
  }

  return null
}

export const handleApiErrorWithoutLogout = (error: any) => {
  console.error('Error from API:', error)
  console.log(error.response)
  if (error.response) {
    const statusCode = error.response.status

    if (statusCode >= 400 && statusCode < 500)
      handleClientError(statusCode)
    else if (statusCode >= 500)
      handleServerError()
  }
  else {
    handleNetworkError()
  }

  stopLoading() // Berhenti loading setelah menangani kesalahan

  return error.response.data
}
export const handleApiErrorSrs = (error: any) => {
  console.error('Error from API:', error)
  console.log(error.response)
  if (error.response) {
    const statusCode = error.response.status

    if (statusCode === 404)
      showSwal('warning', 'Data Tidak Ditemukan', `${error.response.data.message}`)
    else if (statusCode === 403)
      showSwal('warning', 'Terjadi kesalahan', `${error.response.data.message}`)
    else if (statusCode === 500)
      showSwal('warning', 'Terjadi kesalahan', `${error.response.data.message}`)
    else if (statusCode === 502)
      showSwal('warning', 'Terjadi kesalahan', `${error.response.data.message}`)
    else if (statusCode === 503)
      showSwal('warning', 'Terjadi kesalahan', `${error.response.data.message}`)
    else
      showSwal('error', 'Terjadi kesalahan', `${error.response.data.message}`)
  }
  else {
    handleNetworkError()
  }

  stopLoading() // Berhenti loading setelah menangani kesalahan
  console.log('send data : ', error.response.data)
  return error.response.data
}

// export const withLoading = async (apiCall: any) => {
//   loadingAwait = loadingAwait + 1
//   startLoading() // Mulai loading sebelum memanggil API
//   try {
//     return await apiCall()
//   }
//   finally {
//     loadingAwait = loadingAwait - 1
//     stopLoading() // Berhenti loading setelah pemanggilan API selesai, terlepas dari hasilnya
//   }
// }

export const withLoading = async (apiCall: any) => {
  loadingAwait++
  startLoading() // Mulai loading sebelum memanggil API

  try {
    return await apiCall()
  }
  finally {
    loadingAwait--
    stopLoading() // Berhenti loading setelah pemanggilan API selesai, terlepas dari hasilnya
  }
}

export const withoutLoading = async (apiCall: any) => {
  loadingAwait++

  try {
    return await apiCall()
  }
  finally {
    loadingAwait--
  }
}
