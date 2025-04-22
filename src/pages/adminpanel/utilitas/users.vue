<script setup lang="ts">
import { z } from 'zod'
import Swal from 'sweetalert2'
import { MasterUmum, RoleApi, UserApi } from '~/apis'

const { t } = useLang()

const { session, remove, refresh, update, reset, overwrite } = await useSession()
const otorisasi = ref({ allow_approve: false, allow_delete: false, allow_download: false, allow_edit: false, allow_new: false, allow_view: false })
const { token } = session.value
// Set title page
const layoutStore = useLayoutStore()
const pageTitle = 'Daftar Pengguna'
layoutStore.setTitleBreadcrumb(pageTitle, `Utilitas > ${pageTitle}`)
useHead({
  title: pageTitle,
})

definePageMeta({
  middleware: 'otorisasi',
  layout: 'module',
})

// List Kolom Untuk Table
const columns = [
  {
    key: 'aksi',
    label: 'Aksi',
    sortable: false,
    class: 'text-center !w-[105px] whitespace-normal',
  },
  {
    key: 'username',
    label: 'Nama Akun',
    sortable: true,
    class: 'whitespace-normal',
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    class: 'whitespace-normal',
  },
  {
    key: 'fullName',
    label: 'Nama User',
    sortable: true,
    class: 'whitespace-pre-wrap',
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
    class: 'whitespace-normal',
  },
  {
    key: 'aktif',
    label: 'Aktif',
    sortable: false,
    class: '!w-[105px] whitespace-normal text-center',
  },
]

const search = ref('')
const searchCompleted = ref('')

// State untuk mengatur sorting dan pagination
const sort = ref<sorter>({ column: 'id', direction: 'desc' })
const page = ref(1)
const pageCount = ref(10)

// State Reponse , data table , Meta
const response = ref({ data: [], totalItems: 0, totalPages: 0, currentPage: 0 })
const todos = ref([])
const meta = ref({ totalItems: 0, totalPages: 0, currentPage: 0 })

const dataRole = ref([])
const dataRoleUserParent = ref({})

// State Kebutuhan Dynamic Pagination
const totalItems = ref(0)
const totalPages = ref(0)
const currentPage = ref(0)
const pageTotal = ref(0)

// Trigger Modal
const isModalRole = ref(false)
const isModalActive = ref(false)
const isActive = ref(false)
const stateActive = ref(null)
const isDeleted = ref(false)
const isDeletedRole = ref(false)
const isProdi = ref(false)
const isFakultas = ref(false)
const isUpbjj = ref(false)

const typeForm = ref()
const dataFakultas = ref([])
const dataProdi = ref([])
const dataForm = reactive({
  id: null,
  active: null,
  username: null,
  email: null,
  fullName: null,
  // currentPassword: null,
  password: null,
  confirmPassword: null,
  status: null,
  idPengembang: null,
  role: [],
})
const dataFormRole = reactive({
  id: null,
  idRole: null,
  idFakultas: null,
  idProdi: null,
  idUpbjj: null
})

const resetDataForm = () => {
  dataForm.id = null
  dataForm.username = null
  dataForm.email = null
  dataForm.fullName = null
  // dataForm.currentPassword = null
  dataForm.password = null
  dataForm.confirmPassword = null
  dataForm.status = null
  dataForm.idPengembang = null
  // dataForm.role = []

  resetDataPengembang();
}
const updateDataForm = (data) => {
  dataForm.id = data.id
  dataForm.username = data.username
  dataForm.email = data.email
  dataForm.fullName = data.name
  // dataForm.currentPassword = data.currentPassword
  dataForm.password = data.password
  dataForm.confirmPassword = data.confirmPassword
  dataForm.status = data.status
  dataForm.idPengembang = data.idPengembang
  // dataForm.role = extractIds(data.roles)
  // conditionRole(extractIds(data.roles))
  console.log(data);
  if(data.idPengembang != null){
    dataPengembang.id = parseInt(data.idPengembang)
    dataPengembang.nip = data?.pengembangData?.nip
    dataPengembang.namaPengembang = data?.pengembangData?.namaLengkap
    dataPengembang.viewPengembang = `${data?.pengembangData?.nip} | ${data?.pengembangData?.namaLengkap}`
  }

  typeForm.value = 'edit'
}

