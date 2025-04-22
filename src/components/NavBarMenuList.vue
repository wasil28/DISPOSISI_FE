<script setup lang="ts">
import { object } from 'zod'

// import NavBarItem from '@/components/NavBarItem.vue'

defineProps({
  menu: {
    type: Array,
    default: () => [],
  },
  isPortal: Boolean,
})

const emit = defineEmits(['menuClick'])

interface defaultVfor {
  item: object
  index: number
}

const menuClick = (event: Event, item: any) => {
  emit('menuClick', event, item)
}
</script>

<template>
  <NavBarItem v-for="(item, index) in menu" :key="index" :item="item" :is-portal="isPortal" @menu-click="menuClick" />
</template>
