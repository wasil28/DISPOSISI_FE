<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import { LoginApi } from '~/apis'

useHead({
  title: 'Verifikasi Akun',
})

const { query } = useRoute()

const code = query.code
const email = query.email

onMounted(async () => {
  // Kirim kode ke API
  const param = {
    code,
    email,
  }
  const isVerif = await LoginApi.verifikasiAkun(param)
  if (isVerif) {
    await Swal.fire({
      icon: 'success',
      title: 'Verifikasi Berhasil',
      text: 'Silakan login menggunakan akun Anda.',
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed)
        navigateTo('/login', { replace: true })
    })
  }
  else {
    Swal.fire({
      title: 'Gagal Verifikasi, Pastikan URL benar',
      text: isVerif.message,
      imageUrl: '/assets/images/illustration/error-image.png',
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: 'Custom image',
    })
  }
})
</script>

<template>
</template>

