<script setup lang="ts">
import { z } from 'zod'
import Swal from 'sweetalert2'
import { RoleApi } from '~/apis'

// Set title page
const layoutStore = useLayoutStore()
const pageTitle = 'Group / Role'
layoutStore.setTitleBreadcrumb(pageTitle, `Utilitas > ${pageTitle}`)
useHead({
  title: pageTitle,
})

definePageMeta({
  middleware: 'otorisasi',
  layout: 'module',
})

const { t } = useLang()

const { session, remove, refresh, update, reset, overwrite } = await useSession()
const { token } = session.value
const otorisasi = ref({ allow_approve: false, allow_delete: false, allow_download: false, allow_edit: false, allow_new: false, allow_view: false })

// List Kolom Untuk Table
const columns = [
  {
    key: 'aksi',
    label: 'Aksi',
    sortable: false,
    class: '!w-[110px] whitespace-normal',
  },
  {
    key: 'kode',
    label: 'Kode Role',
    sortable: true,
    class: 'whitespace-normal',
  },
  {
    key: 'kodeSrs',
    label: 'Kode SRS',
    sortable: true,
    class: 'whitespace-normal',
  },
  {
    key: 'name',
    label: 'Nama Role',
    sortable: true,
    class: 'whitespace-normal',
  },
  {
    key: 'description',
    label: 'Deskripsi',
    sortable: true,
    class: '!w-[400px] whitespace-normal',
  },
  {
    key: 'aktif',
    label: 'Aktif',
    sortable: false,
    class: '!w-[105px] whitespace-normal',
  },
]

// Selectable
const selectedColumns = ref(columns)
const columnsTable = computed(() => columns.filter(column => selectedColumns.value.includes(column)))
// Selected Rows
const selectedRows = ref([])

function select(row) {
  const index = selectedRows.value.findIndex(item => item.id === row.id)
  if (index === -1)
    selectedRows.value.push(row)
  else
    selectedRows.value.splice(index, 1)
}

// Actions
const actions = [
  [{
    key: 'completed',
    label: 'Completed',
    icon: 'i-heroicons-check',
  }], [{
    key: 'uncompleted',
    label: 'In Progress',
    icon: 'i-heroicons-arrow-path',
  }],
]

// Filters
const todoStatus = [{
  key: 'uncompleted',
  label: 'In Progress',
  value: false,
}, {
  key: 'completed',
  label: 'Completed',
  value: true,
}]

const search = ref('')
const searchCompleted = ref('')
const selectedStatus = ref([])
const searchStatus = computed(() => {
  if (selectedStatus.value?.length === 0)
    return ''

  if (selectedStatus?.value?.length > 1)
    return `?completed=${selectedStatus.value[0].value}&completed=${selectedStatus.value[1].value}`

  return `?completed=${selectedStatus.value[0].value}`
})
const resetFilters = () => {
  search.value = ''
  selectedStatus.value = []
}

let timeoutId: any = null
const handleInput = () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    searchCompleted.value = search.value
  }, 500)
}

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
    const dataFetch = await RoleApi.getAllData(param, token)
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

// State untuk mengatur sorting dan pagination
const sort = ref({ column: 'id', direction: 'desc' })
const page = ref(1)
const pageCount = ref(10)

// State Reponse , data table , Meta
const response = ref({ data: [], meta: { totalItems: 0, totalPages: 0, currentPage: 0 } })
const todos = ref([])
const meta = ref({ totalItems: 0, totalPages: 0, currentPage: 0 })

// State Kebutuhan Dynamic Pagination
const totalItems = ref(0)
const totalPages = ref(0)
const currentPage = ref(0)
const pageTotal = ref(0)

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

// Menggunakan useLazyAsyncData untuk memuat data secara lazy
const { pending } = await useLazyAsyncData('response', async () => {
  await fetchData()
}, {
  default: () => ({ data: [], meta: { totalItems: 0, totalPages: 0, currentPage: 0 } }),
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

// Trigger Modal
const isModalActive = ref(false)
const isModalDangerActive = ref(false)
const isActive = ref(false)
const stateActive = ref(null)
const isDeleted = ref(false)

const typeForm = ref()
const data = ref()
const dataForm = reactive({
  id: null,
  kode: null,
  kodeSrs: null,
  name: null,
  description: null,
  active: null,
})

// Validation Pakai Zod
const schema = z.object({
  // kode: z.string(
  //   {
  //     required_error: 'Wajib diisi',
  //     invalid_type_error: 'Wajib diisi!',
  //   },
  // ).min(2, 'Minimal 2 karakter'),

  // kodeSrs: z.string(
  //   {
  //     required_error: 'Wajib diisi',
  //     invalid_type_error: 'Wajib diisi!',
  //   },
  // ).min(2, 'Minimal 2 karakter'),

  name: z.string(
    {
      required_error: 'Wajib diisi',
      invalid_type_error: 'Wajib diisi!',
    },
  ).min(2, 'Minimal 2 karakter'),

  description: z.string({
    required_error: 'Wajib diisi',
    invalid_type_error: 'Wajib diisi!',
  }).min(1, 'Minimal 1 karakter'),

})

const onSubmit = async (event) => {
  // Do something with data
  const param = {
    // kode: event.data.kode,
    kodeSrs: event.data.kodeSrs ? event.data.kodeSrs : null,
    name: event.data.name,
    description: event.data.description,
    active: (event.data.active == null ? 1 : ((stateActive.value != null) ? stateActive.value : event.data.active)),
  }

  const is_add = await insertDataForm(((typeForm.value === 'edit') ? event.data.id : null), param)

  if (is_add.status == 200) {
    fetchData()

    const reset = await resetDataForm()
    isModalActive.value = false
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data berhasil disimpan!',
    })
  }
  else {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Simpan Data',
      text: is_add.message,
    })
    isModalActive.value = true
  }
}

