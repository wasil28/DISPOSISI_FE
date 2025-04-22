<script setup lang="ts">
import { z } from 'zod'
import Swal from 'sweetalert2'
import { format } from 'date-fns'
import { MasterUmum, AssignPenugasanApi } from '~/apis'
import type { sorter } from '~/types/tableTypes'
import type { FormSubmitEvent } from '#ui/types'
import type { assignFilter } from '~/types/dataFilterTypes'
import moment from 'moment-timezone'

const { session } = await useSession()

const token = session.value?.token

// Set title page
const layoutStore = useLayoutStore()
const pageTitle = 'Assign / Penugasan TTE'
layoutStore.setTitleBreadcrumb(pageTitle, `BSSN > ${pageTitle}`)
useHead({
  title: pageTitle,
})

definePageMeta({
  middleware: 'otorisasi',
  layout: 'module',
})

const otorisasi = ref({ allow_approve: false, allow_delete: false, allow_download: false, allow_edit: false, allow_new: false, allow_view: false })

const { t } = useLang()

// List Kolom Untuk Table
const columns = [
  // {
  //   key: 'aksi',
  //   label: 'Aksi',
  //   sortable: false,
  //   class: 'text-center !w-[120px] whitespace-normal',
  // },
  {
    key: 'namaPenandatangan',
    label: 'Penandatangan',
    sortable: false,
    class: 'whitespace-normal',
  },
  // {
  //   key: 'idJenis',
  //   label: 'ID Jenis',
  //   sortable: false,
  //   class: 'whitespace-normal',
  // },
  {
    key: 'namaDokumen',
    label: 'Nama Dokumen',
    sortable: false,
    class: 'whitespace-normal',
  },
  {
    key: 'namaMahasiswa',
    label: 'Mahasiswa',
    sortable: true,
    class: 'whitespace-normal',
  },
  {
    key: 'statusTte',
    label: 'Status',
    sortable: true,
    class: 'text-center !w-[150px] whitespace-normal',
  },
  {
    key: 'tanggalVerifikasi',
    label: 'Tanggal Verifikasi',
    sortable: true,
    class: 'whitespace-normal',
  }
]

// state untuk LOV
const lovDokumen = ref([])
const lovMasa = ref([])

// state untuk jenis form
const typeForm = ref('create')

// state untuk searching
const search = ref('')
const searchCompleted = ref('')

// State untuk mengatur sorting dan pagination
const sort = ref<sorter>({ column: 'id', direction: 'desc' })
const page = ref(1)
const pageCount = ref(10)

// State Kebutuhan Dynamic Pagination
const totalItems = ref(0)
const totalPages = ref(0)
const currentPage = ref(0)
const pageTotalData = ref(0)

// Menghitung range data yang ditampilkan pada halaman saat ini
const pageFrom = computed(() => (currentPage.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(currentPage.value * pageCount.value, totalItems.value))

// Trigger Modal
const isOpen = ref({
  modalForm: false,
  modalDelete: false,
  modalFilter: false,
})

const response = ref({ data: [], totalItems: 0, totalPages: 0, currentPage: 0 })

// Search
let timeoutId: any = null
const handleInput = () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    searchCompleted.value = search.value
  }, 500)
}

// Data Filter
// const dataFilter = ref<peranPembimbingFilter>({})
const dataFilter = ref<assignFilter>({})
const isFiltered = ref(false)

const dataForm = reactive({
    id: undefined,
    // nik: undefined,
    idDokumen: undefined,
    // idJenis: undefined as number | undefined,
    // namaMahasiswa: undefined,
    // noIdentitas: undefined,
    // statusTte: undefined,
    // tanggalTtd: undefined as Date | undefined,
    nim: undefined,
    masa: undefined,
    // noHp: undefined,
    // typeFile: undefined,
})

const setDataForm = (data?: any) => {
    typeForm.value = data ? 'update' : 'create'

    dataForm.id = data?.id
    // dataForm.nik = data?.nik
    dataForm.idDokumen = data?.idDokumen
    // dataForm.idJenis = data ? parseInt(data.idJenis) : undefined as number | undefined
    // dataForm.namaMahasiswa = data?.namaMahasiswa
    // dataForm.noIdentitas = data?.noIdentitas
    // dataForm.statusTte = data?.statusTte
    // dataForm.tanggalTtd = data?.tanggalTtd ? new Date(data.tanggalTtd) : undefined
    dataForm.nim = data?.nim
    dataForm.masa = data?.masa
    // dataForm.noHp = data?.noHp
    // dataForm.typeFile = data?.typeFile
}


