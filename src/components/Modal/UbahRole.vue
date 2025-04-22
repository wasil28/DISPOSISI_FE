<script lang="ts" setup>
import Swal from 'sweetalert2'
import { AuthApi } from '~/apis'
import { useMenuStore } from '~/stores/menuStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },
})
const emit = defineEmits(['update:model-value', 'close'])
const menuStore = useMenuStore()
const { session, refresh, update } = await useSession()
const listRole = session.value?.dataRole
const mySess = session.value?.mySession

const roleExisting = session.value.activeRole
const isChangeMhs = ref(false)
const isChangePengembang = ref(false)
const isPengembang = reactive({
  userPengembang: 1
})

const open = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
  },
})

const handleUbahRole = async (role: any) => {
  await update({ activeRole: role })

  await fetchAndUpdateMenu(role.role.id)
}

function continueNavigation() {
  // Lakukan navigasi setelah fetch dan update menu selesai
  if (session.value.activeRole.role.kode == 'RL10' || session.value.activeRole.role.kode == 'RL11' || session.value.activeRole.role.kode == 'RL12')
    window.location.href = '/adminpanel/pengembangan-rps/rps'

  else if (session.value.activeRole.role.kode == 'RL09')
    window.location.href = '/portal/mitra'

  else
    window.location.href = '/adminpanel'
}

async function fetchAndUpdateMenu(roleId) {
  const paramHeader = {
    headers: {
      Authorization: `Bearer ${session.value.token}`,
    },
  }

  try {
    const dataMenu = await AuthApi.getMenu(roleId, paramHeader)

    if (dataMenu.status === 200) {
      // Set di pinia untuk sementara
      menuStore.setMenuItems(dataMenu.data)

      // get aside menu
      await update({ menuAside: menuStore.getMenuItems })
      // await refresh()

      continueNavigation()
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
</script>

<template>
  <ModalLoginAsMhs v-model="isChangeMhs" @close="isChangeMhs = false" />
  <ModalLoginAsPengembang v-model="isChangePengembang" :userTipe="isPengembang.userPengembang" @close="isChangePengembang = false" />

  <UModal
    v-if="isChangePengembang == false"
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
            Ubah Role
          </h3>
          <UButton
            color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
            @click="emit('close')"
          />
        </div>
      </template>

      <div class="space-y-4 text-sm">
        <div v-for="role in listRole" v-if="listRole.length != 0" :key="role.id" class="flex justify-between font-bold">
          <h1>
            {{ role.role.name }}
            <i v-if="role?.mitra && role.role.kode == 'RL09'" class="!font-medium">
              | {{ role?.mitra.namaMitra }}
            </i>
            <i v-if="role?.programStudi && role.role.kode == 'RL05' " class="!font-medium">
              | {{ role?.programStudi.namaProgramStudi }}
            </i>
            <i v-if="role?.fakultas && (role.role.kode == 'RL03' || role.role.kode == 'RL04') " class="!font-medium">
              | {{ role?.fakultas.namaFakultas }}
            </i>
          </h1>
          <span v-if="role.id == roleExisting.id" class="flex items-center gap-x-1.5 text-ut-bgGreenCheck"><UnoIcon class="i-mdi-circle text-xs" /> Aktif</span>
          <UButton v-else-if="false" type="button" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4" @click="isChangeMhs = true">
            <UnoIcon class="i-mdi-user" /> Login Sebagai Mahasiswa
          </UButton>
          <UButton v-else-if="role.role.kode == 'RL10' && mySess?.userKurikulum.idPengembang == null" type="button" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4" @click="isChangePengembang = true; isPengembang.userPengembang = 1">
            <UnoIcon class="i-mdi-user" /> Login Sebagai Penulis
          </UButton>
          <UButton v-else-if="role.role.kode == 'RL11' && mySess?.userKurikulum.idPengembang == null" type="button" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4" @click="isChangePengembang = true; isPengembang.userPengembang = 2">
            <UnoIcon class="i-mdi-user" /> Login Sebagai Penelaah
          </UButton>
          <UButton v-else type="button" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4" @click="handleUbahRole(role)">
            <UnoIcon class="i-mdi-user" /> Pilih Role
          </UButton>
        </div>
      </div>
    </UCard>
  </UModal>
</template>
