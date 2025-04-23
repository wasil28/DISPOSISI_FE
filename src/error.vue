<script setup>
const props = defineProps({ error: Object })
const config = useRuntimeConfig()

useHead({
  title: `Error ${props.error.statusCode}`,
})
</script>

<template>
  <div class="error-container">
    <div v-if="(error.statusCode === 404)">
      <img class="!aspect-auto" :src="`${useNuxtApp().$config.app.baseURL}assets/images/404.webp`" alt="Error 404" width="400px">
      <h1 class="text-center font-semibold">
        Laman yang Anda cari tidak ditemukan.
      </h1>
      <h2 v-if="config.public.noveEnv === 'production'">
        Mohon periksa kembali alamat yang dituju.
      </h2>
      <h2 v-else>
        {{ `Error ${error.statusCode} :: ${error.message}` }}
      </h2>
      <NuxtLink class="cursor-pointer bg-ut-primaryBlue text-white disabled:cursor-default disabled:bg-opacity-40 uppercase text-[11px] w-fit h-full mt-6 py-2 px-4 rounded-lg" to="/">
        <div>
          <UnoIcon class="i-mdi-home align-middle mr-1 !text-[16px]" />
          <span>Kembali ke Beranda</span>
        </div>
      </NuxtLink>
    </div>
    <div v-else>
      <img :src="`${useNuxtApp().$config.app.baseURL}assets/images/error.webp`" alt="Error 500" width="340px">
      <h1 class="text-center font-semibold">
        Terjadi kesalahan pada sistem.
      </h1>
      <h2 v-if="config.public.noveEnv === 'production'">
        Silakan coba beberapa saat lagi, atau <NuxtLink class="text-primaryAdmin" to="https://hallo-ut.ut.ac.id/" target="_blank">
          hubungi kami.
        </NuxtLink>.
      </h2>
      <h2 v-else>
        {{ `Error ${error.statusCode} :: ${error.message}` }} <br>
        <span v-html="error.stack" />
      </h2>
      <NuxtLink class="cursor-pointer bg-ut-primaryBlue text-white disabled:cursor-default disabled:bg-opacity-40 uppercase text-[11px] w-fit h-full mt-6 py-2 px-4 rounded-lg" to="/">
        <div>
          <UnoIcon class="i-mdi-home align-middle mr-1 !text-[16px]" />
          <span>Kembali ke Beranda</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .error-container {
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #FFF;

    > div {
      display: flex;
      flex-direction: column;
      align-items: center;

      img {
        object-fit: contain;
      }

      h1 {
        font-size: 1.25rem;
        line-height: 1.75rem;
        margin-top: 2.5rem;
      }

      h2 {
        font-size: 1rem;
        line-height: 1.5rem;
        color: rgb(75 85 99 / 100%);
        margin-top: 0.75rem;
      }
    }
  }
</style>
