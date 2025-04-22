<script lang="ts" setup>
import { z } from 'zod'
import { Srs } from '~/apis'

const props = defineProps<{
  user?: any
  data?: any
}>()

const emit = defineEmits(['submitForm', 'goBack'])

let token = sessionStorage.getItem('tokenSrs')

const loading = ref(false)
const data = ref(props.data?.biodataMahasiswaInfoPendidikanAkhirData?.[0])
const listProdi = ref([])
const listPT = ref([])

const schema = z.object({
  perguruanTinggi: z.any({
    required_error: 'Wajib diisi',
  }).refine(value => value !== undefined && value != null, {
    message: 'Wajib diisi',
  }),
  programStudi: z.any({
    required_error: 'Wajib diisi',
  }).refine(value => value !== undefined && value != null, {
    message: 'Wajib diisi',
  }),
  nisn: z.string()
    .length(10, 'NISN wajib diisi dan terdiri dari 10 digit angka')
    .refine(value => (/^\d+$/).test(value), 'NISN terdiri dari angka'),
  nimAsal: z.string().min(6, 'Wajib diisi!')
    .refine(value => (/^\d+$/).test(value), 'NIM terdiri dari angka'),
})

const dataForm = reactive({
  perguruanTinggi: undefined,
  namaPerguruanTinggiDikti: data.value?.namaPerguruanTinggiDikti ?? '',
  kodePerguruanTinggiDikti: data.value?.kodePerguruanTinggiDikti ?? '',
  programStudi: undefined,
  namaProgramStudiDikti: data.value?.namaProgramStudiDikti ?? '',
  kodeProgramStudiDikti: data.value?.kodeProgramStudiDikti ?? '',
  nisn: data.value?.nisn?.trim() ?? '',
  nimAsal: data.value?.nimAsal?.trim() ?? '',
  kodeProdiUt: undefined,
})

const submitForm = () => {
  emit('submitForm', {
    ...dataForm,
    namaPerguruanTinggiDikti: dataForm.perguruanTinggi?.nama_perguruan_tinggi_dikti,
    kodePerguruanTinggiDikti: dataForm.perguruanTinggi?.kode_perguruan_tinggi_dikti,
    namaProgramStudiDikti: dataForm.programStudi?.nama_program_studi_dikti,
    kodeProgramStudiDikti: dataForm.programStudi?.kode_program_studi_dikti,
  })
}

const goBack = () => {
  emit('goBack')
}

const handlePTChange = async () => {
  try {
    if (!token)
      token = await useLoginSrs()

    const dataPT = await Srs.getProdiDiktiByIdPerguruanTinggi(dataForm.perguruanTinggi?.id_perguruan_tinggi_dikti, token)

    listProdi.value = dataPT.data.map((item: any) => ({
      ...item,
      keterangan: `${item.kode_program_studi_dikti} - ${item.nama_program_studi_dikti}`,
    }))
    dataForm.programStudi = undefined
  }
  catch (error) {
    console.error('Error fetching Perguruan Tinggi data:', error)
  }
}

async function searchPTDikti(q: string) {
  loading.value = true

  if (!token)
    token = await useLoginSrs()

  if (q.length > 3) {
    const dataPT = await Srs.getAllPerguruanTinggi({
      namaPerguruanTinggi: q,
    }, token)

    listPT.value = dataPT.data.map((item: any) => ({
      ...item,
      keterangan: `${item.kode_perguruan_tinggi_dikti} - ${item.nama_perguruan_tinggi_dikti}`,
    }))
  }

  loading.value = false

  return listPT.value
}

onBeforeMount(async () => {
  if (props.user) {
    dataForm.namaPerguruanTinggiDikti = 'Universitas Terbuka'
    dataForm.nimAsal = props.user?.nim
    dataForm.kodeProdiUt = props.user?.info_ut?.program_studi?.kode_program_studi
    dataForm.nisn = props.user?.info_pendidikan_akhir?.nisn?.trim()
  }

  if (dataForm.namaPerguruanTinggiDikti) {
    const dataPT = await searchPTDikti(dataForm.namaPerguruanTinggiDikti)
    dataForm.perguruanTinggi = dataPT[0]
    await handlePTChange()

    if (props.user?.info_ut?.program_studi?.prodi_dikti && !dataForm.kodeProgramStudiDikti) {
      const prodiObj: any = listProdi.value.find((obj: any) => obj.kode_program_studi_dikti.toLowerCase() === props.user?.info_ut?.program_studi?.prodi_dikti?.kode_prodi_dikti.toLowerCase())
      if (prodiObj)
        dataForm.programStudi = prodiObj
    }
    else {
      const prodiObj: any = listProdi.value.find((obj: any) => obj.kode_program_studi_dikti === dataForm.kodeProgramStudiDikti)
      if (prodiObj)
        dataForm.programStudi = prodiObj
    }
  }
})
</script>

<template>
  <UForm :schema="schema" :state="dataForm" class="space-y-4 no-transparent" @submit="submitForm">
    <UFormGroup required label="Perguruan Tinggi" name="perguruanTinggi">
      <USelectMenu
        v-model="dataForm.perguruanTinggi"
        :searchable="searchPTDikti" searchable-placeholder="Cari Nama Perguruan Tinggi"
        :loading="loading"
        :debounce="300"
        :disabled="!!props.user?.info_ut"
        trailing
        placeholder="Pilih Perguruan Tinggi"
        option-attribute="keterangan"
        @change="handlePTChange"
      >
        <template #option-empty="{ query }">
          <q>{{ query }}</q> Tidak Ditemukan
        </template>
      </USelectMenu>
    </UFormGroup>
    <UFormGroup required label="Program Studi" name="programStudi">
      <USelectMenu
        v-model="dataForm.programStudi"
        searchable
        searchable-placeholder="Cari Nama Program Studi"
        :options="listProdi"
        :disabled="!!props.user?.info_ut?.program_studi?.prodi_dikti?.kode_prodi_dikti || dataForm.kodeProgramStudiDikti"
        placeholder="Pilih Program Studi"
        option-attribute="keterangan"
      >
        <template #option-empty="{ query }">
          <q>{{ query }}</q> Tidak Ditemukan
        </template>
      </USelectMenu>
    </UFormGroup>
    <UFormGroup required label="NIM Asal" name="nimAsal">
      <UInput v-model="dataForm.nimAsal" :disabled="!!props.user?.nim || !!props.data?.nimAsal?.trim()" placeholder="Ketikkan NIM asal Anda" />
    </UFormGroup>
    <UFormGroup required label="NISN" name="nisn">
      <UInput v-model="dataForm.nisn" placeholder="Ketikkan NISN Anda" />
    </UFormGroup>
    <div class="flex justify-end gap-x-2.5 !mt-8">
      <UButton type="button" class="bg-transparent border-2 border-ut-primaryBlue text-ut-primaryBlue hover:text-ut-textBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-6 py-3" @click="goBack">
        <UnoIcon class="i-mdi-arrow-left text-lg" /> Kembali
      </UButton>
      <UButton type="submit" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-6 py-3">
        Simpan dan Selanjutnya <UnoIcon class="i-mdi-arrow-right text-lg" />
      </UButton>
    </div>
  </UForm>
</template>

<style scoped>
.no-transparent :deep(input.form-input.bg-transparent) {
  background-color: #FFF !important;
}

.no-transparent :deep(button.bg-transparent) {
  background-color: #FFF !important;
}
</style>
