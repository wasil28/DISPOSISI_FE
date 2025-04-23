<script setup lang="ts">
import { mdiChevronDown, mdiChevronUp } from '@mdi/js'
import { useI18n } from 'vue-i18n'
import Swal from 'sweetalert2'
import { availableLocales } from '~/locales/availableLocales'
// import { PengembangApi } from '~/apis'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  isPortal: Boolean,
})

const emit = defineEmits(['menuClick'])

const { session, remove, refresh, update, reset, overwrite } = await useSession()
const token = ref(session.value?.token)



const is = computed(() => {
  if (props.item.href)
    return 'a'

  if (props.item.to)
    return 'NuxtLink'

  return 'div'
})

const { locale } = useI18n()
const isDropdownActive = ref(false)

const componentClass = computed(() => {
  const base = [
    isDropdownActive.value
      ? 'navbar-item-label-active dark:text-slate-400'
      : 'navbar-item-label dark:text-white dark:hover:text-slate-400',
    props.item.menu ? 'lg:py-2 lg:px-3' : 'py-2 px-3',
  ]

  if (props.item.isDesktopNoLabel)
    base.push('lg:w-12', 'lg:justify-center')

  return base
})

const isOpen = reactive({
  ubahRole: false,
  ubahAsMhs: false,
  ubahPassword: false,
  uploadTtd: false,
})


// cek user session 
const mySession = session.value?.mySession?.userBssn;
const roleData = session.value?.activeRole?.role;
const ttdExist = reactive({
  value: false
})
if(['RL10', 'RL11'].includes(roleData.kode)){
  // if(mySession.idPengembang != null && mySession.idPengembang != ''){
  //   const { data } = await PengembangApi.getDatapengembang(mySession.idPengembang , token);
  //   setTimeout(() => {
  //     ttdExist.value = data.fileTtd != null ? false : true
  //     if(ttdExist.value){
  //       isOpen.uploadTtd = true
  //     }
  //   }, 1000);
  // }
}


const closeTtd = () => {
  // console.log('closeTtd')
  // console.log('closeTtdV', mySession.idPengembang != null && mySession.idPengembang != '')
  // console.log('closeTtdV1', ttdExist.value)
  if(mySession.idPengembang != null && mySession.idPengembang != ''){
    if(!ttdExist.value){
      isOpen.uploadTtd = false
    }
  }else
  {
    isOpen.uploadTtd = false
  }
}

const userName = computed(() =>
  session.value?.mySession ? session.value?.mySession?.userBssn?.name : '',
)

const userRole = computed(() =>
  session.value ? session.value?.activeRole?.role?.name : '',
)

const userEmail = computed(() =>
  session.value?.mySession ? session.value.mySession?.userBssn?.email : '',
)


const roleExisting = session.value.activeRole
const isUbahRoleVisible = (session.value?.dataRole)?.length > 1
const isUbahTTD = (session.value?.activeRole?.role)?.kode == 'RL10' || (session.value?.activeRole?.role)?.kode == 'RL11' || (session.value?.activeRole?.role)?.kode == 'RL05'

const userDropdownItems = [
  [{
    slot: 'userProfile',
    avatar: {
      src: `https://ui-avatars.com/api/?name=${userName.value}&background=0055D0&color=FFFFFF&bold=true`,
    },
  }], [
    isUbahRoleVisible && !props.isPortal
      ? {
          label: 'Ubah Role',
          portal: false,
          icon: 'i-mdi-account-multiple-outline',
          click: () => {
            isOpen.ubahRole = true
          },
        }
      : { class: 'hidden' },

      isUbahTTD
      ? {
          label: 'Ubah Tanda Tangan',
          portal: false,
          icon: 'i-mdi-file-sign',
          click: () => {
            isOpen.uploadTtd = true
          },
        }
      : { class: 'hidden' },

    // {
    //   label: 'Login Sebagai Mahasiswa',
    //   icon: 'i-mdi-key-variant',
    //   click: () => {
    //     isOpen.ubahAsMhs = true
    //   },
    // },
    !props.isPortal
      ? {
          label: 'Ubah Password',
          portal: false,
          icon: 'i-mdi-key-variant',
          click: () => {
            isOpen.ubahPassword = true
          },
        }
      : { class: 'hidden' }], [{
    label: 'Logout',
    portal: true,
    icon: 'i-mdi-logout',
    click: () => {
      Swal.fire({
        icon: 'question',
        title: 'Konfirmasi',
        text: 'Apakah Anda yakin ingin logout dari aplikasi?',
        showCancelButton: true,
        cancelButtonText: 'Tidak',
        confirmButtonText: 'Ya',
        confirmButtonColor: '#0055D0',
      }).then((result) => {
        if (result.isConfirmed)
          navigateTo('/logout')
      })
    },
  }],
]