const schema = z.object({
    // nik: z.string({
    //     required_error: 'NIK Wajib diisi!',
    // }),

    idDokumen: z.number({
        required_error: 'Kode Dokumen Wajib diisi!',
    }),

    // idJenis: z.number({
    //     required_error: 'ID Jenis Wajib diisi!',
    // }),

    // namaMahasiswa: z.string({
    //     required_error: 'Nama Mahasiswa Wajib diisi!',
    // }),

    // noIdentitas: z.string({
    //     required_error: 'No Identitas Wajib diisi!',
    // }),

    // statusTte: z.string({
    //     required_error: 'Status TTE Wajib diisi!',
    // }),

    // tanggalTtd: z.date({
    //     required_error: 'Tanggal TTD Wajib diisi!',
    // }),

    nim: z.string({
        required_error: 'NIM Wajib diisi!',
    }),
    masa: z.string({
        required_error: 'MASA Wajib diisi!',
    }),

    // noHp: z.string({
    //     required_error: 'No HP Wajib diisi!',
    // }),

    // typeFile: z.string({
    //     required_error: 'Type File Wajib diisi!',
    // }),

})

type Schema = z.output<typeof schema>

const fetchData = async (isAllData = false) => { // Penambahan param isAllData untuk akomodir export seluruh data (tanpa limit)

  if(!dataFilter.value.statusTte) {
    dataFilter.value.statusTte = 0
  }

  const result = await AssignPenugasanApi.getAllData({
    start: page.value,
    offset: isAllData ? 99999 : pageCount.value,
    order: sort.value.direction.toUpperCase(),
    orderBy: sort.value.column,
    search: search.value,
    filter: dataFilter.value,
  }, token)

  if (!isAllData)
    response.value = result

  return result
}

const { pending, refresh } = await useLazyAsyncData('assignPenugasan', async () => {
  await fetchData()
}, {
  default: () => ({ data: [], totalItems: 0, totalPages: 0, currentPage: 0 }),
  watch: [page, searchCompleted, pageCount, sort],
})

// Handle Apply Data Filter
const handleApplyFilter = () => {
  isOpen.value.modalFilter = false
  isFiltered.value = true
  fetchData()
}

// Handle Reset Data Filter
const handleResetFilter = () => {
  isOpen.value.modalFilter = false
  isFiltered.value = false
  dataFilter.value = {}

  fetchData()
}

// Watcher untuk merespon perubahan pada response.value
watch(response, (newValue) => {
  if (newValue) {
    totalItems.value = newValue.totalItems
    totalPages.value = newValue.totalPages
    currentPage.value = newValue.currentPage
    pageTotalData.value = totalItems.value
  }
})

onMounted(async () => {
  dataFilter.value.statusTte = 0

  fetchData()
  otorisasi.value = session.value?.otorisasi

})

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    const param = {
      id: dataForm.id,
      // nik: event.data.nik,
      idDokumen: event.data.idDokumen,
      // idJenis: event.data.idJenis,
      // namaMahasiswa: event.data.namaMahasiswa,
      // noIdentitas: event.data.noIdentitas,
      // statusTte: event.data.statusTte,
      // tanggalTtd: event.data.tanggalTtd,
      nim: event.data.nim,
      // noHp: event.data.noHp,
      // typeFile: event.data.typeFile,
      masa: event.data.masa,
    }
    const isAdd = await AssignPenugasanApi.addData(param, token)

    if (isAdd) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data berhasil disimpan!',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
      }).then(() => {
        isOpen.value.modalForm = false
        fetchData()
      })
    }
  }
  catch (error: any) {
    console.error(error)
    await Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.message,
    })
  }
}

const deleteForm = async (id: number) => {
    const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Anda tidak akan dapat mengembalikan data ini!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
    })

    if (result.isConfirmed) {
        try {
            const isDeleted = await AssignPenugasanApi.deleteData(id, token)

            await Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: isDeleted.data,
                showConfirmButton: false,
                timer: 1000,
                timerProgressBar: true,
            }).then(() => {
                fetchData()
            })
        } catch (error: any) {
            console.error(error)
            await Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: error.message,
            })
        }
    }
}

