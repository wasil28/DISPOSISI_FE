<script setup>
const { session, remove, refresh, update, reset, overwrite } = await useSession()
const router = useRouter()

// Set page title
useHead({
  title: 'Logout',
})

definePageMeta({
  layoutTransition: true,
})
onBeforeMount(async () => {
  await refresh()
  await remove()
  router.push('/')
  return window.location.href = '/'
})
</script>

<template>
  <p>&nbsp;</p>
</template>