// Dataform Role
const resetDataFormRole = () => {
  dataFormRole.id = null
  dataFormRole.idRole = null
  dataFormRole.idFakultas = null
  dataFormRole.idProdi = null
  dataFormRole.idUpbjj = null
}
const updateDataFormRole = (data) => {
  dataFormRole.id = data.id
  dataFormRole.idUser = data.idUser
}

let timeoutId: any = null
const handleInput = () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    searchCompleted.value = search.value
  }, 500)
}

// Function untuk mengambil data dari API
async function fetchData() {
  try {
    const newData = await getAllData() // Asumsikan ada fungsi getAllData() untuk mengambil data
    response.value = newData
  }
  catch (error) {
    console.error('Gagal mengambil data:', error)
  }
}

// Penyimpanan fetch data dari api role
const roles = ref<{
  id: number
  name: string
  description: string
  active: number
}[]>([])

// Menggunakan onMounted untuk memuat data roles saat komponen dipasang
onMounted(async () => {
  getRoles()
  // getFakultas()
  // getProdi()
  otorisasi.value = session.value.otorisasi
})

// Membuat computed property untuk items dropdown yang akan digunakan
const items = computed(() => roles.value.map(role => ({ label: role.label, value: role.value })))

// Get data API
const getAllData = async () => {
  try {
    const param = {
      start: page.value,
      offset: pageCount.value,
      order: sort.value.direction.toUpperCase(),
      orderBy: sort.value.column,
      keyword: search.value,
    }
    const dataFetch = await UserApi.getAllData(param, token)
    return dataFetch
  }
  catch (error) {
    console.error('Gagal mengambil data:', error)

    // Ambil pesan kesalahan dari objek error
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat mengirim data. Silakan coba lagi.'

    // Tampilkan pesan kesalahan menggunakan swal
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: errorMessage,
    })

    return null
  }
}

function removeItemsByCodes(data, codesToRemove) {
  return data.filter(item => !codesToRemove.includes(item.kode))
}

// Pengambilan data referensi role group
const getRoles = async () => {
  try {
    const paramRole = {
      start: 1,
      offset: 9999,
      orderBy: 'id',
      order: 'DESC',
      keyword: '',
    }
    const { data } = await RoleApi.getAllData(paramRole, token) // Ganti dengan panggilan ke API yang sesuai

    // const codesToRemove = ['RL10', 'RL01'] // Kode-kode yang ingin dihapus
    const codesToRemove = ['RL01'] // Kode-kode yang ingin dihapus
    const updatedData = removeItemsByCodes(data, codesToRemove)
    roles.value = updatedData
  }
  catch (error) {
    console.error('Gagal mengambil data api roles:', error)
    roles.value = []
  }
}

// const getProdi = async () => {
//   const { data } = await MasterUmum.getAllDataProgramStudi(token) // Ganti dengan panggilan ke API yang sesuai
//   dataProdi.value = data
//   // console.log(dataProdi.value)
// }

// const getFakultas = async () => {
//   const { data } = await MasterUmum.getAllDataFakultas(token) // Ganti dengan panggilan ke API yang sesuai
//   dataFakultas.value = data
//   // console.log(dataFakultas.value)
// }

const getDataRoleByIdUser = async (id: number) => {
  const { data } = await UserApi.getDataById(id, token) // Ganti dengan panggilan ke API yang sesuai
  dataRole.value = data.userRoles
  dataRoleUserParent.value = data
}

// Menggunakan useLazyAsyncData untuk memuat data secara lazy
const { pending } = await useLazyAsyncData('response', async () => {
  // console.log(searchCompleted)
  await fetchData()
}, {
  default: () => ({ data: [], totalItems: 0, totalPages: 0, currentPage: 0 }),
  watch: [page, searchCompleted, pageCount, sort],
})

// Watcher untuk merespon perubahan pada response.value
watch(response, (newValue, oldValue) => {
  if (newValue) {
    // Menyimpan data dan metadata pagination yang baru
    todos.value = newValue.data || []
    meta.value = newValue.meta || { totalItems: 0, totalPages: 0, currentPage: 0 }

    // Memperbarui nilai totalItems, totalPages, dan currentPage
    totalItems.value = meta.value.totalItems
    totalPages.value = meta.value.totalPages
    currentPage.value = meta.value.currentPage
    pageTotal.value = totalItems.value
  }
})