// Handle Export Excel
const handleExportData = async (type: string) => {
  const data: any = []

  // Fetch seluruh data (tanpa limit) dengan mengirim param true
  const dataFetch: any = await fetchData(true)

  // Mapping data kolom sesuai kebutuhan pada sheet Excel
  data.push(
    {
      data: dataFetch.data.map((el: any, index: number) => {
        return {
          'No.': index + 1,
          'Program Tawar MBKM': `${el.programTawarData?.jenisProgramDetailData?.kodeJenisProgramDetail} | ${el.programTawarData?.jenisProgramDetailData?.judulJenisProgram}`,
          'Fakultas': `${el.programTawarData?.jenisProgramDetailData?.fakultasData?.kodeFakultas} | ${el.programTawarData?.jenisProgramDetailData?.fakultasData?.namaFakultas}`,
          'Program Studi': `${el.programTawarData?.jenisProgramDetailData?.programStudiData?.kodeProgramStudi} | ${el.programTawarData?.jenisProgramDetailData?.programStudiData?.namaProgramStudi}`,
          'Kelas MBKM': `${el.kelasMbkmData?.namaKelas}`,
          'Status Aktif': el.statusAktifData.keterangan,
        }
      }),
    },
  )

  // Set filename Excel yang akan di-export
  const filename = `Penugasan-TTE-${format(new Date(), 'dd-MM-yyyy-HHmmss')}.${type}`

  if (data.length < 1)
    return

  if (type === 'xlsx')
    downloadExcel(data, filename)
  else if (type === 'csv')
    downloadCsv(data, filename)
}

</script>