const menuClick = (event: Event) => {
  emit('menuClick', event, props.item)

  if (props.item.menu)
    isDropdownActive.value = !isDropdownActive.value
}

const menuClickDropdown = (event: Event, item: any) => {
  emit('menuClick', event, item)
}

const root = ref(null)

const forceClose = (event: Event) => {
  if (root.value && root.value.$el && !root.value.$el.contains(event.target))
    isDropdownActive.value = false
}
onMounted(() => {
  if (props.item.menu)
    window.addEventListener('click', forceClose)
})

onBeforeUnmount(() => {
  if (props.item.menu)
    window.removeEventListener('click', forceClose)
})
</script>

<template>
  <ModalUbahRole v-model="isOpen.ubahRole" @close="isOpen.ubahRole = false" />
  <ModalLoginAsMhs v-model="isOpen.ubahAsMhs" @close="isOpen.ubahAsMhs = false" />
  <ModalUbahPassword v-model="isOpen.ubahPassword" :token="token" @close="isOpen.ubahPassword = false" />
  <ModalUploadFileTtd v-model="isOpen.uploadTtd" :token="token" @close="closeTtd()" />

  <!-- currently show this label in hidden to fix bugs icon menu shown twice -->
  <small class="hidden">{{ item.label }}</small>

  <BaseDivider v-if="item.isDivider" nav-bar />
  <NuxtLink

    v-else-if="isPortal || !item.isToggleLanguage"
    ref="root"
    class="block lg:flex items-center relative cursor-pointer"
    :class="componentClass"
    :to="item.to ?? null"
    :target="item.target ?? null"
    @click="menuClick"
  >
    <div
      class="flex items-center"
      :class="{
        'bg-gray-100 dark:bg-slate-800 lg:bg-transparent lg:dark:bg-transparent p-3 lg:p-0':
          item.menu,
      }"
    >
      <template v-if="item.isCurrentUser">
        <UDropdown :items="userDropdownItems" :popper="{ placement: 'bottom-start' }">
          <span
            class="pr-2 transition-colors"
            :class="[item.isCurrentUser ? 'flex flex-col text-xs text-right' : '', { 'lg:hidden': item.isDesktopNoLabel && item.icon }]"
          ><span>{{ userName }}</span> <span class="text-ut-textGray">{{ userRole }}</span></span>
          <UserAvatarCurrentUser class="w-8 h-8 mr-3 inline-flex" :username="userName" :is-portal="isPortal" />

          <template #userProfile="{ dropdownItem }">
            <span class="transition-colors flex flex-col gap-y-0.5 text-xs text-left"><UserAvatarCurrentUser class="w-8 h-8" :username="userName" /><span>{{ userName }}</span><span class="text-ut-textGray">{{ userRole }}</span><span class="text-ut-textGray">{{ userEmail }}</span></span>
          </template>
        </UDropdown>
      </template>
      <BaseIcon v-if="item.icon !== 'customLangIcon'" :path="item.icon" class="transition-colors" :class="item.isCurrentUser ? 'hidden' : ''" />
      <div v-else>
        <img :src="`${useNuxtApp().$config.app.baseURL}assets/icons/${locale === 'id-ID' ? availableLocales.id.flag : availableLocales.en.flag}.webp`" class="max-h-[24px]">
      </div>
      <BaseIcon
        v-if="item.menu"
        :path="isDropdownActive ? mdiChevronUp : mdiChevronDown"
        class="hidden lg:inline-flex transition-colors"
      />
    </div>
    <div
      v-if="item.menu"
      class="text-sm border-b border-gray-100 lg:border lg:bg-white lg:absolute lg:top-full lg:left-0 lg:min-w-full lg:z-20 lg:rounded-lg lg:shadow-lg lg:dark:bg-slate-800 dark:border-slate-700"
      :class="{ 'lg:hidden': !isDropdownActive }"
    >
      <NavBarMenuList :menu="item.menu" @menu-click="menuClickDropdown" />
    </div>
  </NuxtLink>
</template>
