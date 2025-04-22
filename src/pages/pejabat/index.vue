<script setup lang="ts">
import { z } from 'zod'
import Swal from 'sweetalert2'
import { PejabatPenandatanganApi, MasterUmum } from '~/apis'
import type { sorter } from '~/types/tableTypes'
import type { FormSubmitEvent } from '#ui/types'
import type { pejabatPenandatanganFilter } from '~/types/dataFilterTypes'
import { sub, format, isSameDay, type Duration } from 'date-fns'

const { session } = await useSession()
const urlApi = useRuntimeConfig().public.apiEndpointMaster;

const token = session.value?.token

// Data filter
const dataFilter = ref<pejabatPenandatanganFilter>({})
const isFiltered = ref(false)

// Set title page
const layoutStore = useLayoutStore()
const pageTitle = 'Pejabat Penandatangan'
layoutStore.setTitleBreadcrumb(pageTitle, `Sertifikat > ${pageTitle}`)
useHead({
  title: pageTitle,
})

definePageMeta({
  middleware: 'otorisasi',
  layout: 'module',
})

const { t } = useLang()

const otorisasi = ref({ allow_approve: false, allow_delete: false, allow_download: false, allow_edit: false, allow_new: false, allow_view: false })

// List Kolom Untuk Table
const columns = [
  {
    key: 'aksi',
    label: 'Aksi',
    sortable: false,
    class: 'text-center !w-[120px] whitespace-normal',
  },
  {
    key: 'kodePejabat',
    label: 'Kode Pejabat',
    sortable: true,
    class: '!w-[100px] whitespace-normal',
  },
  {
    key: 'nik',
    label: 'NIK',
    sortable: true,
    class: '!w-[300px] whitespace-normal',
  },
  {
    key: 'namaPejabat',
    label: 'Nama Pejabat',
    sortable: true,
    class: '!w-[300px] whitespace-normal',
  },
  {
    key: 'fileTandaTangan',
    label: 'File Tanda Tangan',
    sortable: false,
    class: '!w-[150px] whitespace-normal',
  },
  {
    key: 'fakultas',
    label: 'Fakultas',
    sortable: true,
    class: '!w-[300px] whitespace-normal',
  },
  {
    key: 'keteranganJabatan',
    label: 'Keterangan Pejabat',
    sortable: true,
    class: '!w-[300px] whitespace-normal',
  },


  {
    key: 'statusAktif',
    label: 'Status Aktif',
    sortable: true,
    class: '!w-[100px] whitespace-normal',
  },
]

// state untuk searching
const filter = ref('')
const search = ref('')
const searchCompleted = ref('')

// State untuk mengatur sorting dan pagination
const sort = ref<sorter>({ column: 'id', direction: 'asc' })
const page = ref(1)
const pageCount = ref(10)

// State Reponse , data table , Meta
const response = ref({ data: [], totalItems: 0, totalPages: 0, currentPage: 0 })
const meta = ref({ totalItems: 0, totalPages: 0, currentPage: 0 })

// State Kebutuhan Dynamic Pagination
const totalItems = ref(0)
const totalPages = ref(0)
const currentPage = ref(0)
const pageTotal = ref(0)

// Menghitung range data yang ditampilkan pada halaman saat ini
const pageFrom = computed(() => (currentPage.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(currentPage.value * pageCount.value, totalItems.value))

// Trigger Modal
const isModalForm = ref(false)
const isPejabat = ref(false)
const isDeleted = ref(false)

// state untuk jenis form
const typeForm = ref('create')

const dataForm = reactive({
  id: undefined,
  fileTtd: undefined as File | undefined,
  fileIjazah: undefined as File | undefined,
  fileLegalisir: undefined as File | undefined,
  nik: undefined,
  idPejabat: undefined,
  pejabatLabel: undefined,
})

const resetDataForm = () => {
  dataForm.id = undefined
  dataForm.fileTtd = undefined
  dataForm.fileIjazah = undefined
  dataForm.fileLegalisir = undefined
  dataForm.nik = undefined
  dataForm.idPejabat = undefined
  dataForm.pejabatLabel = undefined
}

const updateDataForm = (data: any) => {

  dataForm.id = data.id
  dataForm.nik = data.nik
  dataForm.fileTtd = data.fileTtd
  dataForm.fileIjazah = data.fileIjazah
  dataForm.fileLegalisir = data.fileLegalisir
  typeForm.value = 'edit'
  dataForm.pejabatLabel = data.pejabatData.namaPejabat
  dataForm.idPejabat = data.pejabatData.id
  dataForm.nik = data.nik

}


// Search
let timeoutId: any = null
const handleInput = () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    searchCompleted.value = search.value
  }, 500)
}

