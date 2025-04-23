<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { availableLocales } from '~/locales/availableLocales'

const config = useRuntimeConfig()
const { locale } = useI18n()
const localeUserSetting = ref<CookieRef<string>>(useCookie('i18n_utkurikulum'))
const { t } = useLang()

const toggleLanguage = () => {
  localeUserSetting.value = localeUserSetting.value === 'id-ID' ? 'en-US' : 'id-ID'
}

const mobileNav = ref(false)

const toggleMobileNav = () => {
  mobileNav.value = !mobileNav.value
}

const links_id = ref([
  {
    isLogoHeader: true,
    to: '/',
  },
  {
    isLanguageToggle: true,
    click: toggleLanguage,
  },
  {
    isLogin: true,
    label: 'Login',
    to: '/login',
  },
])

const links_en = ref([
  {
    isLogoHeader: true,
    to: '/',
  },
  {
    isLanguageToggle: true,
    click: toggleLanguage,
  },
  {
    isLogin: true,
    label: 'Login',
    to: '/login',
  },
])

onMounted(async () => {
  locale.value = localeUserSetting.value ?? 'id-ID'
})

watch(localeUserSetting, () => {
  locale.value = localeUserSetting.value
})
</script>

<template>
  <span class="fixed top-10 right-4 z-20 cursor-pointer shadow-md text-gray-500 bg-white p-1.5 flex sm:hidden justify-center items-center rounded-full" @click="toggleMobileNav">
    <UnoIcon class="text-xl" :class="mobileNav ? 'i-mdi-close' : 'i-mdi-menu'" />
  </span>

  <div class="absolute flex gap-x-10 w-full top-0 sm:top-10">
    <NuxtLink class="bg-white min-w-fit rounded-r-full pr-6 pl-2.5 py-3 hidden md:flex items-center gap-x-2" to="/">
      <img class="h-14" :src="`${useNuxtApp().$config.app.baseURL}assets/images/logo-ut-color.png`" alt="Logo UT">
    </NuxtLink>
    <UHorizontalNavigation :links="locale === 'id-ID' ? links_id.slice(0, links_id.length) : links_en.slice(0, links_en.length)" :ui="{ base: 'text-[0.85rem]', container: 'gap-x-6', before: 'hover:before:bg-transparent', active: 'after:bg-ut-bgYellow' }" class="horizontal-nav bg-transparent hidden sm:block justify-center [&>ul>li>a]:text-white [&>ul>li>a:hover]:text-ut-bgYellow [&>ul>li>a]:transition-all [&>ul>li>a]:duration-150">
      <template #default="{ link, isActive }">
        <span v-if="link.isLanguageToggle" class="font-semibold text-white flex gap-x-2">
          <img class="h-6" :src="`${useNuxtApp().$config.app.baseURL}assets/icons/${locale === 'id-ID' ? availableLocales.id.flag : availableLocales.en.flag}.webp`" alt="Country Flag"> {{ locale === 'id-ID' ? availableLocales.id.name : availableLocales.en.name }}
        </span>
        <span v-else-if="link.isLogin" class="font-semibold text-ut-primaryBlue bg-white px-8 py-1.5 rounded-full">
          {{ link.label }}
        </span>
        <span v-else :class="isActive ? 'font-semibold !text-ut-bgYellow' : ''">{{ link.label }}</span>
      </template>
    </UHorizontalNavigation>
    <UVerticalNavigation v-if="mobileNav" :links="locale === 'id-ID' ? links_id : links_en" :ui="{ active: 'before:bg-transparent before:-z-[1]', inactive: 'hover:before:bg-transparent' }" class="fixed bg-white shadow-md w-full block z-10 p-4 pt-9 sm:hidden justify-center [&>ul>li>a]:text-ut-tableBody [&>ul>li>a:hover]:text-ut-primaryBlue [&>ul>li>a]:transition-all [&>ul>li>a]:duration-150">
      <template #default="{ link, isActive }">
        <span v-if="link.isLogoHeader" class="min-w-fit rounded-r-full flex items-center gap-x-2">
          <img class="h-14 z-10" :src="`${useNuxtApp().$config.app.baseURL}assets/images/logo-ut-color.png`" alt="Logo UT">
          <img class="h-10 z-10" :src="`${useNuxtApp().$config.app.baseURL}assets/images/logo-kampus-merdeka.png`" alt="Logo Kampus Merdeka">
        </span>
        <span v-if="link.isLanguageToggle" class="font-semibold text-white flex gap-x-2">
          <img class="h-6" :src="`${useNuxtApp().$config.app.baseURL}assets/icons/${locale === 'id-ID' ? availableLocales.id.flag : availableLocales.en.flag}.webp`" alt="Country Flag"> {{ locale === 'id-ID' ? availableLocales.id.name : availableLocales.en.name }}
        </span>
        <span v-else-if="link.isLogin" class="font-semibold text-white bg-ut-primaryBlue px-8 py-1.5 rounded-full">
          {{ link.label }}
        </span>
        <span v-else :class="isActive ? 'font-semibold !text-ut-primaryBlue' : ''">{{ link.label }}</span>
      </template>
    </UVerticalNavigation>
  </div>

  <slot />

  <footer class="mt-16">
    <img class="w-full" :src="`${useNuxtApp().$config.app.baseURL}assets/images/background/landing-footer.png`" alt="Footer Background">
    <div class="grid grid-cols-1 gap-y-4 sm:gap-y-0 px-6 sm:px-0 sm:grid-cols-3 pt-4 sm:pt-0 pb-16 bg-ut-bgBlue-footer outline outline-2 outline-ut-bgBlue-footer">
      <div class="sm:justify-self-end">
        <img class="h-32" :src="`${useNuxtApp().$config.app.baseURL}assets/images/logo-ut-white.png`" alt="Logo UT">
      </div>
      <div class="sm:justify-self-center text-white">
        Jalan Cabe Raya, Pondok Cabe,<br>Pamulang, Tangerang Selatan<br>15437, Banten - Indonesia
      </div>
      <div class="sm:justify-self-start space-y-2 text-white">
        <span class="flex items-center gap-x-1.5">
          <UnoIcon class="i-mdi-phone" /> Hallo-UT <NuxtLink to="tel:1500024">1500024</NuxtLink>
        </span>
        <span class="flex items-center gap-x-1.5">
          <UnoIcon class="i-mdi-envelope" /> <NuxtLink to="mailto:hallo-ut.ut.ac.id">hallo-ut.ut.ac.id</NuxtLink>
        </span>
      </div>
    </div>
  </footer>
</template>

<style>
.horizontal-nav > ul > li:first-child {
  display: none;
}
</style>
