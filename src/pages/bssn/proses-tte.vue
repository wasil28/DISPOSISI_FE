<script setup lang="ts">
import { z } from 'zod'
import Swal from 'sweetalert2'
import { format } from 'date-fns'
import { MasterUmum, AssignPenugasanApi } from '~/apis'
import type { sorter } from '~/types/tableTypes'
import type { FormSubmitEvent } from '#ui/types'
import type { prosesTteFilter } from '~/types/dataFilterTypes'
import moment from 'moment-timezone'

const { session } = await useSession()

const token = session.value?.token
const tokenApi = ref(null)
const urlApi = useRuntimeConfig().public.apiEndpointMaster;

const { query } = useRoute()
// const noSurat = query.no_surat.toString()
const dataFilter = ref<prosesTteFilter>({})

// Set title page
const layoutStore = useLayoutStore()
const pageTitle = 'Proses TTE'
layoutStore.setTitleBreadcrumb(pageTitle, `BSSN > ${pageTitle}`)
useHead({
  title: pageTitle,
})

definePageMeta({
  // middleware: 'otorisasi',
  layout: 'module',
})

const otorisasi = ref({ allow_approve: false, allow_delete: false, allow_download: false, allow_edit: false, allow_new: false, allow_view: false })

const { t } = useLang()

const columnsApproval = ref([
  {
    key: 'number',
    label: '#',
    sortable: false,
    class: '!w-[100px] text-center whitespace-normal',
  },
  {
    key: 'namaPenandatangan',
    label: 'Nama Penandatangan',
    sortable: false,
    class: 'whitespace-normal',
  },
  {
    key: 'jenisDokumen',
    label: 'Jenis Dokumen',
    sortable: false,
    class: 'whitespace-normal',
  },
  {
    key: 'noIdentitas',
    label: 'No Identitas',
    sortable: false,
    class: 'whitespace-normal',
  },
  {
    key: 'mahasiswa',
    label: 'Mahasiswa',
    sortable: false,
    class: 'whitespace-normal',
  },
  {
    key: 'tglVerifikasi',
    label: 'Tgl Verifikasi',
    sortable: false,
    class: 'whitespace-normal',
  },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    class: 'whitespace-normal',
  },
  // {
    // key: 'approval',
    // label: 'Approval',
    // sortable: false,
    // class: 'whitespace-normal',
  // },
  // {
    // label: 'Approval',
  //   key: 'select',
  //   class: '!w-[30px]'
  // }
  // {
  //   key: 'select',
  //   class: 'w-2'
  // }
  // {
  //   key: 'aksi',
  //   label: 'Aksi',
  //   sortable: false,
  //   class: 'text-center !w-[120px] whitespace-normal',
  // },
])

// function select(row) {
//   const index = selected.value.findIndex(item => item.id === row.id)
//   if (index === -1) {
//     selected.value.push(row)
//   } else {
//     selected.value.splice(index, 1)
//   }
// }

const selected = ref([])

// Trigger Modal
const isOpen = ref({
  modalDelete: false,
  idDelete: undefined,
  deleteMessage: undefined,
})

// state untuk LOV
const dataHeaderIjinKelas = ref({})

// state untuk jenis form
const tipeTabs = ref('PROSES')
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

const responsePembimbing = ref({ data: [], totalItems: 0, totalPages: 0, currentPage: 0 })

// Search
let timeoutId: any = null
const handleInput = () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    searchCompleted.value = search.value
    page.value = 1
  }, 500)
}

// Data Filter
// const dataFilterPembimbing = ref<tutorialMbkmMhsFilter>({})
const isFiltered = ref(false)