// Watcher untuk merespon perubahan pada response.value
watch(response, (newValue) => {
  if (newValue) {
    totalItems.value = newValue.totalItems
    totalPages.value = newValue.totalPages
    currentPage.value = newValue.currentPage
    pageTotal.value = totalItems.value
  }
})

// Validation Pakai Zod
const schema = z.object({

})

// List of View 
const lovKodeJenisProgram = ref([])
const lovNamaJenisProgram = ref([])

// Fetch data sebelum halaman terender
onBeforeMount(async () => {
  await choosePejabat()
  fetchDataJenisProgramMbkm()
  otorisasi.value = session.value?.otorisasi

  //   const dataJenisProgramMbkm = (await MasterUmum.getAllDataJenisProgram(token)).data

  //   lovKodeJenisProgram.value = dataJenisProgramMbkm.map((item: any)=> {
  //     return {
  //       kodeJenisProgram:item.kodeJenisProgram
  //     }
  //   })
  //   lovNamaJenisProgram.value = dataJenisProgramMbkm.map((item: any)=> {
  //     return {
  //       namaJenisProgram:item.namaJenisProgram
  //     }
  //   })

})

// Validasi untuk penghapusan spasi 2x pada tag input
const validateString = (evt) => {
  const theEvent = evt || window.event

  // Handle paste
  if (theEvent.type === 'paste') {
    key = event.clipboardData.getData('text/plain')
  }
  else {
    // Handle key press
    var key = theEvent.keyCode || theEvent.which
    key = String.fromCharCode(key)
  }
  const regex = /^["']|\.|\s|[A-Za-z]+$/
  if (!regex.test(key)) {
    theEvent.returnValue = false
    if (theEvent.preventDefault)
      theEvent.preventDefault()
  }
}

type Schema = z.output<typeof schema>

const fetchDataJenisProgramMbkm = async (isAllData = false) => {
  const result = await PejabatPenandatanganApi.getAllData({
    start: page.value,
    offset: isAllData ? 99999 : pageCount.value,
    order: sort.value.direction.toUpperCase(),
    orderBy: sort.value.column,
    search: search.value,
    filter: dataFilter.value
  }, token)

  if (!isAllData)
    response.value = result

  return result
}

const { pending } = await useLazyAsyncData('jenisProgramMbkm', async () => {
  await fetchDataJenisProgramMbkm()
}, {
  default: () => ({ data: [], totalItems: 0, totalPages: 0, currentPage: 0 }),
  watch: [page, searchCompleted, pageCount, sort],
})

// onMounted(async () => {
//   // otorisasi.value = session.value?.otorisasi

//   const dataProgramStudi = (await ProgramStudi.getAllProgramStudi(token)).data

//   lovDataProgramStudi.value = dataProgramStudi.map((item: any) => {
//     return {
//       id: parseInt(item.id),
//       namaProgramStudi: item.namaProgramStudi,
//     }
//   })
//   console.log(lovDataProgramStudi.value)
// })


//upload
const handleFileTtd = (event: Event) => {
  const [_file] = (event.target as HTMLInputElement).files as FileList
  dataForm.fileTtd = _file
}
const handleFileIjazah = (event: Event) => {
  const [_file] = (event.target as HTMLInputElement).files as FileList
  dataForm.fileIjazah = _file
}
const handleFileLegalisir = (event: Event) => {
  const [_file] = (event.target as HTMLInputElement).files as FileList
  dataForm.fileLegalisir = _file
}

const dataFormBodyUpload = ref(new FormData())
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {

    if (dataForm.fileTtd) {

      if (dataForm.id) {
        dataFormBodyUpload.value.append('idPenandatanganPejabat', dataForm.id)
      }
      if (dataForm.nik) {
        dataFormBodyUpload.value.append('nik', dataForm.nik?.trim())
      }
      if (dataForm.idPejabat) {
        dataFormBodyUpload.value.append('idPejabat', dataForm.idPejabat)
      }
      if (dataForm.fileTtd) {
        dataFormBodyUpload.value.append('file_ttd', dataForm.fileTtd)
      }
      if (dataForm.fileIjazah) {
        dataFormBodyUpload.value.append('file_ijazah', dataForm.fileIjazah)
      }
      if (dataForm.fileLegalisir) {
        dataFormBodyUpload.value.append('file_legalisir', dataForm.fileLegalisir)
      }

      const responseUpload = await PejabatPenandatanganApi.uploadBerkas(token, dataFormBodyUpload.value)
      dataFormBodyUpload.value = new FormData()

      if (responseUpload.status) {

        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data berhasil disimpan!',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        }).then(() => {
          isModalForm.value = false
          resetDataForm()
          fetchDataJenisProgramMbkm()
        })
      } else {

        Swal.fire({
          icon: 'error',
          title: 'Gagal Simpan Data',
          text: responseUpload?.message,
        })
      }

    }

  }
  catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal Simpan Data',
      text: error.message,
    })
  }
}

