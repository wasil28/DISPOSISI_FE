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

// Captcha
const num1 = ref(Math.floor(Math.random() * 10) + 1)
const num2 = ref(Math.floor(Math.random() * 10) + 1)
const answer = ref(null)
const errorMessage = ref(null)
const isValid = computed(() => answer.value === num1.value + num2.value)
const generateNumbers = () => {
  num1.value = Math.floor(Math.random() * 10) + 1
  num2.value = Math.floor(Math.random() * 10) + 1
  answer.value = null
  errorMessage.value = null
}
const checkAnswer = () => {
  if (!isValid.value)
    errorMessage.value = 'Jawaban salah!'
  else
    errorMessage.value = null
}

// State reaktif untuk menyimpan data formulir login
const dataForm = reactive({
  username: '',
  password: '',
  token: '',
})
const schema = z.object({
  username: z.string({
    required_error: 'Wajib diisi',
    invalid_type_error: 'Wajib diisi!',
  }).min(3, 'Minimal 3 karakter').max(30, 'Maksimal 20 karakter'),
  password: z.string({
    required_error: 'Wajib diisi',
    invalid_type_error: 'Wajib diisi!',
  }).min(8, 'Minimal 8 karakter'),
})

type Schema = z.output<typeof schema>

const { locale } = useI18n()
const { t } = useLang()
const localeUserSetting = ref<CookieRef<string>>(useCookie('i18n_utkurikulum'))
const passwordVisible = ref(false)

// Fungsi untuk melakukan login
const login = async (event: any) => {
  if (!isValid.value) {
    Swal.fire({
      title: 'Gagal Login',
      text: 'silakan isi captcha terlebih dahulu',
      imageUrl: '/tte-bssn/assets/images/illustration/error-image.png',
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: 'Custom image',
    })
    errorMessage.value = 'Silakan isi captcha!'
    return
  }
  // if (event.data.username.split('@')[1] == 'ecampus.ut.ac.id') {
  //   Swal.fire({
  //     title: 'Gagal Login',
  //     text: 'silakan login menggunakan Microsoft 365',
  //     imageUrl: '/tte-bssn/assets/images/illustration/error-image.png',
  //     imageWidth: 400,
  //     imageHeight: 200,
  //     imageAlt: 'Custom image',
  //   })
  //   errorMessage.value = 'silakan login menggunakan Microsoft 365!'
  //   return
  // }
  const param = {
    username: event.data.username,
    password: event.data.password,
  }

  // Melakukan refresh sesi sebelum login
  await refresh()

  // Melakukan login dengan API
  const isLogin = await LoginApi.login(param)

  // Memeriksa status login
  if (isLogin.data != null) {
    const token = isLogin.data.loginUser

    // Memperbarui sesi dengan token baru
    if (session.value.token !== undefined)
      await overwrite({ token })
    else
      await update({ token })

    await update({ user: param })
    // await refresh()

    const mySession = await AuthApi.getSession(token)
    // Check jika ada session
    if (mySession.data.mySession) {
      const rolesUser = mySession.data.mySession?.userBssn.roles.sort((a, b) => a.id - b.id)
      // Check status admisi
      if (['RL11', 'RL12'].includes(rolesUser[0].kode)) { // Penulis dan penelaah
        navigateTo('/adminpanel/pengembangan-rps/rps', { replace: true })
      } else if (['RL10'].includes(rolesUser[0].kode)) { // Pengembang
        navigateTo('/adminpanel/pengembangan-rps/rps', { replace: true })
      }
      else {
        navigateTo('/adminpanel', { replace: true })
      }
    }
  }
  else {
    // Jika login gagal, tampilkan pesan kesalahan
    await Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: isLogin.errors[0].message,
    })
  }
}

const isLoggedIn = ref(false)

