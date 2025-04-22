<script setup lang="ts">
import { InitApp } from '~/utils/initApp'
InitApp()
const locale = useState<string>('i18n_utkurikulum')

useHead({
  titleTemplate: '%s - Kurikulum UT',
})
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css',
    },
  ],
});
</script>

<template>
  <Html :lang="locale">
    <Body>
      <NuxtLayout>
        <div>
          <NuxtPage :key="$route.fullPath" />
        </div>
      </NuxtLayout>
    </Body>
  </Html>
</template>
