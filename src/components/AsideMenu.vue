<script setup lang="ts">
defineProps({
  menu: {
    type: Array,
    required: true,
  },
  isAsideMobileExpanded: Boolean,
  isAsideLgActive: Boolean,
  customClass: String,
  isPortal: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['menuClick', 'asideLgCloseClick'])

const menuClick = (event: any, item: any) => {
  emit('menuClick', event, item)
}

const asideLgCloseClick = (event: any) => {
  emit('asideLgCloseClick', event)
}
</script>

<template>
  <AsideMenuLayer
    :menu="menu"
    :is-portal="isPortal"
    class="bg-ut-asideBlue dark:bg-slate-800"
    :class="[
      isAsideMobileExpanded ? 'left-0' : '-left-60 lg:left-0',
      { 'lg:hidden xl:flex': !isAsideLgActive },
      customClass ?? '',
    ]"
    @menu-click="menuClick"
    @aside-lg-close-click="asideLgCloseClick"
  />
  <OverlayLayer v-show="isAsideLgActive" z-index="z-30" @overlay-click="asideLgCloseClick" />
</template>
