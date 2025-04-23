<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import { PublicClientApplication } from '@azure/msal-browser'
import { AuthApi, LoginApi, Srs } from '~/apis'
import type { loginData } from '~/types/generalTypes'
definePageMeta({
  layoutTransition: true,
})
// Set title page
useHead({
  title: 'Login',
})

// Menggunakan useSession untuk mengelola sesi
const { session, remove, refresh, update, reset, overwrite } = await useSession()

// Menggunakan router Vue untuk navigasi
const router = useRouter()
const tokenApi = ref(null)
const { locale } = useI18n()
const { t } = useLang()
const localeUserSetting = ref<CookieRef<string>>(useCookie('i18n_utkurikulum'))


onBeforeMount( async () => {
  startLoading()
  const vuexData = localStorage.getItem('vuex')
  
  if (vuexData) {
    // Parse JSON string menjadi objek JavaScript
    const vuexObj = JSON.parse(vuexData)
    // Akses token dari data yang sudah di-parse
    const token = vuexObj?.authService?.token

    // Memperbarui sesi dengan token baru
    if (session.value?.token !== undefined)
      await overwrite({ token })
    else
      await update({ token })

    await update({ user: vuexObj?.authService?.isUser?.user })
    const mySession = await AuthApi.getSession(token)
    if (mySession.data.mySession) {
      const rolesUser = mySession.data.mySession?.userBssn.roles.sort((a, b) => a.id - b.id)
      // Check status admisi
      stopLoading()
      // if (['RL11', 'RL12'].includes(rolesUser[0].kode)) { // Penulis dan penelaah
      //   navigateTo('/adminpanel/pengembangan-rps/rps', { replace: true })
      // } else if (['RL10'].includes(rolesUser[0].kode)) { // Pengembang
      //   navigateTo('/adminpanel/pengembangan-rps/rps', { replace: true })
      // }
      // else {
      console.log(rolesUser, 'rolesUser')
        navigateTo('/adminpanel', { replace: true })
      // }
    }
    stopLoading()
  } else {
    console.log('Data tidak ditemukan di localStorage')
  }
})


onMounted(async () => {
  locale.value = localeUserSetting.value ?? 'id-ID'
  
})
</script>

<template>
  <!-- Tampilan formulir login -->
  <SectionFullScreen class="flex items-center justify-center bg-gray-100">
    <div class="text-center">
      <img :src="`${useNuxtApp().$config.app.baseURL}assets/images/loading-cat.png`" alt="Loading Cat" class="mx-auto mb-4 h-24 w-24">
      <h1 class="text-xl font-semibold text-gray-700 mb-2">Mohon Tunggu</h1>
      <p class="text-gray-500">Sedang memuat halaman...</p>
    </div>
  </SectionFullScreen>
</template>