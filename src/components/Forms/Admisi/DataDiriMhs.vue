<script lang="ts" setup>
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { z } from 'zod'
import { MasterUmum } from '~/apis'

const props = defineProps<{
  user?: any
  data?: any
}>()

const emit = defineEmits(['submitForm'])

const { session } = await useSession()

const sessionUser = session.value?.mySession?.userBssn
const token = session.value?.token
const today = new Date()
const usiaMhs = 21
const initDate = new Date(today.getFullYear() - usiaMhs, today.getMonth(), today.getDate())

const agama = ref<[{
  id: number
  kodeAgama: string
  namaAgama: string
}]>([{ id: 0, kodeAgama: '', namaAgama: '' }])
const jenisKelamin = ref([{ value: 1, label: 'Laki-laki' }, { value: 2, label: 'Perempuan' }])

const schema = z.object({
  nama: z.string().min(1, 'Wajib diisi!').trim()
    .refine((value) => {
      if (!value)
        return true

      return !(/^\d+$/).test(value)
    }, 'Nama terdiri dari huruf'),
  tempatLahir: z.string().min(3, 'Wajib diisi!').trim(),
  tanggalLahir: z.coerce.date(),
  nik: z.string().length(16, 'NIK terdiri dari 16 karakter').trim(),
  idAgama: z.number().min(1, 'Wajib diisi!'),
  npwp: z.string().optional()
    .refine((value) => {
      if (!value)
        return true

      return (/^\d+$/).test(value)
    }, 'NPWP terdiri dari angka')
    .refine((value) => {
      if (!value)
        return true

      return value.length >= 15 && value.length <= 16
    }, 'NPWP terdiri dari 15 hingga 16 digit angka'),
  namaIbuKandung: z.string().min(1, 'Wajib diisi!').trim(),
})

const apiForm = reactive<any>({
  nama: '',
  tempatLahir: '',
  tanggalLahir: undefined,
  idAgama: 0,
  idJenisKelamin: 0,
  idKewarganegaraan: 1,
  nik: undefined,
  npwp: undefined,
  namaIbuKandung: '',
})

const dataForm = reactive({
  nama: props.data?.nama ?? '',
  tempatLahir: props.data?.tempatLahir ?? '',
  tanggalLahir: props.data?.tanggalLahir ? Date.parse(props.data?.tanggalLahir) : undefined,
  idAgama: props.data?.idAgama ?? 0,
  idJenisKelamin: props.data?.idJenisKelamin ?? 0,
  idKewarganegaraan: sessionUser?.idNegaraDikti !== 103 ? 0 : 1,
  nik: props.data?.nik ? props.data?.nik.trim() : undefined,
  npwp: props.data?.npwp ? props.data?.npwp.trim() : undefined,
  namaIbuKandung: props.data?.namaIbuKandung ?? '',
})

const submitForm = () => {
  emit('submitForm', {
    ...dataForm,
    tanggalLahir: dataForm.tanggalLahir ? format(dataForm.tanggalLahir, 'yyyy-MM-dd') : undefined,
  })
}

onBeforeMount(async () => {
  const dataAgama = await MasterUmum.getAllAgama(token)
  agama.value = dataAgama.data.map((item: any) => ({
    ...item,
    id: parseInt(item.id),
  }))

  if (props.user) {
    const agamaObj = agama.value.find(obj => obj.kodeAgama === props.user?.agama.kode_agama)
    const kelaminObj = jenisKelamin.value.find(obj => obj.label.toLowerCase() === props.user?.jenis_kelamin.keterangan.toLowerCase())
    const [day, month, year] = props.user?.tanggal_lahir_mahasiswa.split('/').map(Number)
    const tanggalLahir = new Date(year, month - 1, day)

    dataForm.nama = props.data?.nama ?? props.user?.nama_mahasiswa
    dataForm.tempatLahir = props.data?.tempatLahir ?? props.user?.tempat_lahir_mahasiswa
    dataForm.nik = props.data?.nik ? props.data?.nik.trim() : props.user?.nik
    dataForm.idAgama = props.data?.idAgama ?? agamaObj?.id ?? 0
    dataForm.idJenisKelamin = props.data?.idJenisKelamin ?? kelaminObj?.value ?? 0
    dataForm.tanggalLahir = props.data?.tanggalLahir ? Date.parse(props.data?.tanggalLahir) : tanggalLahir
    dataForm.namaIbuKandung = props.data?.namaIbuKandung ?? props.user?.nama_ibu_kandung

    apiForm.nama = props.user?.nama_mahasiswa
    apiForm.tempatLahir = props.user?.tempat_lahir_mahasiswa
    apiForm.nik = props.user?.nik
    apiForm.idAgama = agamaObj?.id ?? 0
    apiForm.idJenisKelamin = kelaminObj?.value ?? 0
    apiForm.tanggalLahir = tanggalLahir
    apiForm.namaIbuKandung = props.user?.nama_ibu_kandung
  }
  else {
    dataForm.nama = dataForm.nama ?? sessionUser.name ?? ''
    dataForm.nik = dataForm.nik ?? sessionUser.nik ?? ''
  }
})
</script>

