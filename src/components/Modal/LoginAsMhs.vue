<script lang="ts" setup>
import Swal from 'sweetalert2'
import { AuthApi, LoginApi, UserApi, Srs } from '~/apis'
import { useMenuStore } from '~/stores/menuStore'
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },
})
const emit = defineEmits(['update:model-value', 'close'])
const { session, overwrite, update, remove, refresh } = await useSession()
const { token } = session.value

const dataFormRole = reactive({
  email: null,
  nama_peserta: null,
})
const menuStore = useMenuStore()
const listRole = session.value?.dataRole
const roleExisting = session.value.activeRole
const errorMessage = ref(null)

const open = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
  },
})

const getMhs = async (email: string) => {
  if (email != null) {
    const dataMhs = await UserApi.getDataMhsByEmail(email, token)
    if (!dataMhs.statusCode) {
      dataFormRole.nama_peserta = dataMhs.data.name
      errorMessage.value = null
    }
    else {
      errorMessage.value = dataMhs.message
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Gagal',
      //   text: dataMhs.message,
      // })
    }
  }
}

const tokenApi = ref(null)
const { locale } = useI18n()
const localeUserSetting = ref<CookieRef<string>>(useCookie('i18n_utkurikulum'))
const loginAsMhs = async (data: any) => {
  Swal.fire({
    icon: 'question',
    title: 'Login Sebagai Mahasiswa?',
    text: 'Klik Submit untuk melanjutkan sebagai mahasiswa?.',
    showCancelButton: true,
    cancelButtonText: 'Tutup',
    confirmButtonText: 'Submit',
  }).then(async (result) => {
    const param = {
      email: data.email,
      password: 'bysystemwsl',
    }
    const loginAsMhs = await LoginApi.loginAsMhs(param, token)
    if (loginAsMhs.data != null) {
      // Set Nim
      locale.value = localeUserSetting.value ?? 'id-ID'

      tokenApi.value = sessionStorage.getItem('tokenSrs')
      if (!tokenApi.value)
        tokenApi.value = await useLoginSrs()

      const checkUserSrs = await Srs.getDataUserByEmail(data.email, tokenApi.value)
      if (checkUserSrs.code == 200) {
        await refresh()
        await remove()

        const nimMhsByDtPribadi = checkUserSrs.data.nim
        await update({ user: { email: data.email, nim: (nimMhsByDtPribadi ? nimMhsByDtPribadi :  data.email.split('@')[0]) } })
        const tokenNew = loginAsMhs.data.loginAsUserMhs
  
        await update({ token: tokenNew })
  
        navigateTo('/portal/mahasiswa', { replace: true })
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Data Mahasiswa tidak ditemukan pada Sistem SRS. Silahkan hubungi admin sistem.',
        })
        return
      }


    }
  })
}
</script>

<template>
  <UModal
    v-model="open"
    :ui="{
      width: 'w-full sm:max-w-lg',
    }"
    prevent-close
  >
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">
            Login Sebagai Mahasiswa
          </h3>
          <UButton
            color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
            @click="emit('close')"
          />
        </div>
      </template>

      <div class="space-y-4 text-sm">
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <UFormGroup name="email" required>
              <template #label>
                <label for="email" class="flex items-center gap-x-1 text-xs text-ut-textBlue dark:text-white mb-2 font-semibold"><UnoIcon class="i-mdi-account" /> Email Mahasiswa </label>
              </template>
              <template #default>
                <UInput v-model="dataFormRole.email" :required="true" size="sm" class="mb-2" color="blue" variant="outline" placeholder="Ketikan Email mahasiswa lalu tab" @blur="getMhs(dataFormRole.email)" />
              </template>
            </UFormGroup>
          </div>
          <div>
            <UFormGroup name="nama_peserta" required>
              <template #label>
                <label for="nama_peserta" class="flex items-center gap-x-1 text-xs text-ut-textBlue dark:text-white mb-2 font-semibold"><UnoIcon class="i-mdi-email" /> Nama Peserta</label>
              </template>
              <template #default>
                <UInput v-model="dataFormRole.nama_peserta" :required="true" readonly size="sm" class="mb-2" color="blue" variant="outline" placeholder="Silakan inputkan no peserta pada inputan" />
              </template>
            </UFormGroup>
          </div>
        </div>
        <span class="text-sm !text-red-400"> {{ errorMessage }} </span>
        <br>
        <UButton
          :disabled="errorMessage != null || dataFormRole.nama_peserta == null"
          class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4"
          @click="loginAsMhs(dataFormRole)"
        >
          Login
        </UButton>
      </div>
    </UCard>
  </UModal>
</template>