// Menghitung range data yang ditampilkan pada halaman saat ini
const pageFrom = computed(() => (currentPage.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(currentPage.value * pageCount.value, totalItems.value))

// Validation array object role
const roleValidation = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  active: z.number(),
})
// Validation Pakai Zod
const baseSchema = {

  email: z.string({
    required_error: 'Wajib diisi',
    invalid_type_error: 'Wajib diisi!',
  }).email(),

}
const additionalSchema = {
  currentPassword: z.string({
    required_error: 'Wajib diisi',
    invalid_type_error: 'Wajib diisi!',
  }).min(8, 'Minimal 8 karakter'),
}

const editSchema = z.object({
  ...baseSchema,
})

const createSchema = z.object({
  ... baseSchema,
  password: z.string({
    required_error: 'Wajib diisi',
    invalid_type_error: 'Wajib diisi!',
  }).min(8, 'Minimal 8 karakter'),

  confirmPassword: z.string({
    required_error: 'Wajib diisi',
    invalid_type_error: 'Wajib diisi!',
  }).min(8, 'Minimal 8 karakter'),
})

const paramGetData = ref(
  {
    start: 1,
    offset: 10,
  },
)

const onSubmit = async (event) => {
  // Do something with data
  const param = {
    username: event.data.username,
    email: event.data.email,
    name: event.data.fullName,
    password: event.data.password,
    confirmPassword: event.data.confirmPassword,
  }
  
  if (event.data.email.includes("ecampus.ut.ac.id"))
    param.ecampusAccount = event.data.email

  if (typeForm.value === 'edit')
    param.status = (event.data.status == null ? 1 : ((stateActive.value != null) ? stateActive.value : event.data.status))

    if(dataPengembang.id != null && dataPengembang.id != '')
      param.idPengembang = dataPengembang.id

  // if (typeForm.value != 'add')
  //   param.currentPassword = event.data.currentPassword

  const is_add = await insertDataForm(((typeForm.value === 'edit') ? event.data.id : null), param)

  if (is_add) {
    fetchData()

    const reset = await resetDataForm()
    isModalActive.value = false
  }
  else {
    isModalActive.value = true
  }
}

const onSubmitRole = async (data) => {
  // console.log(data)

  const param = {
    roleIds: data.data.idRole,
  }

  if (data.data.idProdi)
    param.idProdi = data.data.idProdi

  if (data.data.idFakultas)
    param.idFakultas = data.data.idFakultas

  const updateRoleData = await UserApi.editRoleData(data.data.id, param, token)
  // console.log(updateRoleData)
  if (updateRoleData.status == 200) {
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data berhasil disimpan!',
    })
    getDataRoleByIdUser(data.data.id)
    dataFormRole.idRole = null
    dataFormRole.idProdi = null
    dataFormRole.idFakultas = null
    dataFormRole.idUpbjj = null

    conditionRole(0)
  }
  else {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Simpan',
      text: updateRoleData.message,
    })
  }
}

const insertDataForm = async (id = null, param) => {
  try {
    // Pastikan typeForm sudah didefinisikan
    if (!typeForm.value) {
      console.error('Tipe form tidak terdefinisi')
      return false
    }

    // Tentukan endpoint API berdasarkan tipe form
    const apiEndpoint = typeForm.value === 'add' ? UserApi.addData : UserApi.editData

    // Panggil API dan dapatkan hasilnya
    const dataFetch = await apiEndpoint(id, param, token)

    // Lakukan sesuatu dengan dataFetch (hasil dari API)
    // Misalnya, tampilkan pesan sukses menggunakan swal
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data berhasil disimpan!',
    })

    // return dataFetch atau nilai true sesuai kebutuhan
    return true
  }
  catch (error) {
    console.error('Gagal mengambil data:', error)

    // Ambil pesan kesalahan dari objek error
    const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat mengirim data. Silakan coba lagi.'

    // Tampilkan pesan kesalahan menggunakan swal
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: errorMessage,
    })

    return false
  }
}

const deleteForm = async (id) => {
  const isDeleted = await UserApi.deleteData(id, token)

  page.value = 1

  if (isDeleted.status == 200) {
    await fetchData()
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: isDeleted.data,
    })
  }
  else {
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: isDeleted.message,
    })
  }
}