const deleteForm = async (id: number) => {
  const isDeleted = await PejabatPenandatanganApi.deleteData(id, token)

  if (isDeleted) {
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: isDeleted.data,
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
    }).then(() => {
      fetchDataJenisProgramMbkm()
    })
  }
  else {
    await Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: isDeleted.message,
    })
  }
}

const datasearch = reactive({
  programStudi: '',
  tipeProgram: '',
  tipeMbkm: '',
})

// Trigger Modal
const isOpen = ref({
  modalForm: false,
  modalDelete: false,
  modalFilter: false,
})

// Handle Reset Data Filter
const handleResetFilter = () => {
  isOpen.value.modalFilter = false
  isFiltered.value = false
  dataFilter.value = {}

  fetchDataJenisProgramMbkm()
}

// Handle Apply Data Filter
const handleApplyFilter = () => {
  isOpen.value.modalFilter = false
  isFiltered.value = true
  fetchDataJenisProgramMbkm()
}

// Handle Export Excel
const handleExportData = async (type: string) => {
  const data: any = []

  // Fetch seluruh data (tanpa limit) dengan mengirim param true
  const dataFetch: any = await fetchDataJenisProgramMbkm(true)

  // Mapping data kolom sesuai kebutuhan pada sheet Excel
  data.push(
    {
      data: dataFetch.data.map((el: any, index: number) => {
        return {
          'No.': index + 1,
          'Kode Pejabat': el?.kodePejabat,
          'nip': el?.nip,
          'File Tanda Tangan': el?.fileTandaTangan,
          'Fakultas': el.fakultasData?.namaFakultas,
        }
      }),
    },
  )

  // Set filename Excel yang akan di-export
  const filename = `daftar-pejabat-${format(new Date(), 'dd-MM-yyyy-HHmmss')}.${type}`

  if (data.length < 1)
    return

  if (type === 'xlsx')
    downloadExcel(data, filename)
  else if (type === 'csv')
    downloadCsv(data, filename)
}


const config = useRuntimeConfig()

const lovDataPejabat = ref([]);
const choosePejabat = async () => {
  const { data } = await MasterUmum.getAllPejabat(token)
  lovDataPejabat.value = data
}

const pagePejabat = ref(1)
const pageCountPejabat = 10

const q = ref('')

const filteredRows = computed(() => {
  if (!q.value) {
    return lovDataPejabat.value
  }

  return lovDataPejabat.value.filter((person) => {
    return Object.values(person).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase())
    })
  })
})

