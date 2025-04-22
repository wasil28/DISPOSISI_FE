<script setup lang="ts">
import { AuthApi } from '~/apis'
import { useMenuStore } from '~/stores/menuStore'
import { myAsyncFunction } from '~/utils/functions'
const { session, remove, refresh, update, reset, overwrite } = await useSession()
const menuStore = useMenuStore()
const isAccess = ref(false)


onBeforeMount(async () => {
    const paramHeader = {
        headers: {
        Authorization: `Bearer ${session.value.token}`,
        },
    }
    const roleId = await AuthApi.getSession(session.value.token)
    console.log(roleId);
    if(roleId.data.mySession){
      // Jika tidak ada request by token ( otomatis get menu berdasarkan roleId )
      const response = await AuthApi.getMenu(roleId.data.mySession?.userBssn.idGroup,paramHeader)

      // Pengecekan Response
      if (response.status === 200) {
        // Set di pinia untuk sementara
        menuStore.setMenuItems(response.data)

        // Update ke session
        await update({ menuAside: menuStore.getMenuItems })
        await refresh()

        // Pengecekan otorisasi antara menu & page
        isAccess.value = await myAsyncFunction(await menuStore.getMenuItems)
        if (!isAccess.value) {
          // Jika tidak akses redirect ke unauth
          navigateTo('/unauthorized')
        }
      }
      else {

        // Swal.fire({
        //   icon: 'error',
        //   title: 'Gagal',
        //   text: response.message,
        // });
        // setTimeout(() => {
        //   router.push('/login')
        //   window.location.href = "/login";
        // }, 2000);
      }
    }

})

</script>

<template>
</template>
