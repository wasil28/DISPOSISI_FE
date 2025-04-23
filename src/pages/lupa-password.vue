<script setup lang="ts">
import Swal from 'sweetalert2'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import { LoginApi } from '~/apis'

definePageMeta({
  layoutTransition: true,
})
// Set title page
useHead({
  title: 'Lupa Password',
})

// State reaktif untuk menyimpan data formulir login
const dataForm = reactive({
  email: '',
})

const schema = z.object({
  email: z.string({
    required_error: 'Wajib diisi',
    invalid_type_error: 'Wajib diisi',
  }).email({
    message: 'Email tidak valid',
  }),
})

const { locale } = useI18n()
const { t } = useLang()
const localeUserSetting = ref<CookieRef<string>>(useCookie('i18n_utkurikulum'))

// Fungsi untuk submit lupa password
const submitForgotPassword = () => {
  LoginApi.requestResetPassword(dataForm.email, locale.value)

  Swal.fire({
    icon: 'success',
    title: 'Berhasil',
    html: `Tautan reset password telah dikirim ke email<br><b>${dataForm.email}</b>.`,
    timer: 3000,
  }).then(() => {
    navigateTo('/login', { replace: true })
  })
}

onMounted(async () => {
  locale.value = localeUserSetting.value ?? 'id-ID'
})

watch(localeUserSetting, () => {
  locale.value = localeUserSetting.value
})
</script>

<template>
  <!-- Tampilan formulir login -->
  <SectionFullScreen>
    <UForm :schema="schema" :state="dataForm" class="flex justify-around items-center h-screen w-screen bg-ut-bgBlue dark:bg-slate-900" @submit="submitForgotPassword">
      <NuxtLink class="fixed top-5 left-0 bg-white rounded-r-full pr-6 pl-2.5 py-3 hidden md:flex items-center gap-x-2" to="/">
        <img class="h-14" :src="`${useNuxtApp().$config.app.baseURL}assets/images/logo-ut-color.png`" alt="Logo UT">
        <img class="h-10" :src="`${useNuxtApp().$config.app.baseURL}assets/images/logo-kampus-merdeka.png`" alt="Logo Kampus Merdeka">
      </NuxtLink>
      <div class="hidden md:block w-1/3 text-center relative">
        <div class="absolute top-12 2xl:top-16 w-full">
          <h1 class="text-2xl 2xl:text-3xl text-white">
            Universitas Terbuka
          </h1>
          <h1 class="text-2xl 2xl:text-3xl text-white font-bold">
            Merdeka Belajar Kampus Merdeka
          </h1>
        </div>
        <img class="w-full" :src="`${useNuxtApp().$config.app.baseURL}assets/images/illustration/login-form.png`" alt="Login Illustration">
      </div>
      <div class="w-100 h-100 py-12 px-14 shadow-lg bg-white dark:bg-slate-800 rounded-xl">
        <h1 class="text-2xl block text-left text-ut-textBlue dark:text-white font-bold mb-4">
          {{ t('forgot_password.header_title') }}
        </h1>
        <p class="text-sm max-w-80 leading-5">
          {{ t('forgot_password.body_text') }}
        </p>

        <!-- Formulir login -->
        <div class="mt-4">
          <UFormGroup name="email" eager-validation>
            <template #label>
              <label class="flex items-center gap-x-1 text-xs text-ut-textBlue dark:text-white mb-2 font-semibold"><UnoIcon class="i-mdi-envelope" /> Email</label>
            </template>
            <UInput v-model="dataForm.email" size="xl" class="mb-2" color="blue" variant="outline" :placeholder="t('login_form.type_email')" />
          </UFormGroup>
        </div>

        <!-- Tombol Login -->
        <div class="mt-4">
          <button type="submit" class="bg-ut-bgYellow text-ut-textBlue py-2.5 w-full rounded-full font-semibold transition-all duration-150 hover:bg-ut-bgYellow-hover">
            Submit
          </button>
          <small class="block mt-1 mb-2 text-left text-xs text-ut-textBlue font-semibold"><NuxtLink to="/login" class="flex items-center"><UnoIcon class="i-mdi-arrow-left mr-1" /> {{ t('register_form.back_to_login') }}</NuxtLink></small>
        </div>
      </div>
    </UForm>
  </SectionFullScreen>
</template>
