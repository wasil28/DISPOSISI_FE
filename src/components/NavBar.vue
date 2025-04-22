<script setup lang="ts">
import { mdiClose, mdiDotsVertical } from '@mdi/js'

defineProps({
  menu: {
    type: Array,
    required: true,
  },
  isPortal: Boolean,
})

const emit = defineEmits(['menuClick'])

const menuClick = (event: Event, item: any) => {
  emit('menuClick', event, item)
}

const isMenuNavBarActive = ref(false)
</script>

<template>
  <nav
    class="top-0 inset-x-0 bg-white h-14 z-30 transition-position w-screen lg:w-auto dark:bg-slate-800"
    :class="isPortal ? 'sm:bg-transparent relative !pl-0' : 'sm:bg-gray-50 fixed'"
  >
    <div class="flex lg:items-stretch">
      <div class="flex flex-1 items-stretch h-14">
        <slot />
      </div>
      <div class="flex-none items-stretch flex h-14 lg:hidden">
        <NavBarItemPlain @click.prevent="isMenuNavBarActive = !isMenuNavBarActive">
          <BaseIcon :path="isMenuNavBarActive ? mdiClose : mdiDotsVertical" size="24" />
        </NavBarItemPlain>
      </div>
      <div
        class="max-h-screen-menu overflow-y-auto lg:overflow-visible absolute w-screen top-14 left-0 bg-white sm:bg-transparent shadow-lg lg:w-auto lg:flex lg:static lg:shadow-none"
        :class="[isMenuNavBarActive ? 'block' : 'hidden']"
      >
        <NavBarMenuList :menu="menu" :is-portal="isPortal" @menu-click="menuClick" />
      </div>
    </div>
  </nav>
</template>
