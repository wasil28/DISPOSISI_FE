<script setup lang="ts">
import { mdiBackburger, mdiForwardburger, mdiMenu } from '@mdi/js'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { CookieRef } from '#app'
import menuNavBar from '~/configs/modules/menuNavBar'
import { useDarkModeStore } from '~/stores/darkMode'
import BaseIcon from '@/components/BaseIcon.vue'
import NavBar from '@/components/NavBar.vue'
import NavBarItemPlain from '@/components/NavBarItemPlain.vue'
import AsideMenu from '@/components/AsideMenu.vue'
import FooterBar from '@/components/FooterBar.vue'
import { useLayoutStore } from '~/stores/layoutStore'

const layoutStore = useLayoutStore()

const { session, remove, refresh, update, reset, overwrite } = await useSession()

const menuAside = ref([])
const isAccess = ref(false)
const layoutAsidePadding = 'xl:pl-60'

const darkModeStore = useDarkModeStore()
const router = useRouter()

const isAsideMobileExpanded = ref(false)
const isAsideLgActive = ref(false)

const { locale } = useI18n()
const localeUserSetting = ref<CookieRef<string>>(useCookie('i18n_utkurikulum'))

router.beforeEach(() => {
  isAsideMobileExpanded.value = false
  isAsideLgActive.value = false
})

const menuClick = (event: any, item: any) => {
  if (item.isToggleLightDark)
    darkModeStore.set()

  if (item.isToggleLanguage)
    localeUserSetting.value = localeUserSetting.value === 'id-ID' ? 'en-US' : 'id-ID'

  if (item.isLogout) {
    // do something
  }
}

onMounted(() => {
  locale.value = localeUserSetting.value ?? 'id-ID'
})

watch(localeUserSetting, () => {
  locale.value = localeUserSetting.value
})

onBeforeMount(async () => {
  if (session.value?.menuAside) {
    isAccess.value = true
    menuAside.value = session.value.menuAside
  }
})
</script>

<template>
  <div
    :class="{
      'overflow-hidden lg:overflow-visible': isAsideMobileExpanded,
    }"
  >
    <div
      :class="[layoutAsidePadding, { 'ml-60 lg:ml-0': isAsideMobileExpanded }]"
      class="pt-14 min-h-screen w-screen transition-position lg:w-auto bg-gray-50 dark:bg-slate-900 dark:text-slate-100"
    >
      <!-- Top Bar -->
      <NavBar
        :menu="menuNavBar"
        :class="[layoutAsidePadding, { 'ml-60 lg:ml-0': isAsideMobileExpanded }]"
        @menu-click="menuClick"
      >
        <NavBarItemPlain
          display="flex lg:hidden"
          @click.prevent="isAsideMobileExpanded = !isAsideMobileExpanded"
        >
          <BaseIcon :path="isAsideMobileExpanded ? mdiBackburger : mdiForwardburger" size="24" />
        </NavBarItemPlain>

        <h1 class="font-semibold text-xl py-3 px-2.5 lg:py-2.5 lg:px-6 flex flex-col">
          {{ layoutStore.pageTitle }}
          <span class="text-xs text-ut-textGray">
            {{ layoutStore.pageBreadcrumb }}
          </span>
        </h1>

        <NavBarItemPlain display="hidden lg:flex xl:hidden" @click.prevent="isAsideLgActive = true">
          <BaseIcon :path="mdiMenu" size="24" />
        </NavBarItemPlain>
      </NavBar>

      <!-- Side Bar -->
      <AsideMenu
        :is-aside-mobile-expanded="isAsideMobileExpanded"
        :is-aside-lg-active="isAsideLgActive"
        :menu="menuAside"
        @menu-click="menuClick"
        @aside-lg-close-click="isAsideLgActive = false"
      />
      <div class="min-h-[calc(100vh-98px)]">
        <slot />
      </div>

      <FooterBar />
    </div>
  </div>
</template>

