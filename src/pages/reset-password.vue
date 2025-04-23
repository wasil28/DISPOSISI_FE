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
  title: 'Reset Password',
})

// State reaktif untuk menyimpan data formulir login
const dataForm = ref({
  new: '',
  confirm: '',
})

const passwordVisible = ref({
  new: false,
  confirm: false,
})

const schema = z.object({
  new: z.string({
    required_error: 'Wajib diisi',
    invalid_type_error: 'Wajib diisi!',
  }).min(8, 'Minimal 8 karakter').max(24, 'Maksimal 24 Karakter'),
  confirm: z.string({
    required_error: 'Wajib diisi',
    invalid_type_error: 'Wajib diisi!',
  }).min(8, 'Minimal 8 karakter').max(24, 'Maksimal 24 Karakter'),
})

const { locale } = useI18n()
const { t } = useLang()
const { query } = useRoute()
const localeUserSetting = ref<CookieRef<string>>(useCookie('i18n_utkurikulum'))

const activationCode = ref('')
const resetCode = ref('')
const email = ref('')

// Fungsi untuk submit reset password
const submitResetPassword = async () => {
  const param = {
    email: email.value,
    password: dataForm.value.new,
    passwordConfirmation: dataForm.value.confirm,
  }

  const isAktif = activationCode.value
    ? await LoginApi.aktivasiAkun({ ...param, code: activationCode.value })
    : await LoginApi.resetPassword({ ...param, code: resetCode.value })

  if (isAktif) {
    Swal.fire({
      icon: 'success',
      title: 'Reset Password Berhasil',
      text: 'Silakan login kembali menggunakan password baru Anda.',
      timer: 3000,
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      navigateTo('/login', { replace: true })
    })
  }
  else {
    Swal.fire({
      title: 'Gagal',
      text: isAktif.message ?? 'Gagal melakukan Reset Password',
      imageUrl: `${useNuxtApp().$config.app.baseURL}assets/images/illustration/error-image.png`,
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: 'Custom image',
    })
  }
}

onMounted(async () => {
  locale.value = localeUserSetting.value ?? 'id-ID'

  if (isEmptyObject(query))
    return navigateTo('/login', { replace: true })

  activationCode.value = query.activationCode
  resetCode.value = query.resetCode
  email.value = query.email
})

watch(localeUserSetting, () => {
  locale.value = localeUserSetting.value
})
</script>

<template>
  <!-- Tampilan formulir login -->
  <SectionFullScreen>
    <UForm :schema="schema" :state="dataForm" class="flex justify-around items-center h-screen w-screen bg-ut-bgBlue dark:bg-slate-900" @submit="submitResetPassword">
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
        <h1 class="min-w-80 text-2xl block text-left text-ut-textBlue dark:text-white font-bold mb-4">
          Reset Password
        </h1>

        <!-- Formulir login -->
        <div class="mt-4">
          <UFormGroup name="new" eager-validation>
            <template #label>
              <label class="flex items-center gap-x-1 text-xs text-ut-textBlue dark:text-white mb-2 font-semibold">Password Baru</label>
            </template>
            <div class="relative">
              <UInput v-model="dataForm.new" :type="passwordVisible.new ? 'text' : 'password'" size="xl" class="mb-2" color="blue" variant="outline" :placeholder="t('login_form.type_password')" />
              <UnoIcon class="!text-ut-textGray absolute right-3 top-3 cursor-pointer" :class="passwordVisible.new ? 'i-mdi-eye-off' : 'i-mdi-eye'" @click="passwordVisible.new = !passwordVisible.new" />
            </div>
          </UFormGroup>
          <UFormGroup name="confirm" eager-validation>
            <template #label>
              <label class="flex items-center gap-x-1 text-xs text-ut-textBlue dark:text-white mb-2 font-semibold">Konfirmasi Password Baru</label>
            </template>
            <div class="relative">
              <UInput v-model="dataForm.confirm" :type="passwordVisible.confirm ? 'text' : 'password'" size="xl" class="mb-2" color="blue" variant="outline" :placeholder="t('forgot_password.retype_password')" />
              <UnoIcon class="!text-ut-textGray absolute right-3 top-3 cursor-pointer" :class="passwordVisible.confirm ? 'i-mdi-eye-off' : 'i-mdi-eye'" @click="passwordVisible.confirm = !passwordVisible.confirm" />
            </div>
          </UFormGroup>
        </div>

        <!-- Tombol Login -->
        <div class="mt-4">
          <button type="submit" class="bg-ut-bgYellow text-ut-textBlue py-2.5 w-full rounded-full font-semibold transition-all duration-150 hover:bg-ut-bgYellow-hover">
            Reset Password
          </button>
        </div>
      </div>
    </UForm>
  </SectionFullScreen>
</template>
