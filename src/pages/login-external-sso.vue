<script setup lang="ts">
import { onBeforeMount, reactive } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import { z } from "zod";
import { useI18n } from "vue-i18n";
import { AuthApi, Srs, LoginApi } from '~/apis'
// Menggunakan useRoute untuk mendapatkan informasi route
import { useRoute } from 'vue-router'

// Menggunakan useSession untuk mengelola sesi
const { session, remove, refresh, update, reset, overwrite } = await useSession()

const route = useRoute()

// Ambil token dari query parameter
const tokenApi = ref(null) // ini buat SRS coy
const token = route.query.token || null

const getRedirectPage = (rolesUser: any) => {
  switch (rolesUser) {
    case "RL05": // Pembimbing
      navigateTo("/dashboard", { replace: true });
      break;
    case "RL03":
    // Prodi
    case "RL07": // Prodi
      navigateTo("/dashboard/prodi", { replace: true });
      break;
    case "RL04": // UPBJJ
      navigateTo("/dashboard/upbjj", { replace: true });
      break;
    default: // Other roles (add additional dashboards as needed)
      navigateTo("/dashboard/admin", { replace: true });
      break;
  }
};
onMounted(async () => {
  if (token) {

    const tokenApi: Ref<string | null> = ref(sessionStorage.getItem('tokenSrs'))
    if (!tokenApi.value) {
      tokenApi.value = await useLoginSrs()
    }

    // Lakukan request ke API untuk login menggunakan token
    const paramHeader = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

    // Verifikasi token dari MICROSOFT
    const verifyToken = await LoginApi.verifyTokenSsoDosen(paramHeader)

    if (verifyToken.status === 200) {
      // Hapus dari session yang aktif
      await refresh()
      await remove()

      // Ambil data dari token
      const { email_365, name } = verifyToken

      // Login Ke MBKM
      const login = await LoginApi.loginSso(email_365)
      if (login.data.loginUser) {

        const token = login.data.loginUser

        // Get Session hasil login
        const mySession = await AuthApi.getSession(token)
        if (mySession.data.mySession) {
          const role = mySession.data.mySession.user.roles.sort(
            (a, b) => a.id - b.id,
          )[0].kodeRole;

          // if (role) getRedirectPage(role);

          navigateTo("/dashboard", { replace: true });
        }
      }
      else {
        // Jika login gagal, tampilkan pesan kesalahan
        await Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Anda tidak terdaftar di sistem Kurikulum',
        })
      }

    } else {
      // Jika login gagal, tampilkan pesan kesalahan
      await Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Token Tidak Valid',
      })
    }
  }
})


</script>