const deleteFormRole = async (id: number) => {
  const isDeleted = await UserApi.deleteRoleData(id, token)

  page.value = 1

  if (isDeleted.status == 200) {
    // await fetchData()
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: isDeleted.data,
    })
    getDataRoleByIdUser(dataFormRole.idUser)
  }
  else {
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: isDeleted.message,
    })
  }
}

function extractIds(dataArray) {
  return dataArray.map(item => item.id)
}

const selected = ref([])

const conditionRole = (data) => {
  if (data == 3 || data == 4) {
    isFakultas.value = true
    isProdi.value = false
    isUpbjj.value = false
    dataFormRole.idProdi = null
    dataFormRole.idUpbjj = null
  }
  else if (data == 5) {
    isFakultas.value = false
    isProdi.value = true
    isUpbjj.value = false
    dataFormRole.idFakultas = null
    dataFormRole.idUpbjj = null
  }
  else if (data == 9) {
    isFakultas.value = false
    isProdi.value = false
    isUpbjj.value = true
    dataFormRole.idProdi = null
    dataFormRole.idFakultas = null
  }
  else {
    isFakultas.value = false
    isProdi.value = false
    isUpbjj.value = false
    dataFormRole.idProdi = null
    dataFormRole.idFakultas = null
    dataFormRole.idUpbjj = null
  }
}

const setRoleUser = (data) => {
  isModalRole.value = true
  resetDataFormRole()
  dataFormRole.id = data.id
  dataRole.value = data.userRoles
  dataRoleUserParent.value = data
}

// declare untuk modal pengembang 
const dataPengembang = reactive({
  id: 0,
  nip: '',
  namaPengembang: '',
  viewPengembang: '',
})

const resetDataPengembang = async() => {
  dataPengembang.id = 0
  dataPengembang.nip = ''
  dataPengembang.namaPengembang = ''
  dataPengembang.viewPengembang = ''
}

const columnsPengembang = [
  {
    key: 'nip',
    label: 'NIP',
    sortable: false,
    class: '!w-[100px] whitespace-normal',
  },
  {
    key: 'namaLengkap',
    label: 'Nama Lengkap',
    sortable: false,
    class: '!w-[100px] whitespace-normal',
  },
  {
    key: 'email',
    label: 'Email',
    sortable: false,
    class: '!w-[100px] whitespace-normal',
  },
  {
    key: 'pekerjaan',
    label: 'Pekerjaan',
    sortable: false,
    class: '!w-[100px] whitespace-normal',
  },
  {
    key: 'namaInstitusi',
    label: 'Institusi',
    sortable: false,
    class: '!w-[100px] whitespace-normal',
  },
]

// state untuk searching
const filterPengembang = ref('')
const searchPengembang = ref('')
const searchCompletedPengembang = ref('')

const isModalOpenPengembang = ref(false)
const openModal = () => {
  if(dataForm.idPengembang == 0 || dataForm.idPengembang == null){
    isModalActive.value = false
    fetchDataPengembang()
    isModalOpenPengembang.value = true
  }
}

// State untuk mengatur sorting dan pagination
const sortPengembang = ref<sorter>({ column: 'kodeBahanAjar', direction: 'asc' })
const pagePengembang = ref(1)
const pageCountPengembang = ref(10)

// State Reponse , data table , Metaf
const responsePengembang = ref({ data: [], totalItems: 0, totalPages: 0, currentPage: 0 })
const metaPengembang = ref({ totalItems: 0, totalPages: 0, currentPage: 0 })

// State Kebutuhan Dynamic Pagination
const totalItemsPengembang = ref(0)
const totalPagesPengembang = ref(0)
const currentPagePengembang = ref(0)
const pageTotalPengembang = ref(0)

// Menghitung range data yang ditampilkan pada halaman saat ini
const pageFromPengembang = computed(() => (currentPagePengembang.value - 1) * pageCountPengembang.value + 1)
const pageToPengembang = computed(() => Math.min(currentPagePengembang.value * pageCountPengembang.value, totalItemsPengembang.value))

// const fetchDataPengembang = async (isAllData = false) => {
//   const result = await PengembangApi.getAllData({
//     start: pagePengembang.value,
//     offset: pageCountPengembang.value,
//     order: sortPengembang.value.direction.toUpperCase(),
//     orderBy: 'id',
//     search: searchPengembang.value,
//     filter: {},
//   }, token)

//   responsePengembang.value = result

//   return result
// }

