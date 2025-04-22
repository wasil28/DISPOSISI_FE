import Swal from 'sweetalert2'

let loadingSwal: any;

export const startLoading = () => {
  loadingSwal = Swal.fire({
    title: 'Memuat...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })
}

export const stopLoading = () => {
  if (loadingSwal) {
    loadingSwal.close();
  }
}
