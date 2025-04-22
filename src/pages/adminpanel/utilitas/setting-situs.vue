<script setup lang="ts">
// Import Kebutuhan
import { mdiWrenchCogOutline } from '@mdi/js'
import { z } from 'zod'
import Swal from 'sweetalert2'
import { SitusApi } from '~/apis'
definePageMeta({
  middleware: 'otorisasi',
  layoutTransition: true,
})

const { session, remove, refresh, update, reset, overwrite } = await useSession()
const otorisasi = ref({ allow_approve: false, allow_delete: false, allow_download: false, allow_edit: false, allow_new: false, allow_view: false })

// List Kolom Untuk Table
const columns = [
  {
    key: 'aksi',
    label: 'Aksi',
    sortable: false,
    class: '!w-[10px] whitespace-normal',
  },
  {
    key: 'key',
    label: 'Key',
    sortable: true,
    class: '!w-[40px] whitespace-normal',
  },
  {
    key: 'value',
    label: 'Value',
    sortable: true,
    class: '!w-[62px] whitespace-normal',
  },
  {
    key: 'desc',
    label: 'Desc',
    sortable: true,
    class: '!w-[62px] whitespace-normal',
  },
]

// Select table
const selectedColumns = ref(columns)
const columnsTable = computed(() => columns.filter(column => selectedColumns.value.includes(column)))

// Selected Row
const selectedRows = ref([])

function select(row) {
  const index = selectedRows.value.findIndex(item => item.id === row.id)
  if (index === -1)
    selectedRows.value.push(row)
  else
    selectedRows.value.splice(index, 1)
}

// Action
const action = [[{
  key: 'completed',
  label: 'Completed',
}]]

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