const handleInputPengembang = () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    searchCompletedPengembang.value = searchPengembang.value
  }, 500)
}

watch(responsePengembang, (newValue) => {
  if (newValue) {
    totalItemsPengembang.value = newValue.totalItems
    totalPagesPengembang.value = newValue.totalPages
    currentPagePengembang.value = newValue.currentPage
    pageTotalPengembang.value = totalItemsPengembang.value
  }
})

// const { pendingPengembang } = await useLazyAsyncData('pengembang', async () => {
//   await fetchDataPengembang()
// }, {
//   default: () => ({ data: [], totalItems: 0, totalPages: 0, currentPage: 0 }),
//   watch: [pagePengembang, searchCompletedPengembang, pageCountPengembang, sortPengembang],
// })

const selectPengembang = (data: any) => {
  isModalActive.value = true
  dataPengembang.id = parseInt(data.id)
  dataPengembang.nip = data.nip
  dataPengembang.namaPengembang = data.namaLengkap
  dataPengembang.viewPengembang = `${data.nip} | ${data.namaLengkap}`
  // dataForm.idPengembang = (data.id)
  isModalOpenPengembang.value = false
}
</script>

<template>
  <SectionMain>
    <!-- Modal Delete -->
    <CardBox class="mb-6 !bg-transparent" has-table>
      <UCard
        class="w-full" :ui="{
          base: '',
          ring: '',
          divide: 'divide-y divide-gray-200 dark:divide-gray-700',
          header: { padding: 'px-4 py-5' },
          body: { padding: '', base: 'divide-y divide-gray-200 dark:divide-gray-700' },
          footer: { padding: 'p-4' },
        }"
      >
        <!-- Filters -->
        <div class="flex items-center justify-between gap-3 px-4 py-3">
          <UButton
            v-if="otorisasi.allow_new"
            class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4" icon="i-mdi-plus"
            @click="resetDataForm(); isModalActive = true; typeForm = 'add'"
          >
            {{ t('utils.table.add') }}
          </UButton>
          <UInput
            v-model="search"
            icon="i-heroicons-magnifying-glass-20-solid"
            :placeholder="`${t('utils.table.search')}...`"
            :ui="{ icon: { trailing: { pointer: '' } } }"
            @input="handleInput"
          >
            <template #trailing>
              <UButton
                v-show="search !== ''"
                color="gray"
                variant="link"
                icon="i-heroicons-x-mark-20-solid"
                :padded="false"
                @click="searchCompleted = ''; search = '';"
              />
            </template>
          </UInput>
        </div>

        <!-- Table -->
        <UTable
          v-model:sort="sort"
          :rows="todos"
          :columns="columns"
          :loading="pending"
          sort-asc-icon="i-heroicons-arrow-up"
          sort-desc-icon="i-heroicons-arrow-down"
          sort-mode="manual"
          class="w-full"
          :ui="{ td: { base: 'whitespace-normal !break-all dark:text-white max-w-[0]' }, selectable: { size: 'sm' } }"
        >
          <template #completed-data="{ row }">
            <UBadge
              size="xs" :label="row.completed ? 'Completed' : 'In Progress'"
              :color="row.completed ? 'emerald' : 'orange'" variant="subtle"
            />
          </template>

          <template #aksi-data="{ row }">
            <div class="flex justify-center items-center gap-x-1.5">
              <UButton v-if="otorisasi.allow_edit" class="!bg-ut-actionBlue px-1.5 py-1.5" :title="t('utils.table.edit')" @click="isModalActive = true; updateDataForm(row)">
                <UnoIcon class="i-mdi-pencil cursor-pointer text-sm !text-white" />
              </UButton>
              <UButton v-if="otorisasi.allow_delete" class="!bg-ut-actionRed px-1.5 py-1.5" :title="t('utils.table.delete')" @click="isDeleted = true;updateDataForm(row)">
                <UnoIcon class="i-mdi-delete cursor-pointer text-sm !text-white" />
              </UButton>
              <UButton color="green" variant="outline" class="px-1.5 py-1.5" title="Tambah / Edit Role" @click="setRoleUser(row)">
                <UnoIcon class="i-mdi-badge-account cursor-pointer text-sm !text-white" />
              </UButton>
            </div>
          </template>
          <template #email-data="{ row }">
            <p>{{ row.email }}</p>
          </template>
          <template #fullName-data="{ row }">
            <p>{{ row.name }}</p>
          </template>
          <template #role-data="{ row }">
            <!-- <UButton  :ui="{ rounded: 'rounded-full' }" color="blue" variant="ghost" label="+ tambah role" @click="setRoleUser(row)" /> -->
            <li v-for="roles in row.userRoles" v-if="row.userRoles.length != 0" :key="roles.id">
              {{ roles.role.name }}
            </li>
            <p v-else>
              -
            </p>
          </template>
          <template #aktif-data="{ row }">
            <UButton v-if="row.status === 1" :ui="{ rounded: 'rounded-full' }" color="white" variant="ghost" label="✅" @click="typeForm = 'edit' ;updateDataForm(row) ;isActive = true;stateActive = 0" />
            <UButton v-else :ui="{ rounded: 'rounded-full' }" label="❌" color="white" variant="ghost" @click="typeForm = 'edit' ;updateDataForm(row) ;isActive = true;stateActive = 1" />
          </template>
        </UTable>

        <!-- Number of rows & Pagination -->
        <template #footer>
          <div class="flex flex-wrap justify-between text-xs">
            <div class="flex items-center">
              <div class="flex items-center gap-1.5">
                <span class="leading-5">{{ t('utils.table.rows_per_page') }}:</span>
                <USelect
                  v-model="pageCount" :options="[10, 25, 50, 100]" class="me-2 w-20" size="xs"
                  @change="page = 1"
                />
              </div>

              <span class="leading-5">
                {{ t('utils.table.showing') }}
                <span>{{ pageFrom }}</span>
                -
                <span>{{ pageTo }}</span>
                {{ t('utils.table.of') }}
                <span>{{ pageTotal }}</span>
                data
              </span>
            </div>

            <UPagination
              v-model="page"
              :page-count="pageCount"
              :total="pageTotal"
              :ui="{
                wrapper: 'flex items-center gap-1',
                rounded: '!rounded-full min-w-[32px] justify-center',
                default: {
                  activeButton: {
                    variant: 'outline',
                  },
                },
              }"
            />
          </div>
        </template>
      </UCard>
    </CardBox>

    <UModal
      v-model="isModalActive" :ui="{
        width: 'w-full sm:max-w-lg',
      }" prevent-close
    >
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              Form Daftar Pengguna
            </h3>
            <UButton
              color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="isModalActive = false"
            />
          </div>
        </template>

        <UForm :schema="typeForm === 'add' ? createSchema : editSchema" :state="dataForm" class="space-y-4" @submit="onSubmit">
          <UFormGroup required eager-validation :label="t('forms.utilities.users.username')" name="username">
            <UInput v-model="dataForm.username" :disabled="typeForm == 'edit'" placeholder="ex. wasil" />
          </UFormGroup>

          <UFormGroup required label="Email" name="email">
            <UInput v-model="dataForm.email" :disabled="typeForm == 'edit'" placeholder="ex. you@example.com" type="email" />
            <p class="text-xs text-gray-500 mt-1">
              isi email ecampus jika user tersebut login menggunakan SSO. cth: wasil@ecampus.ut.ac.id
            </p>
          </UFormGroup>

          <UFormGroup :label="t('forms.utilities.users.fullname')" name="fullName">
            <UInput v-model="dataForm.fullName" :disabled="typeForm == 'edit'" placeholder="ex. Wasil Mawardi" />
          </UFormGroup>

          <UFormGroup label="Pengembang" name="idPengembang">
            <div>
                <UInput
                v-model="dataPengembang.viewPengembang" :disabled="dataForm.idPengembang != 0 && dataForm.idPengembang != null" placholder="Pilih Pengembang" aria-readonly="true"
                readonly
                @click="openModal"
              />
            </div>
          </UFormGroup>
          
          <UDivider label="" />

          <!-- <UFormGroup v-if="typeForm === 'edit'" required label="Current Password" name="currentPassword">
            <UInput v-model="dataForm.currentPassword" placeholder="*****" type="password" />
          </UFormGroup> -->

          <UFormGroup :required="typeForm != 'edit'" label="Password" name="password">
            <UInput v-model="dataForm.password" placeholder="*****" type="password" />
          </UFormGroup>

          <UFormGroup :required="typeForm != 'edit'" :label="t('forms.utilities.users.confirm_password')" name="confirmPassword">
            <UInput v-model="dataForm.confirmPassword" placeholder="*****" type="password" />
          </UFormGroup>

          <UFormGroup hidden label="Password" name="password">
            <UInput v-model="dataForm.id" />
          </UFormGroup>
          <div class="text-right">
            <UButton type="submit" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4">
              <UnoIcon class="i-mdi-content-save" /> {{ t('utils.action.save') }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
    <UModal v-model="isDeleted" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ t('utils.modal.confirmation') }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isDeleted = false" />
          </div>
        </template>

        <h2 class="text-sm">
          {{ t('utils.modal.delete.body_text') }} <b>{{ dataForm.username }}</b>?
        </h2>

        <div class="text-right !mt-8">
          <UButton color="red" variant="solid" type="button" @click="isDeleted = false; deleteForm(dataForm.id ?? 0)">
            <UnoIcon class="i-mdi-trash" /> {{ t('utils.modal.delete.button_text') }}
          </UButton>
        </div>
      </UCard>
    </UModal>
    <UModal v-model="isDeletedRole" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ t('utils.modal.confirmation') }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isDeletedRole = false" />
          </div>
        </template>

        <h2 class="text-sm">
          {{ t('utils.modal.delete.body_text') }} <b>{{ dataFormRole.name }}</b>?
        </h2>

        <div class="text-right !mt-8">
          <UButton color="red" variant="solid" type="button" @click="isDeletedRole = false; deleteFormRole(dataFormRole.id ?? 0)">
            <UnoIcon class="i-mdi-trash" /> {{ t('utils.modal.delete.button_text') }}
          </UButton>
        </div>
      </UCard>
    </UModal>
    <UModal v-model="isActive" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Konfirmasi
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isActive = false" />
          </div>
        </template>
        <h2 v-if="stateActive === 1" class="text-sm">
          Aktifkan  User <b> {{ dataForm.username }} </b>
        </h2>
        <h2 v-else class="text-sm">
          Nonaktifkan User <b> {{ dataForm.username }} </b>
        </h2>

        <div class="text-right !mt-8">
          <UButton v-if="stateActive === 1" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue" type="button" @click="isActive = false; onSubmit({ data: dataForm })">
            Aktifkan
          </UButton>
          <UButton v-else color="red" variant="solid" type="button" @click="isActive = false; onSubmit({ data: dataForm })">
            Nonaktifkan
          </UButton>
        </div>
      </UCard>
    </UModal>
    <UModal
      v-model="isModalRole" :ui="{
        width: 'w-full sm:max-w-2xl',
      }" prevent-close
    >
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              Form Role Pengguna
            </h3>
            <UButton
              color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="isModalRole = false;fetchData()"
            />
          </div>
        </template>

        <UForm :state="dataFormRole" class="space-y-4" @submit="onSubmitRole">
          <UFormGroup required label="Role" name="role">
            <USelectMenu
              v-model="dataFormRole.idRole" searchable :required="true" value-attribute="id" :options="roles" :placeholder="t('forms.utilities.users.select_roles')" option-attribute="name"
              @change="conditionRole($event)"
            />
          </UFormGroup>

          <UFormGroup v-if="isFakultas" required label="Fakultas" name="fakultas">
            <USelectMenu
              v-model="dataFormRole.idFakultas" searchable :required="true" value-attribute="id" :options="dataFakultas" placeholder="Pilih Fakultas"
              option-attribute="namaFakultas"
            />
          </UFormGroup>

          <UFormGroup v-if="isProdi" required label="Program Studi" name="prodi">
            <USelectMenu
              v-model="dataFormRole.idProdi" searchable :required="true" value-attribute="id" :options="dataProdi" placeholder="Pilih Program Studi"
              option-attribute="namaProgramStudi"
            />
          </UFormGroup>

          <UFormGroup hidden label="Password" name="password">
            <UInput v-model="dataFormRole.id" />
          </UFormGroup>
          <div class="text-right">
            <UButton type="submit" class="mb-6 bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4">
              <UnoIcon class="i-mdi-content-save" /> {{ t('utils.action.save') }}
            </UButton>
          </div>
        </UForm>

        <UTable
          v-model:sort="sort"
          :rows="dataRole"
          :columns="[
            {
              key: 'aksi',
              label: 'Aksi',
              sortable: false,
              class: 'text-center !w-[75px] whitespace-normal',
            },
            {
              key: 'name',
              label: 'Role',
              sortable: false,
              class: 'whitespace-normal',
            },
            {
              key: 'subrole',
              label: 'Fakultas / Prodi / UPBJJ',
              sortable: false,
              class: 'whitespace-normal',
            },
          ]"
          :loading="pending"
          sort-asc-icon="i-heroicons-arrow-up"
          sort-desc-icon="i-heroicons-arrow-down"
          sort-mode="manual"
          class="w-full"
          :ui="{ td: { base: 'whitespace-normal !break-all dark:text-white max-w-[0]' }, selectable: { size: 'sm' } }"
        >
          <template #aksi-data="{ row }">
            <div class="flex justify-center items-center gap-x-1.5">
              <UButton v-if="otorisasi.allow_delete" class="!bg-ut-actionRed px-1.5 py-1.5" :title="t('utils.table.delete')" @click="isDeletedRole = true;updateDataFormRole(row)">
                <UnoIcon class="i-mdi-delete cursor-pointer text-sm !text-white" />
              </UButton>
            </div>
          </template>
          <template #name-data="{ row }">
            {{ row.role.name }}
          </template>
          <template #subrole-data="{ row }">
            <!-- {{ row }} -->
            <p v-if="row?.upbjj && row.role.kode == 'RL09'">
              {{ row?.upbjj.namaUpbjj}}
            </p>
            <p v-if="row?.programStudi && row.role.kode == 'RL05' ">
              {{ row?.programStudi.namaProgramStudi }}
            </p>
            <p v-if="row?.fakultas && (row.role.kode == 'RL03' || row.role.kode == 'RL04') ">
              {{ row?.fakultas.namaFakultas }}
            </p>
          </template>
        </UTable>
      </UCard>
    </UModal>


  <!-- modal pengembang  -->
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <UModal
      v-model="isModalOpenPengembang"
      :style="{ width: '80%' }"
      :ui="{
        width: 'w-full sm:max-w-4xl',
      }" prevent-close
    >
      <UCard
        :ui="{
          base: 'h-full flex flex-col',
          rounded: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          body: {
            base: 'grow',
          },
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Pilih Pengembang
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isModalOpenPengembang = false; isModalForm = true" />
          </div>
        </template>
        <div>
          <div class="grid grid-cols-2 gap-4 mb-2 mt-1 me-1">
            <div>
              <UInput
                v-model="searchPengembang"
                icon="i-heroicons-magnifying-glass-20-solid"
                :placeholder="`${t('utils.table.search')}...`"
                @input="handleInputPengembang"
              >
                <template #trailing>
                  <UButton
                    v-show="searchPengembang !== ''"
                    color="gray"
                    variant="link"
                    icon="i-heroicons-x-mark-20-solid"
                    :padded="false"
                    @click="searchCompletedPengembang = ''; searchPengembang = '';"
                  />
                </template>
              </UInput>
            </div>
          </div>

          <UTable
            :rows="responsePengembang.data"
            :columns="columnsPengembang"
            :loading="pendingPengembang"
            class="w-full h-3/4 overflow-auto mb-4 border border-gray-200 rounded-lg"
            @select="selectPengembang"
          />
          <!-- Number of rows & Pagination -->
          <div class="flex flex-wrap justify-between text-xs">
            <div class="flex items-center">
              <div class="flex items-center gap-1.5">
                <span class="leading-5">Baris per halaman:</span>
                <USelect
                  v-model="pageCountPengembang" :options="[10, 25, 50, 100]" class="me-2 w-20" size="xs"
                  @change="pagePengembang = 1"
                />
              </div>

              <span class="leading-5">
                Menampilkan
                <span>{{ pageFromPengembang }}</span>
                -
                <span>{{ pageToPengembang }}</span>
                dari
                <span>{{ pageTotalPengembang }}</span>
                data
              </span>
            </div>

            <UPagination
              v-model="pagePengembang"
              :page-count="pageCountPengembang"
              :total="pageTotalPengembang"
              :ui="{
                wrapper: 'flex items-center gap-1',
                rounded: '!rounded-full min-w-[32px] justify-center',
                default: {
                  activeButton: {
                    variant: 'outline',
                  },
                },
              }"
            />
          </div>
        </div>
      </UCard>
    </UModal>
  </transition>

  </SectionMain>
</template>