<template>
  <SectionMain>
    <UModal
      v-model="isOpen.modalFilter" :ui="{
        width: 'w-full sm:max-w-lg',
      }" prevent-close
    >
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              Filter Data
            </h3>
            <UButton
              color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="isOpen.modalFilter = false"
            />
          </div>
        </template>

        

        <div class="text-right !mt-8 space-x-2">
          <UButton
            v-if="!isEmptyObject(dataFilter)" type="button" class="bg-ut-textDarkGray hover:bg-ut-textGray dark:bg-ut-textDarkGray dark:hover:bg-ut-textGray px-4"
            @click="handleResetFilter"
          >
            Reset Filter
          </UButton>
          <UButton
            type="button" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4" :disabled="isEmptyObject(dataFilter)"
            @click="handleApplyFilter"
          >
            Terapkan Filter
          </UButton>
        </div>
      </UCard>
    </UModal>

    <UModal
      v-model="isOpen.modalForm" :ui="{
        width: 'w-full sm:max-w-lg',
      }" prevent-close
    >
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              Form Penugasan TTE
            </h3>
            <UButton
              color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="isOpen.modalForm = false"
            />
          </div>
        </template>

        <UForm :schema="schema" :state="dataForm" class="space-y-4" @submit="onSubmit">

            <UFormGroup required label="Masa" name="masa">
                <USelectMenu
                    v-model="dataForm.masa" value-attribute="id" option-attribute="name" :required="true" :options="[
                        { id: '20231', name: '20231' },
                        { id: '20232', name: '20232' },
                        { id: '20241', name: '20241' },
                        { id: '20242', name: '20242' }
                    ]" placeholder="Pilih Masa"
                />
            </UFormGroup>

            <UFormGroup required label="NIM" name="nim">
                <UInput v-model="dataForm.nim" :required="true" placeholder="Masukkan NIM" />
            </UFormGroup>

            <UFormGroup required label="Dokumen TTE" name="idDokumen">
                <USelectMenu
                    v-model="dataForm.idDokumen" value-attribute="id" option-attribute="name" :required="true" :options="[
                      { id: 1, name: 'KD001 | LEGALISIR IJAZAH' },
                      { id: 2, name: 'KD002 | SERTIFIKAT' },
                      { id: 3, name: 'KD003 | SURAT KETERANGAN (SK)' },
                      { id: 4, name: 'KD004 | IJAZAH' },
                      { id: 5, name: 'KD005 | TRANSKRIP' }
                    ]" placeholder="Pilih Dokumen TTE"
                />
            </UFormGroup>

          <div class="text-right !mt-8">
            <UButton type="submit" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4">
              <UnoIcon class="i-mdi-content-save" /> Simpan
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

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
        <div class="flex items-center justify-between gap-3 px-4 py-3">
          <div class="flex space-x-2">
            <UButton
              v-if="otorisasi.allow_new"
              class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4" icon="i-mdi-plus"
              @click="setDataForm(); isOpen.modalForm = true;"
            >
              Tambah Data
            </UButton>
            <!-- <UButton
              class="bg-transparent hover:bg-ut-bgBlue-subtle text-ut-bgBlue border border-ut-bgBlue dark:bg-transparent dark:text-white dark:hover:bg-ut-bgBlue-subtle px-4"
              :class="isFiltered ? 'bg-ut-bgBlue-subtle' : ''" :icon="isFiltered ? 'i-mdi-filter' : 'i-mdi-filter-outline'"
              @click="isOpen.modalFilter = true;"
            >
              Filter
            </UButton>
            <UPopover v-if="otorisasi.allow_download" class="inline-block">
              <UButton
                class="bg-ut-bgGreen hover:bg-ut-bgGreen-hover dark:bg-ut-bgGreen dark:text-white dark:hover:bg-ut-bgGreen-hover px-4" trailing-icon="i-heroicons-chevron-down-20-solid"
              >
                Export
              </UButton>

              <template #panel>
                <div>
                  <span class="px-5 py-2 flex items-center gap-x-1 text-sm text-ut-tableBody cursor-pointer transition-all duration-150 hover:bg-gray-200" @click="handleExportData('xlsx')"><UnoIcon class="i-mdi-file-excel text-xs" /> Excel</span>
                  <hr>
                  <span class="px-5 py-2 flex items-center gap-x-1 text-sm text-ut-tableBody cursor-pointer transition-all duration-150 hover:bg-gray-200" @click="handleExportData('csv')"><UnoIcon class="i-mdi-file-csv text-xs" /> CSV</span>
                </div>
              </template>
            </UPopover> -->
          </div>
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
          v-model:sort="sort" :rows="response.data" :columns="columns" :loading="pending"
          sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down" sort-mode="manual" class="w-full"
          :ui="{ td: { base: '!whitespace-normal !break-all dark:text-white max-w-[0]' }, selectable: { size: 'sm' } }"
        >
          <!-- <template #aksi-data="{ row }">
            <div class="flex justify-center items-center gap-x-1.5">
              <UButton v-if="otorisasi.allow_edit" class="!bg-ut-actionBlue px-1.5 py-1.5" title="Ubah" @click="setDataForm(row); isOpen.modalForm = true;">
                <UnoIcon class="i-mdi-pencil cursor-pointer text-sm !text-white" />
              </UButton>
              <UButton v-if="otorisasi.allow_delete" class="!bg-ut-actionRed px-1.5 py-1.5" title="Hapus" @click="deleteForm(row.id)">
                <UnoIcon class="i-mdi-delete cursor-pointer text-sm !text-white" />
              </UButton>
            </div>
          </template> -->
            <template #namaPenandatangan-data="{ row }">
              <b> NIK : </b><br>
              {{ `${row.nik}` }}<br>
              <b> Nama :</b><br>
                {{ `${row.pejabatPenandatanganData?.pejabatData?.namaPejabat}` }}<br>
              <b> Jabatan :</b><br>
                {{ `${row.pejabatPenandatanganData?.pejabatData?.keteranganJabatan}` }}
            </template>

            <!-- <template #idJenis-data="{ row }">
                {{ `${row.idJenis}` }}
            </template> -->

            <template #namaDokumen-data="{ row }">
                <!--{{ ` ${row.dokumenData?.kode} | ${row.dokumenData?.keterangan}` }}-->
                {{ ` ${row.noIdentitas}` }}
            </template>

            <template #namaMahasiswa-data="{ row }">
              <b> Nama : </b><br>
              {{ `${row.namaMahasiswa}` }}<br>
              <b> NIM : </b><br>
              {{ `${row.nim}` }}<br>
            </template>

            <template #statusTte-data="{ row }">
                <UBadge v-if="row.statusTte == '1'" color="emerald" variant="subtle">
                    Aktif
                </UBadge>
                <UBadge v-else color="rose" variant="subtle">
                    Belum Diverifikasi
                </UBadge>
            </template>

            <template #tanggalVerifikasi-data="{ row }">
                <!-- {{ `${row.createdAt}` }} -->
                {{ `${moment.utc(row.createdAt).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm')}` }}
            </template>

        </UTable>

        <!-- Number of rows & Pagination -->
        <template #footer>
          <div class="flex flex-wrap justify-between text-xs">
            <div class="flex items-center">
              <div class="flex items-center gap-1.5">
                <span class="leading-5">Baris per halaman:</span>
                <USelect
                  v-model="pageCount" :options="[10, 25, 50, 100]" class="me-2 w-20" size="xs"
                  @change="page = 1"
                />
              </div>

              <span class="leading-5">
                Menampilkan
                <span>{{ pageFrom }}</span>
                -
                <span>{{ pageTo }}</span>
                dari
                <span>{{ pageTotalData }}</span>
                data
              </span>
            </div>

            <UPagination
              v-model="page" class="text-xs" :page-count="pageCount" :total="pageTotalData" :ui="{
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
  </SectionMain>
</template>
