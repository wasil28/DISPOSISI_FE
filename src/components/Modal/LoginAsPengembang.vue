<script lang="ts" setup>
import type { CookieRef } from '#app'
import Swal from 'sweetalert2'
import { AuthApi, LoginApi, UserApi, Srs } from '~/apis'
import { useMenuStore } from '~/stores/menuStore'
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },

  userTipe: {
    type: Number,
    required: true,
    default: false,
  },
})
const emit = defineEmits(['update:model-value', 'close'])
const { session, overwrite, update, remove, refresh } = await useSession()
const { token } = session.value

const dataUser = reactive({
  judulForm : "Penulis",
  userKode : "RL10",
})

onMounted(() => {
  // Add any additional logic you want to execute when the modal is accessed
  dataUser.judulForm = props.userTipe == 1 ? "Penulis" : "Penelaah"
  dataUser.userKode = props.userTipe == 1 ? "RL10" : "RL11"
});

watch(() => props.userTipe, (newVal) => {
  dataUser.judulForm = newVal == 1 ? "Penulis" : "Penelaah"
  dataUser.userKode = newVal == 1 ? "RL10" : "RL11"
});

const dataFormRole = reactive({
  emailPengembang: '',
  namaPengembang: '',
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

const getPengembang = async (email: any) => {
  if (email != null && email != '') {
    const dataMhs = await UserApi.getDataByEmail(email, token)

    if (dataMhs.status == 200) {
      dataFormRole.namaPengembang = dataMhs.data.name
      errorMessage.value = null
    }
    else {
      dataFormRole.namaPengembang = ''
      errorMessage.value = dataMhs.message
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Gagal',
      //   text: dataMhs.message,
      // })
    }
  }
}

async function fetchAndUpdateMenu(roleId) {
    const paramHeader = {
      headers: {
        Authorization: `Bearer ${session.value.token}`,
      },
    }

    try {
      // const dataRole = listRole.find((x:any) => x.role.kode == userKode);

      const dataMenu = await AuthApi.getMenu(roleId, paramHeader)

      if (dataMenu.status === 200) {
        // Set di pinia untuk sementara
        menuStore.setMenuItems(dataMenu.data)

        // get aside menu
        await update({ menuAside: menuStore.getMenuItems })
        await refresh()
      }
      else {
        // Kondisi ketika gagal get menu
        // Handle failure scenario
      }
    }
    catch (error) {
      // Handle errors here
      console.error('Error fetching menu:', error)
    }
  }

const tokenApi = ref(null)
const { locale } = useI18n()
const localeUserSetting = ref<CookieRef<string>>(useCookie('i18n_utmbkm'))
const loginAsPengembang = async (data: any) => {
  // console.log("pengembang", data)
  Swal.fire({
    icon: 'question',
    title: 'Login Sebagai ' + dataUser.judulForm + ' ?',
    text: 'Klik Submit untuk melanjutkan sebagai ' + dataUser.judulForm + ' ?.',
    showCancelButton: true,
    cancelButtonText: 'Tutup',
    confirmButtonText: 'Submit',
  }).then(async (result) => {
    startLoading()
    const tokenExist = true
    if(tokenExist){
      const loginAsPengembang = await LoginApi.loginAsPengembang(dataFormRole.emailPengembang, token)
      if (loginAsPengembang.data != null) {
        // Set Nim
        locale.value = localeUserSetting.value ?? 'id-ID'


        await refresh()
        await remove()

        // const nimMhsByDtPribadi = checkUserSrs.data.nim
        // await update({ user: { email: data.email, nim: (nimMhsByDtPribadi ? nimMhsByDtPribadi :  data.email.split('@')[0]) } })
        const tokenNew = loginAsPengembang.data.loginAsUserPengembang

        await update({ token: tokenNew })

        const mySession = await AuthApi.getSession(tokenNew)
        if (mySession.data.mySession) {
          const { data } = await UserApi.getDataByEmail(mySession.data.mySession?.userBssn.email, session.value?.token)
          

          // Update session mySession
          await update({ dataRole: data.userRoles })
          await update({ mySession: mySession.data.mySession })
          await refresh()

          // const rolesUser = data.userRoles.sort((a, b) => a.id - b.id)
          const rolesUser = data.userRoles.find((x:any) => x.role.kode == dataUser.userKode)
          // await update({ activeRole: rolesUser[0] })
          await update({ activeRole: rolesUser })

          // Request Menu dari API
          // console.log(session.value)
          const roleId = session.value.activeRole.idRole
          await fetchAndUpdateMenu(roleId)
          window.location.href = '/adminpanel/pengembangan-rps/rps';
          // navigateTo('/dashboard', { replace: true }) // Tentukan Redirect Hasil Login Pembimbing
        }

      }
    }
    stopLoading()
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
            Login Sebagai <b v-html="dataUser.judulForm"></b>
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
            <UFormGroup name="pengembang" required>
              <template #label>
                <label for="pengembang" class="flex items-center gap-x-1 text-xs text-ut-textBlue dark:text-white mb-2 font-semibold"><UnoIcon class="i-mdi-account" /> Email </label>
              </template>
              <template #default>
                <UInput autofocus v-model="dataFormRole.emailPengembang" :required="true" size="sm" class="mb-2" color="blue" variant="outline" placeholder="Ketikan Email lalu tab" @blur="getPengembang(dataFormRole.emailPengembang)" />
              </template>
            </UFormGroup>
          </div>
          <div>
            <UFormGroup name="nama_peserta" required>
              <template #label>
                <label for="nama_peserta" class="flex items-center gap-x-1 text-xs text-ut-textBlue dark:text-white mb-2 font-semibold"><UnoIcon class="i-mdi-email" /> Nama Peserta</label>
              </template>
              <template #default>
                <UInput v-model="dataFormRole.namaPengembang" :required="true" readonly size="sm" class="mb-2" color="blue" variant="outline" placeholder="Silakan inputkan Kode Pembimbing pada inputan" />
              </template>
            </UFormGroup>
          </div>
        </div>
        <span class="text-sm !text-red-400"> {{ errorMessage }} </span>
        <br>
        <UButton
          :disabled="errorMessage != null || dataFormRole.namaPengembang == null"
          class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4"
          @click="loginAsPengembang(dataFormRole)"
        >
          Login
        </UButton>
      </div>
    </UCard>
  </UModal>
</template>