const loginSso = async () => {
  try {
    // Inisialisasi MSAL
    const msalInstance = new PublicClientApplication({
      auth: {
        clientId: 'ce97164d-180a-48cb-ad8a-d650abf67337',
        authority: 'https://login.microsoftonline.com/508916a0-7b89-43a1-af4e-72fe15aba5b9',
        redirectUri: useRuntimeConfig().public.baseEndpoint,
      },
      // auth: {
      //   clientId: '14a7d19a-ca92-472f-b95a-0becea012b5c',
      //   authority: 'https://login.microsoftonline.com/508916a0-7b89-43a1-af4e-72fe15aba5b9',
      //   redirectUri: useRuntimeConfig().public.baseEndpoint,
      // },
    })

    await msalInstance.initialize()

    // Memicu login popup
    const result = await msalInstance.loginPopup()
    const { idToken } = result.account

    const paramHeader = {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
    
    const verifyToken = await LoginApi.verifyTokenSso(paramHeader)
    
    if (verifyToken.status === 200) {
      const { email_365, name } = verifyToken

      // Pengecekan user ke SRS
      const checkUserSrs = await Srs.getDataUserByEmail(email_365, tokenApi.value)
      const paramUser = {
        email: email_365,
        name,
      }
      // Set default NIM
      let nimMhsByDtPribadi = email_365.split('@')[0]

      // Kondisi jika ada data SRS nanti otomatis dibuatkan user & groupnya berdasarkan group dari srs
      if (checkUserSrs.code == 200) {
        nimMhsByDtPribadi = checkUserSrs.data.nim
        paramUser.kode_group = checkUserSrs.data?.m_group?.kode_group
        paramUser.nama_group = checkUserSrs.data?.m_group?.nama_group
        paramUser.kode_unit = checkUserSrs.data?.m_group?.unit.kode_unit
        paramUser.nama_unit = checkUserSrs.data?.m_group?.unit.nama_unit
      }

      // // Pengecekan User Ke System & Buatkan User
      const checkUserSrsxKurikulum = await LoginApi.compareSrsxKurikulum(paramUser)
      if (checkUserSrsxKurikulum.data.compareSrsxKurikulum) {
        // Login Ke Sistem
        const login = await LoginApi.loginSso(email_365)
        if (login.data.loginUser) {
          const token = login.data.loginUser

          // Get Session hasil login
          const mySession = await AuthApi.getSession(token)

          // Check jika ada session
          if (mySession.data.mySession) {
            const rolesUser = mySession.data.mySession?.userBssn.roles.sort((a, b) => a.id - b.id)

            // Check Role - Jika tidak ada alert
            if (rolesUser.length == 0) {
              // navigateTo('/', { replace: true })
              // if (email_365.split('@')[1] == 'ecampus.ut.ac.id') {
              //   Swal.fire({
              //     title: 'Gagal Login',
              //     text: 'Akun anda tidak memenuhi syarat',
              //     imageUrl: '/tte-bssn/assets/images/illustration/error-image.png',
              //     imageWidth: 400,
              //     imageHeight: 200,
              //     imageAlt: 'Custom image',
              //   })
              //   return
              // } else {
                await Swal.fire({
                  icon: 'warning',
                  title: 'Info Login',
                  text: 'Akun email anda terdaftar, tetapi tidak aktif silakan hubungi admin',
                })
              // }
              return
            }
            else {
              // Set Token To localstorage
              await update({ token })
              await refresh()
              await update({ user: { email: email_365,} }) //compareSrsxKurikulum

              navigateTo('/adminpanel', { replace: true })
            }
          }
        }
        else {
        // Jika login gagal, tampilkan pesan kesalahan
          await Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'User Tidak Terdaftar',
          })
        }
      }
    }
    else {
      // Jika login gagal, tampilkan pesan kesalahan
      await Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Silakan Ulangi Kembali',
      })
    }

    isLoggedIn.value = true
  }
  catch (error) {
    console.error(error)
  }
}

// Fungsi untuk mendecode token dan menampilkan informasi pengguna
const decodeToken = async () => {
  const dataDecode = await LoginApi.decode()
}

onBeforeMount(() => {
  // If user is logged in then redirect to home page
  if (session?.value?.token) {
    // const rolesUser = session?.value?.activeRole.role
    // console.log('navigate to /adminpanel')
    navigateTo('/adminpanel', { replace: true })
  }
})

onMounted(async () => {
  locale.value = localeUserSetting.value ?? 'id-ID'

  tokenApi.value = sessionStorage.getItem('tokenSrs')
  
  if (tokenApi.value == null) {
    const isToken = await useLoginSrs()
    tokenApi.value = isToken 
  }
})

watch(localeUserSetting, () => {
  locale.value = localeUserSetting.value
})
</script>

