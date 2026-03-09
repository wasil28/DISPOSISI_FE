<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import type { CookieRef } from 'nuxt/app'
import { AuthApi, LoginApi } from '~/apis'

definePageMeta({
  layoutTransition: true,
})

useHead({
  title: 'Login - Disposisi App',
})

const { session, refresh, update, overwrite } = await useSession()
const router = useRouter()
const { signIn } = useMSAuth()

const dataForm = reactive({
  username: '',
  password: '',
})

const schema = z.object({
  username: z.string({
    required_error: 'Wajib diisi',
    invalid_type_error: 'Wajib diisi!',
  }).min(3, 'Minimal 3 karakter').max(30, 'Maksimal 30 karakter'),
  password: z.string({
    required_error: 'Wajib diisi',
    invalid_type_error: 'Wajib diisi!',
  }).min(8, 'Minimal 8 karakter'),
})

const { locale } = useI18n()
const { t } = useLang()
const localeUserSetting = ref<CookieRef<string>>(useCookie('i18n_utkurikulum'))
const passwordVisible = ref(false)

const login = async (event: any) => {
  const param = {
    username: event.data.username,
    password: event.data.password,
  }

  await refresh()
  const isLogin = await LoginApi.login(param)

  if (isLogin && isLogin.data && isLogin.data.loginUser) {
    const token = isLogin.data.loginUser

    if (session.value?.token !== undefined) {
      await overwrite({ token })
    } else {
      await update({ token })
    }

    await update({ user: param })

    const mySession = await AuthApi.getSession(token)
    if (mySession.data && mySession.data.mySession) {
      const rolesUser = mySession.data.mySession?.userBssn.roles.sort((a: any, b: any) => a.id - b.id)

      // Default to adminpanel on successful login
      navigateTo('/adminpanel', { replace: true })
    }
  }
  else {
    const errorMessage = isLogin?.errors?.[0]?.message || 'Gagal login, periksa respons server.'
    await Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: errorMessage,
    })
  }
}

onBeforeMount(() => {
  if (session?.value?.token) {
    navigateTo('/adminpanel', { replace: true })
  }
})

onMounted(async () => {
  locale.value = localeUserSetting.value ?? 'id-ID'
})

const loginSso = async () => {
  await signIn()
}

watch(localeUserSetting, () => {
  locale.value = localeUserSetting.value
})
</script>

<template>
  <SectionFullScreen class="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center min-h-screen">

    <div
      class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-gray-100 relative z-10">

      <!-- Brand & Title -->
      <div class="text-center mb-8">
        <div
          class="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
          <UnoIcon class="i-mdi-book-open-page-variant text-3xl text-white" />
        </div>
        <h1 class="text-2xl font-extrabold text-gray-900">Sign In to Disposisi</h1>
        <p class="text-sm text-gray-500 mt-2">Enter your credentials to access the Dashboard.</p>
      </div>

      <!-- Login Form -->
      <UForm :schema="schema" :state="dataForm" @submit="login" class="space-y-6">

        <UFormGroup name="username">
          <template #label>
            <label class="text-sm font-semibold text-gray-700 block mb-1">Email or Username</label>
          </template>
          <UInput v-model="dataForm.username" size="lg" icon="i-mdi-account" placeholder="developer@gmail.com"
            :ui="{ wrapper: 'shadow-sm', base: 'bg-gray-50' }" />
        </UFormGroup>

        <UFormGroup name="password">
          <template #label>
            <label class="text-sm font-semibold text-gray-700 block mb-1">Password</label>
          </template>
          <div class="relative">
            <UInput v-model="dataForm.password" :type="passwordVisible ? 'text' : 'password'" size="lg"
              icon="i-mdi-lock" placeholder="••••••••" :ui="{ wrapper: 'shadow-sm', base: 'bg-gray-50 pr-10' }" />
            <button type="button"
              class="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
              @click="passwordVisible = !passwordVisible">
              <UnoIcon :class="passwordVisible ? 'i-mdi-eye-off' : 'i-mdi-eye'" class="text-lg" />
            </button>
          </div>
        </UFormGroup>

        <UButton type="submit" size="lg" block color="blue" variant="solid" class="font-bold tracking-wide mt-2">
          Sign In
        </UButton>

        <div class="relative flex py-4 items-center">
          <div class="flex-grow border-t border-gray-200"></div>
          <span class="flex-shrink-0 mx-4 text-gray-400 text-sm">or connect with</span>
          <div class="flex-grow border-t border-gray-200"></div>
        </div>

        <button type="button" @click="loginSso"
          class="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm">
          <!-- <img src="~/assets/images/logo-microsoft.png" alt="Microsoft 365" class="h-5 object-contain" /> -->
          <span>Microsoft 365 SSO</span>
        </button>

      </UForm>
    </div>

    <!-- Background Decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400 opacity-20 blur-3xl mix-blend-multiply">
      </div>
      <div
        class="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-400 opacity-20 blur-3xl mix-blend-multiply">
      </div>
    </div>
  </SectionFullScreen>
</template>

