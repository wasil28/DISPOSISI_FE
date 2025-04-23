<script setup>
useHead({
  title: 'Unauthorized',
})
</script>

<template>
  <div class="error-container">
    <div>
      <!-- <img class="!aspect-auto" src="/assets/images/unauthorized.webp" alt="Unauthorized Image" width="400px"> -->
      <img class="!aspect-auto" :src="`${useNuxtApp().$config.app.baseURL}assets/images/unauthorized.webp`" alt="Unauthorized Image" width="400px">
      <h1 class="text-center font-semibold">
        Anda tidak memiliki akses pada laman ini.
      </h1>
      <h2>
        Mohon periksa kembali alamat yang dituju.
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