<template>
  <!-- Tampilan formulir login -->
  <SectionFullScreen>
    <UForm :schema="schema" :state="dataForm" class="bg-ornament flex justify-around items-center h-screen w-screen bg-transparent bg-gradient-to-t from-[#BAD8FF] to-transparent from-10% 2xl:to-35% to-40% dark:bg-slate-900" @submit="login">
      <NuxtLink class="fixed top-5 left-0 bg-white shadow-md rounded-r-full pr-6 pl-4 py-2 hidden md:flex items-center gap-x-2" to="/">
        <img class="h-14" src="/tte-bssn/assets/images/logo-ut-color.png" alt="Logo UT">
      </NuxtLink>
      <div class="hidden md:block w-2/5 2xl:w-1/3 2xl:ml-56 md:ml-28 text-center relative">
        <img class="w-full" src="/tte-bssn/assets/images/illustration/bssn.png" alt="Login Illustration">
      </div>
      <div class="2xl:!w-[21%] z-10 md:!w-[30%] !w-[94%] h-100 p-0 bg-transparent dark:bg-slate-800 rounded-xl ml-auto 2xl:mr-60 md:mr-28 mr-auto">
        <h1 class="text-3xl block text-left text-ut-textBlue dark:text-white font-extrabold mb-6">
          <span class="text-xl font-bold">Selamat datang di</span><br>Aplikasi BSSN TTE
        </h1>

        <!-- Formulir login -->
        <div class="mt-4">
          <UFormGroup name="username" eager-validation>
            <template #label>
              <label class="flex items-center gap-x-1 text-xs text-ut-textBlue dark:text-white mb-2 font-semibold"><UnoIcon class="i-mdi-envelope" /> Email</label>
            </template>
            <UInput v-model="dataForm.username" size="xl" class="mb-2" color="blue" variant="outline" :placeholder="t('login_form.type_email')" />
          </UFormGroup>
        </div>
        <div class="mt-5">
          <UFormGroup name="password" eager-validation>
            <template #label>
              <label class="flex items-center gap-x-1 text-xs text-ut-textBlue dark:text-white mb-2 font-semibold"><UnoIcon class="i-mdi-lock" /> Password</label>
            </template>
            <div class="relative">
              <UInput v-model="dataForm.password" :type="passwordVisible ? 'text' : 'password'" size="xl" class="mb-2" color="blue" variant="outline" :placeholder="t('login_form.type_password')" />
              <UnoIcon class="!text-ut-textGray absolute right-3 top-3 cursor-pointer" :class="passwordVisible ? 'i-mdi-eye-off' : 'i-mdi-eye'" @click="passwordVisible = !passwordVisible" />
            </div>
          </UFormGroup>
          <!-- <NuxtLink to="/lupa-password" class="block mt-2 text-right text-xs text-ut-textGray" tabindex="-1">
            {{ t('login_form.forgot_password') }}
          </NuxtLink> -->
        </div>
        <div class="mt-3">
          <span class="text-sm leading-5">Silakan jawab pertanyaan berikut *</span>
          <br>
          <!-- <NuxtTurnstile ref="turnstile" v-model="dataForm.token" class="w-[300px]" /> -->
          <div class="flex items-center">
            <UBadge variant="outline" color="blue" size="lg">
              {{ num1 }} + {{ num2 }} = ?
            </UBadge>
            <UInput v-model="answer" type="number" size="sm" class="ml-2" :ui="{ base: '!bg-transparent !ring-ut-asideBlue' }" @blur="checkAnswer" />
            <UButton class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4 ml-2" icon="i-heroicons-arrow-path-solid" @click="generateNumbers" />
          </div>
          <span class="text-sm !text-red-400">{{ errorMessage }}</span>
        </div>
        <!-- Tombol Login -->
        <div class="mt-4">
          <button type="submit" class="bg-ut-bgYellow text-ut-textBlue py-2.5 w-full rounded-md font-semibold transition-all duration-150 hover:bg-ut-bgYellow-hover">
            {{ t('login_form.login') }}
          </button>
          <!-- <small class="block mt-1 mb-2 text-center text-xs text-ut-textBlue">{{ t('login_form.dont_have_account') }} <NuxtLink class="text-ut-bgBlue font-semibold" to="/registrasi">{{ t('login_form.sign_up') }}</NuxtLink></small> -->
          <small class="block mt-4 mb-2 text-center text-xs text-ut-textGray">Atau masuk menggunakan</small>
          <button type="button" class="bg-ut-textBlue text-white flex justify-center items-center py-2.5 w-full rounded-md font-semibold transition-all duration-150 hover:bg-ut-bgBlue-hover" @click="loginSso">
            <img class="h-5" src="/tte-bssn/assets/images/logo-microsoft.png" alt="Logo Microsoft 365">&nbsp;
          </button>
          <!-- <small class="block mt-4 mb-2 text-center text-xs text-ut-textGray">{{ t('login_form.login_condition') }}</small> -->
        </div>
      </div>
    </UForm>
  </SectionFullScreen>
</template>

<style scoped>
  .bg-ornament::before {
    content: '';
    background-image: url('/tte-bssn/assets/images/background/login-ornament.png');
    background-size: cover;
    background-repeat: no-repeat;
    width: 100%;
    height: 100%;
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 0;
  }
</style>
