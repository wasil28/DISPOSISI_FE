<script setup lang="ts">
import Swal from 'sweetalert2'
import { OtorisasiApi, RoleApi } from '~/apis'

// Set title page
const layoutStore = useLayoutStore()
const pageTitle = 'Atur Otorisasi'
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
    key: 'name',
    label: 'Nama Module',
    sortable: false,
    class: 'whitespace-normal',
  },
  {
    key: 'is_view',
    label: 'View',
    sortable: false,
    class: '!w-[105px] whitespace-normal',
  },
  {
    key: 'is_new',
    label: 'New',
    sortable: false,
    class: '!w-[105px] whitespace-normal',
  },
  {
    key: 'is_edit',
    label: 'Edit',
    sortable: false,
    class: '!w-[105px] whitespace-normal',
  },
  {
    key: 'is_delete',
    label: 'Delete',
    sortable: false,
    class: '!w-[105px] whitespace-normal',
  },
  {
    key: 'is_print',
    label: 'Print',
    sortable: false,
    class: '!w-[105px] whitespace-normal',
  },
  {
    key: 'is_approve',
    label: 'Approve',
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
const todoStatus = ref([])

const search = ref('')
const searchCompleted = ref('')
const selectedStatus = ref(1)
// const searchStatus = computed(() => {
//   if (selectedStatus.value?.length === 0)
//     return ''

//   if (selectedStatus?.value?.length > 1)
//     return `?completed=${selectedStatus.value[0].value}&completed=${selectedStatus.value[1].value}`

//   return `?completed=${selectedStatus.value[0].value}`
// })
const resetFilters = () => {
  search.value = ''
  selectedStatus.value = 1
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
  const param = {
    start: page.value,
    offset: pageCount.value,
    orderBy: 'seq',
    order: 'ASC',
    keyword: search.value,
  }
  let roleId
  roleId = selectedStatus.value

  const dataFetch = await OtorisasiApi.getAllData(param, roleId, token)
  return dataFetch
}

// State untuk mengatur sorting dan pagination
const sort = ref({ column: 'id', direction: 'asc' })
const page = ref(1)
const pageCount = ref(1000)

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
    console.log(newValue.data)
    const tempArr: any[] = []

    newValue.data.forEach((data: any) => {
      if (data.pid === 0) {
        if (!tempArr.find(arr => arr.moduleid === data.moduleid)) {
          tempArr.push(data)

          const childMenus = newValue.data.filter((el: any) => el.pid === data.moduleid)
          childMenus.forEach((child: any) => {
            tempArr.push(child)
          })
        }
      }
      else if (!newValue.data.find(arr => arr.moduleid === data.pid) && !tempArr.find(arr => arr.moduleid === data.moduleid)) {
        tempArr.push(data)
      }
    })

    todos.value = tempArr || []
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

const typeForm = ref()
const onSubmit = async (event) => {
  // Do something with data
  const param = event.data.map((item) => {
    const { modules, ...rest } = item
    return rest
  })

  let roleId
  roleId = selectedStatus.value

  const is_add = await insertDataForm(roleId, param)

  if (is_add.status === 200) {
    // const reset = await resetDataForm()
    isModalActive.value = false
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data berhasil disimpan!',
      button: 'OK',
    }).then((value) => {
      fetchData()
    })
  }
  else {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Simpan Data',
      text: is_add.message,
    })
    isModalActive.value = false
  }
}

const insertDataForm = async (id = null, param) => {
  // Pastikan typeForm sudah didefinisikan
  if (!typeForm.value) {
    console.error('Tipe form tidak terdefinisi')
    return false
  }

  // Tentukan endpoint API berdasarkan tipe form
  const apiEndpoint = typeForm.value === 'add' ? OtorisasiApi.addData : OtorisasiApi.editData

  // Panggil API dan dapatkan hasilnya
  const dataFetch = await apiEndpoint(id, param, token)

  return dataFetch
}

onBeforeMount(async () => {
  const param = {
    start: 1,
    offset: 999999,
    orderBy: 'id',
    order: 'ASC',
    keyword: '',
  }
  const dataRole = await RoleApi.getAllData(param, token)
  todoStatus.value = transformData(dataRole)
})
onMounted(async () => {
  otorisasi.value = session.value.otorisasi
})