const rowsPejabat = computed(() => {
  return filteredRows.value.slice((pagePejabat.value - 1) * pageCountPejabat, (pagePejabat.value) * pageCountPejabat)
})

const selected = ref([])
function select(row: any) {
  // const index = selected.value.findIndex(item => item.id === row.id)
  // if (index === -1) {
  //   selected.value.push(row)
  // } else {
  //   selected.value.splice(index, 1)
  // }
  console.log(row, 'row')
  dataForm.idPejabat = row.id
  dataForm.pejabatLabel = row.namaPejabat
  isModalForm.value = true
  isPejabat.value = false 
}
</script>

<template>
  <SectionMain class="w-full">
    <UModal v-model="isOpen.modalFilter" :ui="{
      width: 'w-full sm:max-w-lg',
    }" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              Filter Data
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="isOpen.modalFilter = false" />
          </div>
        </template>


        <div class="text-right !mt-64 space-x-2">
          <UButton v-if="!isEmptyObject(dataFilter)" type="button"
            class="bg-ut-textDarkGray hover:bg-ut-textGray dark:bg-ut-textDarkGray dark:hover:bg-ut-textGray px-4"
            @click="handleResetFilter">
            Reset Filter
          </UButton>
          <UButton type="button"
            class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4"
            :disabled="isEmptyObject(dataFilter)" @click="handleApplyFilter">
            Terapkan Filter
          </UButton>
        </div>
      </UCard>
    </UModal>
    <CardBox class="mb-6" has-table>
      <UCard class="w-full" :ui="{
        base: '',
        ring: '',
        divide: 'divide-y divide-gray-200 dark:divide-gray-700',
        header: { padding: 'px-4 py-5' },
        body: { padding: '', base: 'divide-y divide-gray-200 dark:divide-gray-700' },
        footer: { padding: 'p-4' },
      }">
        <!-- Filters -->
        <div class="flex items-center justify-between gap-3 px-4 py-3">
          <div class="flex items-center gap-x-3">
            <UButton
              class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4 mr-4"
              icon="i-mdi-plus" @click="resetDataForm(); isModalForm = true; typeForm = 'create'">
              Tambah Data
            </UButton>
            <!-- <UButton
              class="bg-transparent hover:bg-ut-bgBlue-subtle text-ut-bgBlue border border-ut-bgBlue dark:bg-transparent dark:text-white dark:hover:bg-ut-bgBlue-subtle px-4"
              :class="isFiltered ? 'bg-ut-bgBlue-subtle' : ''" :icon="isFiltered ? 'i-mdi-filter' : 'i-mdi-filter-outline'"
              @click="isOpen.modalFilter = true;"
            >
              Filter
            </UButton> -->

            <!-- <UPopover v-if="otorisasi.allow_download" class="inline-block">
              <UButton
                class="bg-ut-bgGreen hover:bg-ut-bgGreen-hover dark:bg-ut-bgGreen dark:text-white dark:hover:bg-ut-bgGreen-hover px-4"
                trailing-icon="i-heroicons-chevron-down-20-solid">
                Export
              </UButton>

              <template #panel>
                <div>
                  <span
                    class="px-5 py-2 flex items-center gap-x-1 text-sm text-ut-tableBody cursor-pointer transition-all duration-150 hover:bg-gray-200"
                    @click="handleExportData('xlsx')">
                    <UnoIcon class="i-mdi-file-excel text-xs" /> Excel
                  </span>
                  <hr>
                  <span
                    class="px-5 py-2 flex items-center gap-x-1 text-sm text-ut-tableBody cursor-pointer transition-all duration-150 hover:bg-gray-200"
                    @click="handleExportData('csv')">
                    <UnoIcon class="i-mdi-file-csv text-xs" /> CSV
                  </span>
                </div>
              </template>
            </UPopover> -->
          </div>
          <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid"
            :placeholder="`${t('utils.table.search')}...`" @input="handleInput">
            <template #trailing>
              <UButton v-show="search !== ''" color="gray" variant="link" icon="i-heroicons-x-mark-20-solid"
                :padded="false" @click="searchCompleted = ''; search = '';" />
            </template>
          </UInput>
        </div>

        <!-- Table -->
        <UTable v-model:sort="sort" :rows="response.data" :columns="columns" :loading="pending"
          sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down" sort-mode="manual" class="w-full"
          :ui="{ td: { base: 'whitespace-normal !break-word dark:text-white max-w-[0]' }, selectable: { size: 'sm' } }">
          <template #aksi-data="{ row }">
            <div class="flex justify-center items-center gap-x-1.5">
              <UButton v-if="otorisasi.allow_edit" class="!bg-ut-actionBlue px-1.5 py-1.5"
                :title="t('utils.table.edit')" @click="isModalForm = true; updateDataForm(row);">
                <UnoIcon class="i-mdi-pencil cursor-pointer text-sm !text-white" />
              </UButton>

              <!-- <UButton class="!bg-ut-actionRed px-1.5 py-1.5" :title="t('utils.table.delete')" @click="isDeleted = true;updateDataForm(row);">
                <UnoIcon class="i-mdi-delete cursor-pointer text-sm !text-white" />
              </UButton> -->
            </div>
          </template>
          <template #kodePejabat-data="{ row }">
            <p>{{ `${row?.pejabatData?.kodeJabatan || '-'}` }} </p>
          </template>
          <template #nik-data="{ row }">
            <p>{{ `${row?.nik || '-'}` }} </p>
          </template>
          <template #namaPejabat-data="{ row }">
            <p>{{ `${row?.pejabatData?.namaPejabat || '-'}` }} </p>
          </template>
          <template #keteranganJabatan-data="{ row }">
            <p>{{ `${row?.pejabatData?.keteranganJabatan || '-'}` }} </p>
          </template>

          <template #fakultas-data="{ row }">
            <p>{{ `${row?.pejabatData?.fakultasData?.kodeFakultas != undefined ?
              row?.pejabatData?.fakultasData?.kodeFakultas : '-'}` }} | {{
                `${row?.pejabatData?.fakultasData?.namaFakultas != undefined ?
                  row?.pejabatData?.fakultasData?.namaFakultas : '-'}` }}</p>
          </template>

          <template #fileTandaTangan-data="{ row }">
            <!-- <a class="transition-all duration-150 hover:text-ut-primaryBlue" :href="config.public.apiEndpointMaster + '/kegiatan/get-file-ttd-pejabat/'+ row.fileTandaTangan" target="_blank"> {{ row.fileTandaTangan }}</a>  -->
            <UButton icon="i-heroicons-eye"
              class=" !inline ml-2 bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue text-xs flex justify-center px-3 py-2"
              :to="`${config.public.apiEndpointMaster}/kegiatan/get-file-ttd-pejabat/${row.fileTtd}`" target="_blank">
              Preview File
            </UButton>
          </template>
          <template #statusAktif-data="{ row }">
            <UBadge v-if="row?.pejabatData?.statusAktif == 1" class="mb-4" color="green">
              Aktif
            </UBadge>
            <UBadge v-else class="mb-4" color="red">
              Non Aktif
            </UBadge>
          </template>
        </UTable>

        <!-- Number of rows & Pagination -->
        <template #footer>
          <div class="flex flex-wrap justify-between text-xs">
            <div class="flex items-center">
              <div class="flex items-center gap-1.5">
                <span class="leading-5">Baris per halaman:</span>
                <USelect v-model="pageCount" :options="[10, 25, 50, 100]" class="me-2 w-20" size="xs"
                  @change="page = 1" />
              </div>

              <span class="leading-5">
                Menampilkan
                <span>{{ pageFrom }}</span>
                -
                <span>{{ pageTo }}</span>
                dari
                <span>{{ pageTotal }}</span>
                data
              </span>
            </div>

            <UPagination v-model="page" :page-count="pageCount" :total="pageTotal" :ui="{
              wrapper: 'flex items-center gap-1',
              rounded: '!rounded-full min-w-[32px] justify-center',
              default: {
                activeButton: {
                  variant: 'outline',
                },
              },
            }" />
          </div>
        </template>
      </UCard>
    </CardBox>

    <UModal v-model="isModalForm" :ui="{
      width: 'w-full sm:max-w-lg',
    }" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              Form Pejabat NIP : {{ dataForm.nik }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="resetDataForm(); isModalForm = false" />
          </div>
        </template>

        <UForm :schema="schema" :state="dataForm" class="space-y-4" @submit="onSubmit">

          <UFormGroup required label="NIK" name="nik">
            <UInput v-model="dataForm.nik" :required="true" type="text" placeholder="NIK"
              class="[&>input]:cursor-pointer [&>input]:placeholder:text-gray-400" />
            <small class="text-xs text-ut-textGray block mt-1">NIK tidak boleh mengandung spasi</small>
          </UFormGroup>

          <UFormGroup required label="Nama Pejabat" name="namaPejabat">
            <UInput @click="isModalForm = false;isPejabat = true" readonly v-model="dataForm.pejabatLabel" :required="true" type="text"
              placeholder="Nama Pejabat" class="[&>input]:cursor-pointer [&>input]:placeholder:text-gray-400" />
          </UFormGroup>

          <UFormGroup :required="typeof dataForm.fileTtd != 'string'" label="Tanda Tangan Pejabat" name="fileTtd">
            <div class="flex flex-col gap-y-2">
              <div class="flex items-center gap-x-2">
                <span
                  class="border-2 border-ut-primaryBlue text-ut-primaryBlue rounded-md px-4 py-2 text-xs inline-flex items-center gap-x-1.5">
                  <UnoIcon class="i-mdi-upload" />
                  Unggah
                </span>
                <UInput accept=".png" type="file" :required="typeof dataForm.fileTtd != 'string'"
                  class="opacity-0 absolute top-0 [&>input]:cursor-pointer" @change="handleFileTtd" />
                <span class="text-xs text-ut-textDarkGray ml-2.5">{{ dataForm.fileTtd?.name || dataForm.fileTtd
                }}</span>
              </div>
              <div v-if="typeof dataForm.fileTtd === 'string'" class="w-[20%]">
                <UButton icon="i-heroicons-eye"
                  class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue text-xs flex justify-center px-2 py-1.5"
                  :to="`${urlApi}/kegiatan/get-file-ttd-pejabat/${dataForm.fileTtd}`" target="_blank">
                  Preview
                </UButton>
              </div>
            </div>
            <small class="text-xs text-ut-textGray block mt-1">ukuran berkas maksimal 3 MB</small>
          </UFormGroup>

          <UFormGroup label="Tanda Tangan Ijazah" name="fileIjazah">
            <div class="flex flex-col gap-y-2">
              <div class="flex items-center gap-x-2">
                <span
                  class="border-2 border-ut-primaryBlue text-ut-primaryBlue rounded-md px-4 py-2 text-xs inline-flex items-center gap-x-1.5">
                  <UnoIcon class="i-mdi-upload" />
                  Unggah
                </span>
                <UInput accept=".png" type="file" class="opacity-0 absolute top-0 [&>input]:cursor-pointer"
                  @change="handleFileIjazah" />
                <span class="text-xs text-ut-textDarkGray ml-2.5">{{ dataForm.fileIjazah?.name || dataForm.fileIjazah
                }}</span>
              </div>
              <div v-if="typeof dataForm.fileIjazah === 'string'" class="w-[20%]">
                <UButton icon="i-heroicons-eye"
                  class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue text-xs flex justify-center px-2 py-1.5"
                  :to="`${urlApi}/kegiatan/get-file-ttd-pejabat/${dataForm.fileIjazah}`" target="_blank">
                  Preview
                </UButton>
              </div>
            </div>
            <small class="text-xs text-ut-textGray block mt-1">ukuran berkas maksimal 3 MB</small>
          </UFormGroup>

          <UFormGroup label="Tanda Tangan Legalisir" name="fileLegalisir">
            <div class="flex flex-col gap-y-2">
              <div class="flex items-center gap-x-2">
                <span
                  class="border-2 border-ut-primaryBlue text-ut-primaryBlue rounded-md px-4 py-2 text-xs inline-flex items-center gap-x-1.5">
                  <UnoIcon class="i-mdi-upload" />
                  Unggah
                </span>
                <UInput accept=".png" type="file" class="opacity-0 absolute top-0 [&>input]:cursor-pointer"
                  @change="handleFileLegalisir" />
                <span class="text-xs text-ut-textDarkGray ml-2.5">{{ dataForm.fileLegalisir?.name ||
                  dataForm.fileLegalisir
                }}</span>
              </div>
              <div v-if="typeof dataForm.fileLegalisir === 'string'" class="w-[20%]">
                <UButton icon="i-heroicons-eye"
                  class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue text-xs flex justify-center px-2 py-1.5"
                  :to="`${urlApi}/kegiatan/get-file-ttd-pejabat/${dataForm.fileLegalisir}`" target="_blank">
                  Preview
                </UButton>
              </div>
            </div>
            <small class="text-xs text-ut-textGray block mt-1">ukuran berkas maksimal 3 MB</small>
          </UFormGroup>

          <div class="text-right !mt-8 flex items-center justify-end space-x-4">
            <UButton type="submit"
              class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4">
              <UnoIcon class="i-mdi-content-save" /> Simpan
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <UModal :ui="{
      width: 'w-full sm:max-w-4xl',
    }" v-model="isPejabat" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Silakan Pilih Pejabat dibawah ini
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="dataForm.idPejabat = undefined; dataForm.pejabatLabel = undefined; isPejabat = false; isModalForm = true;" />
          </div>
        </template>

        <div>

          <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
            <UInput @input="pagePejabat = 1" v-model="q" placeholder="Filter people..." />
          </div>

          <UTable :rows="rowsPejabat"
            v-model="selected"
            @select="select"
            :ui="{ td: { base: 'whitespace-normal !break-word dark:text-white max-w-[0]' }, selectable: { size: 'sm' } }"
            :columns="[
              {
                key: 'select',
                label: '',
                class: '!w-[50px]'
              },
              {
                key: 'kodePejabat',
                label: 'Kode Pejabat',
                class: 'text-center !w-[90px] whitespace-normal',
              },
              {
                key: 'namaPejabat',
                label: 'Nama Pejabat',
                class: 'text-center !w-[220px] whitespace-normal',
              },
              {
                key: 'keteranganJabatan',
                label: 'Keterangan Jabatan',
                class: 'text-center !w-[220px] whitespace-normal',
              },
              {
                key: 'nip',
                label: 'NIP',
                class: 'text-center !w-[200px] whitespace-normal',
              },
              {
                key: 'fakultas',
                label: 'Fakultas',
                class: 'text-center !w-[320px] whitespace-normal',
              },
            ]">

            <template #kodePejabat-data="{ row }">
              <p>{{ `${row?.kodePejabat || '-'}` }} </p>
            </template>

            <template #namaPejabat-data="{ row }">
              <p>{{ `${row?.namaPejabat || '-'}` }} </p>
            </template>

            <template #keteranganJabatan-data="{ row }">
              <p>{{ `${row?.keteranganJabatan || '-'}` }} </p>
            </template>

            <template #nip-data="{ row }">
              <p>{{ `${row?.nip || '-'}` }} </p>
            </template>
            <template #fakultas-data="{ row }">
              <p>{{ `${row?.fakultasData?.kodeFakultas != undefined ?
                row?.fakultasData?.kodeFakultas : '-'}` }} | {{
                  `${row?.fakultasData?.namaFakultas != undefined ?
                    row?.fakultasData?.namaFakultas : '-'}` }}</p>
            </template>

          </UTable>

          <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
            <UPagination v-model="pagePejabat" :page-count="pageCountPejabat" :total="lovDataPejabat.length" />
          </div>
        </div>

      </UCard>
    </UModal>
  </SectionMain>
</template>
