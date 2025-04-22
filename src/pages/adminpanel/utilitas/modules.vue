<script setup lang="ts">
import { z } from 'zod'
import Swal from 'sweetalert2'
import { MasterUmum, ModuleApi } from '~/apis'

// Set title page
const layoutStore = useLayoutStore()
const pageTitle = 'Daftar Modul'
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

const dataModule = ref()
// List Kolom Untuk Table
const columns = [
  {
    key: 'aksi',
    label: 'Aksi',
    sortable: false,
    class: '!w-[110px] whitespace-normal',
  },
  // {
  //   key: 'expand',
  //   label: '#',
  //   sortable: false,
  //   class: '!w-[110px] whitespace-normal',
  // },
  {
    key: 'name',
    label: 'Nama Module',
    sortable: true,
    class: '!w-[300px] whitespace-normal',
  },
  {
    key: 'nameEn',
    label: 'Nama Module Inggris',
    sortable: true,
    class: '!w-[300px] whitespace-normal',
  },
  {
    key: 'alias',
    label: 'Kode Module',
    sortable: true,
    class: '!w-[300px] whitespace-normal',
  },
  {
    key: 'url',
    label: 'URL',
    sortable: false,
    class: '!w-[300px] whitespace-normal',
  },
  {
    key: 'seq',
    label: 'Urutan',
    sortable: true,
    class: '!w-[100px] whitespace-normal',
  },
  {
    key: 'iconCls',
    label: 'Icon',
    sortable: true,
    class: '!w-[180px] whitespace-normal',
  },
  {
    key: 'pid',
    label: 'Kelompok Module',
    sortable: true,
    class: '!w-[100px] whitespace-normal',
  },
  {
    key: 'publish',
    label: 'Aktif',
    sortable: false,
    class: '!w-[100px] whitespace-normal',
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

// Get Data Api
const getAllData = async () => {
  try {
    const param = {
      start: page.value,
      offset: pageCount.value,
      orderBy: 'seq',
      order: 'ASC',
      keyword: search.value,
    }
    const dataFetch = await ModuleApi.getAllData(param, token)
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
const pageCount = ref(100)

// State response, data table, meta

const response = ref({ data: [], meta: { totalItems: 0, totalPages: 0, currentPage: 0 } })
const todos = ref({})
const meta = ref({ totalItems: 0, totalPages: 0, currentPage: 0 })

// State kebutuhan dinamis pagination
const totalItems = ref(0)
const totalPages = ref(0)
const currentPage = ref(0)
const pageTotal = ref(0)

const toggleExpand = (row) => {
  row.expanded = !row.expanded
}

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
  watch: [page, searchCompleted, pageCount, sort],
})

// Wathcer untuk merespon perubahan pada response.value
watch(response, (newValue, oldValue) => {
  if (newValue) {
    // Menyimpan data dan metadata pagination yang baru
    // todos.value = transformMenuData(newValue.data) || []
    const tempArr: any[] = []

    newValue.data.forEach((data: any) => {
      if (data.pid === 0) {
        if (!tempArr.find(arr => arr.id === data.id)) {
          tempArr.push(data)

          const childMenus = newValue.data.filter((el: any) => el.pid === data.id)
          childMenus.forEach((child: any) => {
            tempArr.push(child)
          })
        }
      }
      else if (!newValue.data.find(arr => arr.id === data.pid) && !tempArr.find(arr => arr.id === data.id)) {
        tempArr.push(data)
      }
    })

    todos.value = tempArr || []
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
const isDeleted = ref(false)

const typeForm = ref()
const data = ref()
const dataForm = reactive({
  name: null,
  alias: null,
  url: null,
  iconCls: null,
  seq: null,
  pid: null,
  publish: null,
  group: null,
  isSapage: null,
  nameEn: null,
})

// Validation pakai zod
const schema = z.object({
  name: z.string(
    {
      required_error: 'Wajib Diisi!',
      invalid_type_error: 'Wajib Diisi!',
    },
  ).min(5, 'Minimal 5 karakter').refine(value => value.replace(/\s/g, '').length > 0, { message: 'Tidak boleh hanya berisi spasi!' }),
  alias: z.string(
    {
      required_error: 'Wajib Diisi!',
      invalid_type_error: 'Wajib Diisi!',
    },
  ).min(5, 'Minimal 5 karakter').transform(value => value.trim()).refine(value => value.replace(/\s/g, '').length > 0, { message: 'Tidak boleh hanya berisi spasi!' }),
  url: z.string(
    {
      required_error: 'Wajib Diisi!',
      invalid_type_error: 'Wajib Diisi!',
    },
  ).min(1, 'Wajib Diisi!').transform(value => value.trim()).refine(value => value.replace(/\s/g, '').length > 0, { message: 'Tidak boleh hanya berisi spasi!' }),
  iconCls: z.string(
    {
      required_error: 'Wajib Diisi!',
      invalid_type_error: 'Wajib Diisi!',
    },
  ).min(5, 'Minimal 5 karakter').transform(value => value.trim()).refine(value => value.replace(/\s/g, '').length > 0, { message: 'Tidak boleh hanya berisi spasi!' }),
  seq: z.number(
    {
      required_error: 'Wajib Diisi!',
      invalid_type_error: 'Wajib Diisi!',
    },
  ).min(1, 'Minimal 1 karakter'),
  pid: z.any({
    required_error: 'Wajib diisi',
    invalid_type_error: 'Harus Angka',
  }).refine(value => value != undefined && value != null, {
    message: 'Wajib diisi',
  }),
  nameEn: z.string(
    {
      required_error: 'Wajib Diisi!',
      invalid_type_error: 'Wajib Diisi!',
    },
  ).min(5, 'Minimal 5 karakter').transform(value => value.trim()).refine(value => value.replace(/\s/g, '').length > 0, { message: 'Tidak boleh hanya berisi spasi!' }),
})

// Function untuk submit
const onSubmit = async (event) => {
  const param = {
    name: event.data.name,
    alias: event.data.alias,
    url: event.data.url,
    iconCls: event.data.iconCls,
    seq: event.data.seq,
    pid: event.data.pid,
    publish: (event.data.publish == null ? 1 : ((stateActive.value != null) ? stateActive.value : event.data.publish)),
    // group: event.data.group,
    isSapage: 0,
    nameEn: event.data.nameEn,
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
    const apiEndpoint = typeForm.value === 'add' ? ModuleApi.addData : ModuleApi.editData

    // Panggil API dan dapatkan hasilnya
    const dataFetch = await apiEndpoint(id, param, token)

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

const deleteForm = async (id) => {
  const isDeleted = await ModuleApi.deleteData(id, token)

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

// Reset inputan insert
const resetDataForm = () => {
  dataForm.id = null
  dataForm.name = null
  dataForm.alias = null
  dataForm.url = null
  dataForm.iconCls = null
  dataForm.seq = null
  dataForm.pid = null
  dataForm.publish = null
  dataForm.group = null
  dataForm.nameEn = null
}

// Reset inputan insert
const updateDataForm = (data) => {
  dataForm.id = data.id
  dataForm.name = data.name
  dataForm.alias = data.alias
  dataForm.url = data.url
  dataForm.iconCls = data.iconCls
  dataForm.seq = data.seq
  dataForm.pid = data.pid
  dataForm.publish = data.publish
  dataForm.group = null
  dataForm.nameEn = data.nameEn

  typeForm.value = 'edit'
}

function transformMenuData(menuData) {
  // Function to find children based on parentId
  const findChildren = (items, parentId) =>
    items.filter(item => item.pid === parentId)
      .map((item) => {
        const transformedItem = { expanded: false, alias: item.alias, group: item.group, iconCls: item.iconCls, id: item.id, isSapage: item.isSapage, name: item.name, nameEn: item.nameEn, pid: item.pid, publish: item.publish, seq: item.seq, url: item.url }
        // Check if the item has children
        if (findChildren(items, item.id).length > 0)
          transformedItem.children = findChildren(items, item.id)
        else
          transformedItem.to = item.url

        return transformedItem
      })

  // Find main menu items with parentId 0
  const transformedMenu = findChildren(menuData, 0)

  return transformedMenu
}
onMounted(async () => {
  otorisasi.value = session.value.otorisasi
  const dataFetchModule = await MasterUmum.getAllDataModule(token)
  dataModule.value = await dataFetchModule.data
  dataModule.value.push({ id: 0, name: 'ROOT' })
})
</script>

<template>
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
          v-model:sort="sort" :rows="todos" :columns="columnsTable"
          :loading="pending" sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down"
          sort-mode="manual" class="w-full"
          :ui="{ td: { base: '!whitespace-normal !break-word dark:text-white max-w-[0]' } }"
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
            </div>
          </template>
          <template #name-data="{ row }">
            <span :class="row.pid > 0 ? 'pl-6' : ''">{{ row.pid > 0 ? '|_ ' : '' }}{{ row.name }}</span>
          </template>
          <template #publish-data="{ row }">
            <UButton v-if="row.publish === 1" :ui="{ rounded: 'rounded-full' }" color="white" variant="ghost" label="✅" @click="typeForm = 'edit' ;updateDataForm(row) ;isActive = true;stateActive = 0" />
            <UButton v-else :ui="{ rounded: 'rounded-full' }" label="❌" color="white" variant="ghost" @click="typeForm = 'edit' ;updateDataForm(row) ;isActive = true;stateActive = 1" />
          </template>
        </UTable>

        <!-- Number of rows & Pagination -->
        <template #footer>
          <div class="flex flex-wrap justify-between items-center">
            <div>
              <span class="text-xs leading-5">
                {{ t('utils.table.showing') }}
                <span class="font-medium">{{ pageFrom }}</span>
                -
                <span class="font-medium">{{ pageTo }}</span>
                {{ t('utils.table.of') }}
                <span class="font-medium">{{ pageTotal }}</span>
                data
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

    <!-- Modal ketika akan menampilkan module -->
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
          Aktifkan  Modul <b> {{ dataForm.name }} </b>?
        </h2>
        <h2 v-else class="text-sm">
          Nonaktifkan Modul <b> {{ dataForm.name }} </b>?
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

    <!-- Modal ketika akan menonaktifkan module -->
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

    <UModal
      v-model="isModalActive" :ui="{
        width: 'w-full sm:max-w-lg',
      }" prevent-close
    >
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Form Modul
            </h3>
            <UButton
              color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="isModalActive = false"
            />
          </div>
        </template>

        <UForm :schema="schema" :state="dataForm" class="space-y-4" @submit="onSubmit">
          <UFormGroup eager-validation required label="Parent Module" name="pid">
            <USelectMenu v-model="dataForm.pid" class="mb-2" color="blue" variant="outline" placeholder="Pilih Parent Module" searchable :options="dataModule" option-attribute="name" value-attribute="id" />
          </UFormGroup>

          <UFormGroup eager-validation required label="Nama Module" name="name">
            <UInput v-model="dataForm.name" placeholder="ex Menu" @blur="dataForm.name = dataForm.name.trim()" />
          </UFormGroup>

          <UFormGroup eager-validation required label="Nama Module Bahasa Inggris" name="nameEn">
            <UInput v-model="dataForm.nameEn" placeholder="ex Menu" @blur="dataForm.nameEn = dataForm.nameEn.trim()" />
          </UFormGroup>

          <UFormGroup eager-validation required label="Nama Alias" name="alias">
            <UInput v-model="dataForm.alias" placeholder="ex MOD_ALIAS" @blur="dataForm.alias = dataForm.alias.trim()" />
          </UFormGroup>

          <UFormGroup eager-validation required label="URL" name="url">
            <UInput v-model="dataForm.url" placeholder="ex /menu" @blur="dataForm.url = dataForm.url.trim()" />
          </UFormGroup>

          <UFormGroup eager-validation required label="Icon Class" name="iconCls">
            <UInput v-model="dataForm.iconCls" placeholder="ex fa fa-star" @blur="dataForm.iconCls = dataForm.iconCls.trim()" />
          </UFormGroup>

          <UFormGroup eager-validation required label="Urutan" name="seq">
            <UInput v-model="dataForm.seq" placeholder="ex 1 2 3 " type="number" />
          </UFormGroup>

          <div class="text-right !mt-8">
            <UButton type="submit" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4">
              <UnoIcon class="i-mdi-content-save" /> {{ t('utils.action.save') }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </SectionMain>
</template>