// Get Data Api
const getAllData = async () => {
  try {
    const param = {
      start: page.value,
      offset: pageCount.value,
      orderBy: 'id',
      order: 'ASC',
      keyword: search.value,
    }
    const dataFetch = await SitusApi.getAllData(param)
    return dataFetch
  }
  catch (error) {
    console.error('Gagal mengambil data:', error)

    // Ambil pesan kesalahan dari objek error
    const errorMessage = error.response?.data?.messaga || 'Terjadi kesalahan ketika mengirim permintaan'

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
const sort = ref({ column: 'id', direction: 'asc' })
const page = ref(1)
const pageCount = ref(10)

// State response, data table, meta

const response = ref({ data: [], meta: { totalItems: 0, totalPages: 0, currentPage: 0 } })
const todos = ref({})
const meta = ref({ totalItems: 0, totalPages: 0, currentPage: 0 })

// State kebutuhan dinamis pagination
const totalItems = ref(0)
const totalPages = ref(0)
const currentPage = ref(0)
const pageTotal = ref(0)

// Function mengambil data dari api
async function fetchData() {
  try {
    const newData = await getAllData()
    response.value = newData
  }
  catch (error) {
    console.error('Gagal mengambil data:', error)
  }
}

// Menggunakan useLAzyAsyncData untuk memmuat data
const { pending } = await useLazyAsyncData('response', async () => {
  await fetchData()
}, {
  default: () => ({ data: [], meta: { totalItems: 0, totalPages: 0, currentPage: 0 } }),
  watch: [page, search, searchStatus, pageCount, sort],
})

// Wathcer untuk merespon perubahan pada response.value
watch(response, (newValue, oldValue) => {
  if (newValue) {
    // Menyimpan data dan metadata pagination yang baru
    todos.value = newValue.data || []
    meta.value = newValue.meta || { totalItems: 0, totalPage: 0, currentPage: 0 }

    // Memperbarui nilai totalItems, totalPage, dan currentPage
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
const isActive = ref(false)
const stateActive = ref(null)

const typeForm = ref()
const data = ref()
const dataForm = reactive({
  key: null,
  value: null,
  desc: null,
})

// Validation pakai zod
const schema = z.object({
  key: z.string(
    {
      required_error: 'Wajib Diisi!',
      invalid_type_error: 'Wajib Diisi!',
    },
  ).min(5, 'Minimal 5 karakter').transform(value => value.trim()),
  value: z.string(
    {
      required_error: 'Wajib Diisi!',
      invalid_type_error: 'Wajib Diisi!',
    },
  ).min(5, 'Minimal 5 karakter').transform(value => value.trim()),
})

// Function untuk submit
const onSubmit = async (event) => {
  const param = {
    key: event.data.key,
    value: event.data.value,
    desc: event.data.desc,
  }

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

// Function untuk insert data
const insertDataForm = async (id = null, param) => {
  try {
    // Validasi untuk type proses insert atau update
    if (!typeForm.value) {
      console.error('Tipe form tidak terdefinisikan')
      return false
    }

    // Tentukan endpoint API berdasarkan tipe form
    const apiEndpoint = typeForm.value === 'add' ? SitusApi.addData : SitusApi.editData

    // Panggil API dan dapatkan hasilnya
    const dataFetch = await apiEndpoint(id, param)

    // Penampilan pesan sukses dengan swal
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data berhasil',
    })
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

// Reset inputan insert
const resetDataForm = () => {
  dataForm.id = null
  dataForm.key = null
  dataForm.value = null
  dataForm.desc = null
}

// Reset inputan insert
const updateDataForm = (data) => {
  dataForm.id = data.id
  dataForm.key = data.key
  dataForm.value = data.value
  dataForm.desc = data.desc

  typeForm.value = 'edit'
}
onMounted(async () => {
  otorisasi.value = session.value.otorisasi
})
</script>

<template>
  <NuxtLayout name="module">
    <SectionMain>
      <CardBox class="mb-6" has-table>
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
          <!-- <template #header>
                <h2 class="font-semibold text-xl text-gray-900 dark:text-white leading-tight">
                  Todos
                </h2>
              </template> -->

          <!-- Filters -->
          <div class="flex items-center justify-between gap-3.5 px-4 py-3">
            <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..." />

            <USelectMenu
              v-model="selectedStatus" :options="todoStatus" multiple placeholder="Status"
              class="w-40"
            />
          </div>

          <!-- Header and Action buttons -->
          <div class="flex justify-between items-center w-full px-4 py-3">
            <div class="flex items-center gap-1.5">
              <span class="text-sm leading-5">Rows per page:</span>

              <USelect
                v-model="pageCount" :options="[10, 25, 50, 100]" class="me-2 w-20"
                size="xs" @change="page = 1"
              />
            </div>

            <div class="flex gap-1.5 items-center">
              <UDropdown v-if="selectedRows.length > 1" :items="actions" :ui="{ width: 'w-24' }">
                <UButton icon="i-heroicons-chevron-down" trailing color="gray" size="xs">
                  Mark as
                </UButton>
              </UDropdown>

              <USelectMenu v-model="selectedColumns" :options="columns" multiple>
                <UButton icon="i-heroicons-view-columns" color="gray" size="xs">
                  Columns
                </UButton>
              </USelectMenu>

              <UButton
                icon="i-heroicons-funnel" color="gray" size="xs"
                :disabled="search === '' && selectedStatus.length === 0" @click="resetFilters"
              >
                Reset
              </UButton>
            </div>
          </div>

          <!-- Table -->
          <UTable
            v-model:sort="sort" :rows="todos" :columns="columnsTable"
            :loading="pending" sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down"
            sort-mode="manual" class="w-full"
            :ui="{ td: { base: '!whitespace-normal !break-all dark:text-white max-w-[0]' } }"
          >
            <template #completed-data="{ row }">
              <UBadge
                size="xs" :label="row.completed ? 'Completed' : 'In Progress'"
                :color="row.completed ? 'emerald' : 'orange'" variant="subtle"
              />
            </template>

            <template #aksi-data="{ row }">
              <UButton
                icon="i-heroicons-pencil-solid text-white"
                size="sm" color="emerald" variant="solid" class="mr-2"
                @click="isModalActive = true; updateDataForm(row)"
              />
            </template>
            <template #email-data="{ row }" class="before:hidden lg:w-1 whitespace-wrap">
              <p>{{ row.email }}</p>
            </template>
            <template #role-data="{ row }" class="before:hidden lg:w-1 whitespace-normal">
              <p>Superadmin</p>
            </template>
            <template #login-data="{ row }" class="before:hidden lg:w-1 whitespace-normal">
              <p>29 Jan 2024 14:47:16</p>
            </template>
            <template #publish-data="{ row }" class="before:hidden lg:w-1 whitespace-normal">
              <UButton v-if="row.publish == 1" :ui="{ rounded: 'rounded-full' }" color="white" variant="ghost" label="✅" @click="typeForm = 'edit' ;updateDataForm(row) ;isActive = true;stateActive = 0" />
              <UButton v-else :ui="{ rounded: 'rounded-full' }" label="❌" color="white" variant="ghost" @click="typeForm = 'edit' ;updateDataForm(row) ;isActive = true;stateActive = 1" />
            </template>
          </UTable>

          <!-- Number of rows & Pagination -->
          <template #footer>
            <div class="flex flex-wrap justify-between items-center">
              <div>
                <span class="text-sm leading-5">
                  Showing
                  <span class="font-medium">{{ pageFrom }}</span>
                  to
                  <span class="font-medium">{{ pageTo }}</span>
                  of
                  <span class="font-medium">{{ pageTotal }}</span>
                  results
                </span>
              </div>

              <UPagination
                v-model="page" :page-count="pageCount" :total="pageTotal" :ui="{
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
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Edit Setting Situs
              </h3>
              <UButton
                color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                @click="isModalActive = false"
              />
            </div>
          </template>

          <UForm :schema="schema" :state="dataForm" class="space-y-4" @submit="onSubmit">
            <UFormGroup eager-validation required label="Key" name="key">
              <UInput v-model="dataForm.key" placeholder="ex Key" icon="i-heroicons-document" readonly="true" />
            </UFormGroup>

            <UFormGroup eager-validation required label="Value" name="value">
              <UInput v-model="dataForm.value" placeholder="ex Value" icon="i-heroicons-document" />
            </UFormGroup>

            <UFormGroup eager-validation required label="Desc" name="desc">
              <UInput v-model="dataForm.desc" placeholder="ex Desc" icon="i-heroicons-document" />
            </UFormGroup>

            <UButton type="submit">
              Submit
            </UButton>
          </UForm>

          <template #footer />
        </UCard>
      </UModal>
    </SectionMain>
  </NuxtLayout>
</template>