const insertDataForm = async (id = null, param) => {
  // Pastikan typeForm sudah didefinisikan
  if (!typeForm.value) {
    console.error('Tipe form tidak terdefinisi')
    return false
  }

  // Tentukan endpoint API berdasarkan tipe form
  const apiEndpoint = typeForm.value === 'add' ? RoleApi.addData : RoleApi.editData

  // Panggil API dan dapatkan hasilnya
  const dataFetch = await apiEndpoint(id, param, token)

  return dataFetch
}

const deleteForm = async (id) => {
  const isDeleted = await RoleApi.deleteData(id, token)

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

const resetDataForm = () => {
  dataForm.id = null
  dataForm.kode = null
  dataForm.kodeSrs = null
  dataForm.name = null
  dataForm.description = null
  dataForm.active = null
}
const updateDataForm = (data) => {
  dataForm.id = data.id
  dataForm.kode = data.kode
  dataForm.kodeSrs = data.kodeSrs
  dataForm.name = data.name
  dataForm.description = data.description
  dataForm.active = data.active

  typeForm.value = 'edit'
}
onMounted(async () => {
  otorisasi.value = session.value.otorisasi
})
</script>

<template>
  <SectionMain>
    <CardBox class="mb-6" has-table>
      <UCard
        class="w-full"
        :ui="{
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
          :columns="columnsTable"
          :loading="pending"
          sort-asc-icon="i-heroicons-arrow-up"
          sort-desc-icon="i-heroicons-arrow-down"
          sort-mode="manual"
          class="w-full"
          :ui="{ td: { base: 'whitespace-normal !break-all dark:text-white max-w-[0]' }, selectable: { size: 'sm' } }"
          @select="select"
        >
          <template #completed-data="{ row }">
            <UBadge size="xs" :label="row.completed ? 'Completed' : 'In Progress'" :color="row.completed ? 'emerald' : 'orange'" variant="subtle" />
          </template>

          <template #aksi-data="{ row }">
            <div class="flex justify-center items-center gap-x-1.5">
              <UButton v-if="otorisasi.allow_edit" class="!bg-ut-actionBlue px-1.5 py-1.5" :title="t('utils.table.edit')" @click="isModalActive = true; updateDataForm(row)">
                <UnoIcon class="i-mdi-pencil cursor-pointer text-sm !text-white" />
              </UButton>
              <UButton v-if="otorisasi.allow_delete" class="!bg-ut-actionRed px-1.5 py-1.5" :title="t('utils.table.delete')" @click="isDeleted = true;updateDataForm(row)">
                <UnoIcon class="i-mdi-delete cursor-pointer text-sm !text-white" />
              </UButton>
            </div>
          </template>
          <template #email-data="{ row }">
            <p>{{ row.email }}</p>
          </template>
          <template #role-data="{ row }">
            <p>Superadmin</p>
          </template>
          <template #login-data="{ row }">
            <p>29 Jan 2024 14:47:16</p>
          </template>
          <template #aktif-data="{ row }">
            <UButton v-if="row.active === 1" :ui="{ rounded: 'rounded-full' }" color="white" variant="ghost" label="✅" @click="typeForm = 'edit' ;updateDataForm(row) ;isActive = true;stateActive = 0" />
            <UButton v-else :ui="{ rounded: 'rounded-full' }" label="❌" color="white" variant="ghost" @click="typeForm = 'edit' ;updateDataForm(row) ;isActive = true;stateActive = 1" />
          </template>
        </UTable>

        <!-- Number of rows & Pagination -->
        <template #footer>
          <div class="flex flex-wrap justify-between items-center">
            <div>
              <span class="text-xs leading-5">
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
      v-model="isModalActive"
      :ui="{
        width: 'w-full sm:max-w-lg',
      }"
      prevent-close
    >
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Form Group / Role
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isModalActive = false" />
          </div>
        </template>

        <UForm :schema="schema" :state="dataForm" class="space-y-4" @submit="onSubmit">
          <!-- <UFormGroup eager-validation required label="Kode Role" name="kode">
            <UInput v-model="dataForm.kode" placeholder="ex 01A" />
          </UFormGroup> -->

          <UFormGroup label="Kode Role SRS" name="kode">
            <UInput v-model="dataForm.kodeSrs" placeholder="ex PBB01" />
          </UFormGroup>

          <UFormGroup eager-validation required label="Nama Role" name="name">
            <UInput v-model="dataForm.name" placeholder="ex wasil" />
          </UFormGroup>

          <UFormGroup required label="Deskripsi" name="description">
            <UInput v-model="dataForm.description" placeholder="Deskripsi" />
          </UFormGroup>

          <UFormGroup hidden required label="Deskripsi" name="active">
            <UInput v-model="dataForm.active" />
          </UFormGroup>

          <div class="text-right !mt-8">
            <UButton type="submit" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4">
              <UnoIcon class="i-mdi-content-save" /> {{ t('utils.action.save') }}
            </UButton>
          </div>
        </UForm>
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
          Aktifkan  User <b> {{ dataForm.name }} </b>
        </h2>
        <h2 v-else class="text-sm">
          Nonaktifkan User <b> {{ dataForm.name }} </b>
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
          {{ t('utils.modal.delete.body_text') }} <b> {{ dataForm.name }} </b>
        </h2>

        <div class="text-right !mt-8">
          <UButton color="red" variant="solid" type="button" @click="isDeleted = false; deleteForm(dataForm.id ?? 0)">
            <UnoIcon class="i-mdi-trash" /> {{ t('utils.modal.delete.button_text') }}
          </UButton>
        </div>
      </UCard>
    </UModal>
  </SectionMain>
</template>