const transformData = (inputData: any) => {
  return inputData.data.map(item => ({
    key: item.name,
    label: item.description,
    value: item.id,
  }))
}
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
            class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4" icon="i-mdi-content-save"
            @click="isModalActive = true;typeForm = 'edit'"
          >
            {{ t('utils.action.save') }}
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

        <div class="flex items-center justify-between gap-3.5 px-4 py-3">
          <USelectMenu v-model="selectedStatus" :options="todoStatus" value-attribute="value" option-attribute="key" placeholder="Role" class="w-40" @change="fetchData" />
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
          :ui="{ td: { base: '!break-all dark:text-white max-w-[0]' }, selectable: { size: 'sm' } }"
        >
          <template #completed-data="{ row }">
            <UBadge size="xs" :label="row.completed ? 'Completed' : 'In Progress'" :color="row.completed ? 'emerald' : 'orange'" variant="subtle" />
          </template>
          <template #name-data="{ row }">
            <span :class="row.pid > 0 ? 'pl-6' : ''">{{ row.pid > 0 ? '|_ ' : '' }}{{ row.name }}</span>
          </template>
          <template #is_view-data="{ row }">
            <UButton v-if="row.allowview === 1" :ui="{ rounded: 'rounded-full' }" color="white" variant="ghost" label="✅" @click="typeForm = 'edit' ;row.allowview = 0" />
            <UButton v-else :ui="{ rounded: 'rounded-full' }" label="❌" color="white" variant="ghost" @click="typeForm = 'edit' ;row.allowview = 1" />
          </template>
          <template #is_new-data="{ row }">
            <UButton v-if="row.allownew === 1" :ui="{ rounded: 'rounded-full' }" color="white" variant="ghost" label="✅" @click="typeForm = 'edit' ;row.allownew = 0" />
            <UButton v-else :ui="{ rounded: 'rounded-full' }" label="❌" color="white" variant="ghost" @click="typeForm = 'edit' ;row.allownew = 1" />
          </template>
          <template #is_edit-data="{ row }">
            <UButton v-if="row.allowedit === 1" :ui="{ rounded: 'rounded-full' }" color="white" variant="ghost" label="✅" @click="typeForm = 'edit' ;row.allowedit = 0" />
            <UButton v-else :ui="{ rounded: 'rounded-full' }" label="❌" color="white" variant="ghost" @click="typeForm = 'edit' ;row.allowedit = 1" />
          </template>
          <template #is_delete-data="{ row }">
            <UButton v-if="row.allowdelete === 1" :ui="{ rounded: 'rounded-full' }" color="white" variant="ghost" label="✅" @click="typeForm = 'edit' ;row.allowdelete = 0" />
            <UButton v-else :ui="{ rounded: 'rounded-full' }" label="❌" color="white" variant="ghost" @click="typeForm = 'edit' ;row.allowdelete = 1" />
          </template>
          <template #is_print-data="{ row }">
            <UButton v-if="row.allowdownload === 1" :ui="{ rounded: 'rounded-full' }" color="white" variant="ghost" label="✅" @click="typeForm = 'edit' ;row.allowdownload = 0" />
            <UButton v-else :ui="{ rounded: 'rounded-full' }" label="❌" color="white" variant="ghost" @click="typeForm = 'edit' ;row.allowdownload = 1" />
          </template>
          <template #is_approve-data="{ row }">
            <UButton v-if="row.allowapprove === 1" :ui="{ rounded: 'rounded-full' }" color="white" variant="ghost" label="✅" @click="typeForm = 'edit' ;row.allowapprove = 0" />
            <UButton v-else :ui="{ rounded: 'rounded-full' }" label="❌" color="white" variant="ghost" @click="typeForm = 'edit' ;row.allowapprove = 1" />
          </template>
        </UTable>

        <!-- Number of rows & Pagination -->
        <!-- <template #footer>
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
        </template> -->
      </UCard>
    </CardBox>

    <UModal v-model="isModalActive" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Konfirmasi
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isModalActive = false" />
          </div>
        </template>

        <h2>Apakah Anda yakin ingin update data ini</h2>

        <template #footer>
          <UButton color="green" variant="solid" type="button" @click="onSubmit({ data: todos })">
            Update
          </UButton>
        </template>
      </UCard>
    </UModal>
  </SectionMain>
</template>