<template>
  <UForm :schema="schema" :state="dataForm" class="space-y-4 no-transparent" @submit="submitForm">
    <UFormGroup required label="Nama Lengkap" name="nama">
      <UInput v-model="dataForm.nama" :disabled="!!apiForm.nama" placeholder="Ketikkan nama lengkap Anda" />
    </UFormGroup>
    <div class="grid grid-cols-2 gap-x-4">
      <UFormGroup required label="Tempat Lahir" name="tempatLahir">
        <UInput v-model="dataForm.tempatLahir" placeholder="Ketikkan tempat lahir Anda" />
      </UFormGroup>
      <UFormGroup required label="Tanggal Lahir" name="tanggalLahir">
        <UPopover :popper="{ placement: 'bottom-start' }" :disabled="!!apiForm.tanggalLahir">
          <UButton
            class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-left !text-sm px-2.5 py-1.5 shadow-sm !bg-white dark:!bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            :class="dataForm.tanggalLahir !== undefined ? '' : 'text-ut-textGray'"
            variant="outline"
            :disabled="!!apiForm.tanggalLahir"
            :label="dataForm.tanggalLahir !== undefined ? format(dataForm.tanggalLahir, 'd MMM, yyy', { locale: id }) : 'Pilih Tanggal Lahir Anda'"
          />
          <template #panel="{ close }">
            <UtilsFormsDatePicker v-model="dataForm.tanggalLahir" :move-to="initDate" @close="close" />
          </template>
        </UPopover>
      </UFormGroup>
    </div>
    <UFormGroup required label="Agama" name="idAgama">
      <USelectMenu
        v-model="dataForm.idAgama"
        :options="agama" placeholder="Pilih Agama"
        option-attribute="namaAgama" value-attribute="id"
      />
    </UFormGroup>
    <UFormGroup required label="Jenis Kelamin" name="jenisKelamin">
      <URadioGroup
        v-model="dataForm.idJenisKelamin"
        :options="jenisKelamin"
        :ui="{ wrapper: '[&_>_fieldset]:flex [&_>_fieldset]:flex-row [&_>_fieldset]:gap-x-6' }"
      />
    </UFormGroup>
    <UFormGroup required label="Kewarganegaraan" name="kewarganegaraan">
      <URadioGroup
        v-model="dataForm.idKewarganegaraan" disabled
        :options="[{ value: 1, label: 'WNI' }, { value: 0, label: 'WNA' }]"
        :ui="{ wrapper: '[&_>_fieldset]:flex [&_>_fieldset]:flex-row [&_>_fieldset]:gap-x-6' }"
      />
    </UFormGroup>
    <UFormGroup required label="NIK" name="nik">
      <UInput v-model="dataForm.nik" placeholder="Ketikkan NIK Anda" />
    </UFormGroup>
    <UFormGroup label="NPWP" name="npwp">
      <UInput v-model="dataForm.npwp" placeholder="Ketikkan NPWP Anda" />
    </UFormGroup>
    <UFormGroup required label="Nama Ibu Kandung" name="namaIbuKandung">
      <UInput v-model="dataForm.namaIbuKandung" :disabled="!!apiForm.namaIbuKandung" placeholder="Ketikkan nama lengkap ibu kandung Anda" />
    </UFormGroup>
    <div class="flex justify-end gap-x-2.5 !mt-8">
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