const fetchDataPembimbing = async (isAllData = false) => { // Penambahan param isAllData untuk akomodir export seluruh data (tanpa limit)

  if (!dataFilter.value.statusTte) {
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
    responsePembimbing.value = result

  return result
}

const { pendingPembimbing } = await useLazyAsyncData('pembimbing', async () => {
  await fetchDataPembimbing()
}, {
  default: () => ({ data: [], totalItems: 0, totalPages: 0, currentPage: 0 }),
  watch: [tipeTabs, page, searchCompleted, pageCount, sort],
})

// Watcher untuk merespon perubahan pada response.value
watch(responsePembimbing, (newValue) => {
  if (newValue) {
    totalItems.value = newValue.totalItems
    totalPages.value = newValue.totalPages
    currentPage.value = newValue.currentPage
    pageTotalData.value = totalItems.value
  }
})

onMounted(async () => {
  tokenApi.value = sessionStorage.getItem('tokenSrs')
  if (!tokenApi.value)
    tokenApi.value = await useLoginSrs()

  dataFilter.value.statusTte = 0
  await fetchDataPembimbing()
})
// Handle Export Excel
// const handleExportData = async (tipeTable: string, type: string) => {
//   const data: any = []

//   if (tipeTable == 'mahasiswa') {
//     // Fetch seluruh data (tanpa limit) dengan mengirim param true
//     const dataFetch: any = await fetchDataMhs(true)

//     // Mapping data kolom sesuai kebutuhan pada sheet Excel
//     data.push(
//       {
//         data: dataFetch.data.map((el: any, index: number) => {
//           return {
//             'No.': index + 1,
//             'Tutorial MBKM': `${dataPenjadwalan.value?.tutorialMbkmData?.programTawarData?.jenisProgramDetailData?.kodeJenisProgramDetail} | ${dataPenjadwalan.value?.tutorialMbkmData?.programTawarData?.jenisProgramDetailData?.judulJenisProgram}`,
//             'NIM / No Peserta': `${el.nim}`,
//             'Nama Mahasiswa': el.namaMhs,
//           }
//         }),
//       },
//     )
//   }
//   else if (tipeTable == 'pembimbing') {
//     // Fetch seluruh data (tanpa limit) dengan mengirim param true
//     const dataFetch: any = await fetchDataPembimbing(true)

//     // Mapping data kolom sesuai kebutuhan pada sheet Excel
//     data.push(
//       {
//         data: dataFetch.data.map((el: any, index: number) => {
//           return {
//             'No.': index + 1,
//             'Tutorial MBKM': `${dataPenjadwalan.value?.tutorialMbkmData?.programTawarData?.jenisProgramDetailData?.kodeJenisProgramDetail} | ${dataPenjadwalan.value?.tutorialMbkmData?.programTawarData?.jenisProgramDetailData?.judulJenisProgram}`,
//             'Pembimbing': `${el.kodePembimbing} | ${el.namaPembimbing}`,
//             'Peran Pembimbing': `${el.peranPembimbingData?.peranData?.keterangan}`,
//             'Kegiatan Dosen': `${el.kegiatanDosenData?.namaKegiatan}`,
//           }
//         }),
//       },
//     )
//   }

//   // Set filename Excel yang akan di-export
//   const filename = `penjadwalan-detail-${tipeTable}-${format(new Date(), 'dd-MM-yyyy-HHmmss')}.${type}`

//   if (data.length < 1)
//     return

//   if (type === 'xlsx')
//     downloadExcel(data, filename)
//   else if (type === 'csv')
//     downloadCsv(data, filename)
// }

const tabDetail = [
  {
    key: 'PROSES',
    label: 'Belum Diapprove',
    description: 'Permintaan ini sedang menunggu persetujuan.',
  },
  {
    key: 'YA',
    label: 'Sudah Diapprove',
    description: 'Permintaan ini telah disetujui oleh pejabat terkait dan siap untuk dilanjutkan ke tahap selanjutnya.',
  },
  // {
  //   key: 'TIDAK',
  //   label: 'Ditolak',
  //   description: 'Permintaan ini telah ditolak oleh WD 3 dengan alasan tertentu.',
  // },
]


const saveApprove = async (data) => {

  const jumlahData = selected.value.length
  if(jumlahData == 0){
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Silakan Pilih Data yang akan di approve!',
    })
    return
  }else{
    const approveCount = jumlahData;
    const { isConfirmed } = await Swal.fire({
      title: 'Konfirmasi',
      text: `Anda yakin ingin Apakah anda yakin ingin Tanda Tangan Elektronik dengan ${approveCount} data yang dipilih?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, simpan!',
      cancelButtonText: 'Batal',
    });

    if (!isConfirmed) {
      return;
    }
  }
  let status = true

  const resultSaveMassal = []
  for (const item of data) {
    if (status) {
      // Menerapkan kondisi berdasarkan keberadaan kunci 'approve' atau 'batalApprove'
      if (selected.value.some(selectedItem => selectedItem.id == item.id)) {
        const paramApprove = {
          id: +item.id,
          statusTte: 1
        }
        resultSaveMassal.push(paramApprove)
      }
    }
  }

  const { value: password } = await Swal.fire({
    title: 'Konfirmasi',
    text: 'Anda yakin ingin menyimpan data ini?',
    input: 'password',
    inputLabel: 'Masukkan Passphrase Anda',
    inputPlaceholder: 'Passphrase',
    inputAttributes: {
      autocapitalize: 'off',
      autocorrect: 'off',
      autocomplete: 'new-password'
    },
    showCancelButton: true,
    confirmButtonText: 'Simpan',
    cancelButtonText: 'Batal',
    inputValidator: (value) => {
      return new Promise((resolve) => {
        if (value) {
          resolve()
        } else {
          resolve('Anda harus memilih Password')
        }
      })
    }
  })

  if (!password) {
    return
  }

  if(password){

    const createMassal = await AssignPenugasanApi.addMassal(resultSaveMassal, password, token);

    if (createMassal) {
      const successCount = createMassal.dataSuccess.length;
      const failedCount = createMassal.dataFailed.length;

      if (false) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: `Gagal Menyimpan ${failedCount} data.`,
          showConfirmButton: true,
          confirmButtonText: 'Tutup',
        });
      } else {
        let failedMessages = '';
        
        // Menampilkan pesan yang lebih terorganisir untuk data gagal
        createMassal.dataFailed.forEach(item => {
          failedMessages += `<p><strong>Nama Mahasiswa:</strong> ${item.namaMahasiswa}<br><strong>Dokumen:</strong> ${item.dokumen}<br><strong>Pesan:</strong> ${item.message}</p>`;
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          html: `
            <p>Jumlah data tersimpan: ${successCount}</p>
            ${failedCount > 0 ? `<p><strong>Jumlah data gagal: ${failedCount}</strong></p>` : ''}
          `,
          showConfirmButton: true,
          confirmButtonText: 'Tutup',
          showCancelButton: failedCount > 0, // Menampilkan tombol cancel jika ada data gagal
          cancelButtonText: 'Lihat Rincian Gagal',
        }).then((result) => {
          if (result.isDismissed && failedCount > 0) {
            Swal.fire({
              icon: 'error',
              title: 'Rincian Gagal',
              html: `
                <h3>Rincian Gagal:</h3>
                <p>${failedMessages}</p>
              `,
              showConfirmButton: true,
              confirmButtonText: 'Tutup',
            }).then(() => {
              selected.value = [];
              fetchDataPembimbing();  
            });
          }else{
            selected.value = [];
            fetchDataPembimbing();
          }
        });
      }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.',
            showConfirmButton: true, // Membuat tombol OK untuk menutup Swal
            confirmButtonText: 'Tutup', // Teks tombol
        });
    }
  }

}

// const deleteForm = async (id: number) => {
//   try {
//     const isDeleted = await IjinKelas.deleteDataApproval(id, token)

//     if (isDeleted){
//       await Swal.fire({
//         icon: 'success',
//         title: 'Berhasil',
//         text: isDeleted.data,
//         showConfirmButton: false,
//         timer: 1000,
//         timerProgressBar: true,
//       }).then(() => {
//         fetchDataPembimbing()
//       })
//     }
//   }
//   catch (error: any) {
//     console.error(error)
//     await Swal.fire({
//       icon: 'error',
//       title: 'Gagal',
//       text: error.message,
//     })
//   }
// }

const changeTabs = async (key : string) => {
  selected.value = []
  if(key === 'PROSES'){
    // if (!columnsApproval.value.some(column => column.key === 'approval')) {
    //   columnsApproval.value.push({
    //     key: 'approval',
    //     label: 'Approval',
    //     sortable: false,
    //     class: 'whitespace-normal',
    //   })
    // }
    dataFilter.value.statusTte = 0
  }else if(key === 'YA'){
    // columnsApproval.value = columnsApproval.value.filter(column => column.key !== 'approval')
    dataFilter.value.statusTte = 1
  }
  await fetchDataPembimbing()
}
</script>

<template>
  <UModal v-model="isOpen.modalDelete" prevent-close>
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Konfirmasi Hapus Data
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen.idDelete = null; isOpen.deleteMessage = null; isOpen.modalDelete = false" />
        </div>
      </template>

      <h2 class="text-sm">
        Anda yakin akan menghapus data <b> {{ isOpen.deleteMessage }} </b> ?
      </h2>

      <div class="text-right !mt-8">
        <UButton color="red" variant="solid" type="button" @click="isOpen.modalDelete = false; deleteForm(isOpen.idDelete ?? 0)">
          <UnoIcon class="i-mdi-trash" /> Hapus
        </UButton>
      </div>
    </UCard>
  </UModal>
  
  <SectionMain>
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
        <!-- <div class="mt-4 grid grid-cols-2 gap-4 px-4 py-3">
          <div>
            <small class="text-xs text-ut-textDarkGray">No Surat</small><br>
            <span class="text-sm leading-5"> {{ dataHeaderIjinKelas?.no_surat }} </span>
            <br>
            <small class="text-xs text-ut-textDarkGray">Masa</small><br>
            <span class="text-sm leading-5">{{ `${dataHeaderIjinKelas?.masa?.substring(0, 4)} | ${dataHeaderIjinKelas?.keterangan_masa}` }}</span>
          </div>
          <div>
            <small class="text-xs text-ut-textDarkGray">Fakultas</small><br>
            <span class="text-sm leading-5"> {{ `${dataHeaderIjinKelas?.kode_fakultas} | ${dataHeaderIjinKelas?.nama_fakultas} ` }}</span>
          </div>
        </div> -->

        <UTabs :items="tabDetail" class="w-full" @change="tipeTabs = tabDetail[$event].key; changeTabs(tabDetail[$event].key)">
          <template #item="{ item }">
            <UCard>
              <template #header>
                <p class="text-base font-semibold leading-6 text-red-600 dark:text-red-400">
                    {{ `${item.label} : ${pageTotalData.toLocaleString()}` }}
                </p>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ item.description }}
                </p>
              </template>

              <div class="flex items-center justify-between gap-3 px-4 py-3">
                <UButton
                  v-if="item.key === 'PROSES'"
                  class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue text-xs flex justify-center px-3 py-2"
                  @click="saveApprove(responsePembimbing.data)"
                >
                  Simpan Approve
                </UButton>
                <div class="flex space-x-2"></div>
                  <UInput
                    v-model="search"
                    icon="i-heroicons-magnifying-glass-20-solid"
                    :placeholder="`${t('utils.table.search')}...`"
                    :ui="{ icon: { trailing: { pointer: '' } } }"
                    @input="handleInput()"
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
                v-if="item.key === 'PROSES'"
                v-model="selected"
                v-model:sort="sort" :rows="responsePembimbing.data" :columns="columnsApproval" :loading="pendingPembimbing"
                sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down" sort-mode="manual" class="w-full"
                :ui="{ td: { base: '!whitespace-normal !break-all dark:text-white max-w-[0]' }, selectable: { size: 'sm' } }"
              >

                <template #mahasiswa-data="{ row }">
                  <b> Nama : </b><br>
                  {{ `${row.namaMahasiswa}` }}<br>
                  <b> NIM : </b><br>
                  {{ `${row.nim}` }}<br>
                </template>

                <template #number-data="{ row, index }">
                  <div class="flex justify-center items-center gap-x-1.5">
                    <span v-if="index !== -1">{{ index + 1 }}</span>
                  </div>
                </template>
                <template #namaPenandatangan-data="{ row }">
                    <b> NIK : </b><br>
                    {{ `${row.nik}` }}<br>
                    <b> Nama :</b><br>
                    {{ `${row.pejabatPenandatanganData?.pejabatData?.namaPejabat}` }}<br>
                    <b> Jabatan :</b><br>
                    {{ `${row.pejabatPenandatanganData?.pejabatData?.keteranganJabatan}` }}
                </template>
                <template #jenisDokumen-data="{ row }">
                  <div>
                    {{ ` ${row.dokumenData?.kode} | ${row.dokumenData?.keterangan}` }}
                  </div>
                  <br>
                    <UButton
                      class=""
                      color="blue"
                      variant="solid"
                      icon="i-heroicons-document-text-20-solid"
                      :to="`${urlApi}/kegiatan/inbound-bssn/false/${encrypt(row.id)}`"
                      target="_blank"
                    >
                      
                    </UButton>
                </template>
                <template #noIdentitas-data="{ row }">
                  {{ `${row.noIdentitas}` }}
                </template>
                <template #tglVerifikasi-data="{ row }">
                  {{ `${moment.utc(row.createdAt).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm')}` }}
                </template>
                <template #status-data="{ row }">
                  <UBadge v-if="row.statusTte == '1'" color="emerald" variant="subtle">
                      Aktif
                  </UBadge>
                  <UBadge v-else color="rose" variant="subtle">
                      Belum Diverifikasi
                  </UBadge>
                </template>
                <!-- <template #approval-data="{ row }">
                  <div v-if="item.key === 'TIDAK' || item.key === 'YA' ">
                    <UCheckbox v-model="row.batalApprove" label="Batal Approve" />
                    <hr>
                    <br>
                  </div>
                    <URadioGroup color="yellow" v-else v-model="row.approve" :options="[{
                    name: 'Approved',
                    value: 'Approve',
                    }]" :uncheckable="true" />
                    <UCheckbox v-else v-model="row.approve" label="Approve" />
                </template> -->
              </UTable>
              <UTable
                v-else
                v-model:sort="sort" :rows="responsePembimbing.data" :columns="columnsApproval" :loading="pendingPembimbing"
                sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down" sort-mode="manual" class="w-full"
                :ui="{ td: { base: '!whitespace-normal !break-all dark:text-white max-w-[0]' }, selectable: { size: 'sm' } }"
              >

                <template #mahasiswa-data="{ row }">
                  <b> Nama : </b><br>
                  {{ `${row.namaMahasiswa}` }}<br>
                  <b> NIM : </b><br>
                  {{ `${row.nim}` }}<br>
                </template>

                <template #number-data="{ row, index }">
                  <div class="flex justify-center items-center gap-x-1.5">
                    <span v-if="index !== -1">{{ index + 1 }}</span>
                  </div>
                </template>
                <template #namaPenandatangan-data="{ row }">
                    <b> NIK : </b><br>
                    {{ `${row.nik}` }}<br>
                    <b> Nama :</b><br>
                    {{ `${row.pejabatPenandatanganData?.pejabatData?.namaPejabat}` }}<br>
                    <b> Jabatan :</b><br>
                    {{ `${row.pejabatPenandatanganData?.pejabatData?.keteranganJabatan}` }}
                </template>
                <template #jenisDokumen-data="{ row }">
                  <div>
                    {{ ` ${row.dokumenData?.kode} | ${row.dokumenData?.keterangan}` }}
                  </div>
                  <br>
                    <UButton
                      class=""
                      color="blue"
                      variant="solid"
                      icon="i-heroicons-document-text-20-solid"
                      :to="`${urlApi}/kegiatan/inbound-bssn/true/${encrypt(row.id)}`"
                      target="_blank"
                    >
                      
                    </UButton>
                </template>
                <template #noIdentitas-data="{ row }">
                  {{ `${row.noIdentitas}` }}
                </template>
                <template #tglVerifikasi-data="{ row }">
                  {{ `${moment.utc(row.createdAt).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm')}` }}
                </template>
                <template #status-data="{ row }">
                  <UBadge v-if="row.statusTte == '1'" color="emerald" variant="subtle">
                      Aktif
                  </UBadge>
                  <UBadge v-else color="rose" variant="subtle">
                      Belum Diverifikasi
                  </UBadge>
                </template>
                <template #approval-data="{ row }">
                  <div v-if="item.key === 'TIDAK' || item.key === 'YA' ">
                    <!-- <UCheckbox v-model="row.batalApprove" label="Batal Approve" />
                    <hr>
                    <br> -->
                  </div>
                    <!-- <URadioGroup color="yellow" v-else v-model="row.approve" :options="[{
                    name: 'Approved',
                    value: 'Approve',
                    }]" :uncheckable="true" /> -->
                    <UCheckbox v-else v-model="row.approve" label="Approve" />
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
          </template>
        </UTabs>
      </UCard>
    </CardBox>
  </SectionMain>
</template>
