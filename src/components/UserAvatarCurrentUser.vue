<script setup lang="ts">
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  isPortal: {
    type: Boolean,
    required: false,
    default: false,
  },
})
</script>

<template>
  <UserAvatar :username="username" :is-portal="isPortal">
    <slot />
  </UserAvatar>
</template>
