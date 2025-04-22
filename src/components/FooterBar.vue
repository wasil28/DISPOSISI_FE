<script setup lang="ts">
defineProps({
  isPortal: Boolean,
})
const { t } = useLang()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="py-2 px-6 xl:max-w-6xl xl:mx-auto">
    <BaseLevel>
      <div class="text-center md:text-left text-xs">
        {{ t('copyright') }} &copy; {{ year }} <a class="transition-all duration-150 hover:text-ut-primaryBlue" href="https://www.ut.ac.id/" target="_blank"> Universitas Terbuka</a>.
        <slot />
      </div>
      <div class="md:py-2" />
    </BaseLevel>
  </footer>
</template>
