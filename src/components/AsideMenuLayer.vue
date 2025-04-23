<script setup lang="ts">
import { mdiClose } from '@mdi/js'
import Swal from 'sweetalert2'

defineProps({
  menu: {
    type: Array,
    required: true,
  },
  isPortal: Boolean,
})

const emit = defineEmits(['menuClick', 'asideLgCloseClick'])

const { t } = useLang()

const logoutItem = computed(() => ({
  label: 'Logout',
  icon: 'i-mdi-logout',
  isLogout: true,
  to: 'javascript:void(0)',
}))

const menuClick = (event: any, item: any) => {
  emit('menuClick', event, item)
}

const asideLgCloseClick = (event: any) => {
  emit('asideLgCloseClick', event)
}

const confirmLogout = () => {
  Swal.fire({
    icon: 'question',
    title: t('logout_confirmation'),
    text: t('logout_body_text'),
    showCancelButton: true,
    cancelButtonText: t('utils.action.no'),
    confirmButtonText: t('utils.action.yes'),
    confirmButtonColor: '#0055D0',
  }).then((result) => {
    if (result.isConfirmed)
      navigateTo('/logout')
  })
}
</script>

<template>
  <aside
    id="aside"
    class="py-2 lg:pl-2 w-60 fixed flex z-40 top-0 h-screen transition-position overflow-hidden"
  >
    <div class="aside flex-1 flex flex-col overflow-hidden" :class="isPortal ? 'lg:rounded-none' : 'lg:rounded-2xl'">
      <div class="aside-brand flex flex-row h-16 mb-5 items-center justify-center">
        <div class="flex justify-center flex-1 lg:text-left lg:pl-6 xl:text-center xl:pl-0">
          <img class="w-24" :src="`${useNuxtApp().$config.app.baseURL}assets/images/logo-ut-white.png`" alt="Logo Universitas Terbuka">
        </div>
        <button class="hidden lg:inline-block xl:hidden p-3" @click.prevent="asideLgCloseClick">
          <BaseIcon :path="mdiClose" />
        </button>
      </div>
      <div
        class="flex-1 overflow-y-auto overflow-x-hidden aside-scrollbars dark:aside-scrollbars-[slate]"
      >
        <AsideMenuList :menu="menu" @menu-click="menuClick" />
      </div>

      <!-- <ul>
        <AsideMenuItem v-if="isPortal" :item="logoutItem" :is-portal="isPortal" @menu-click="confirmLogout" />
      </ul> -->
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.aside-scrollbars {
  scrollbar-width: thin;
  scrollbar-color: #3389FE #D9D9D9;
}
</style>
