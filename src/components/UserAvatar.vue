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
  <div>
    <slot />
    <img
      :src="`https://ui-avatars.com/api/?name=${username}&background=0055D0&color=FFFFFF&bold=true`"
      :alt="username"
      class="rounded-full block h-auto w-full max-w-full bg-gray-100 dark:bg-slate-800"
    >
  </div>
</template>
