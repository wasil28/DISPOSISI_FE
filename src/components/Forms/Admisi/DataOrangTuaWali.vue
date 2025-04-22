<script lang="ts" setup>
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { z } from 'zod'
import { MasterUmum } from '~/apis'

const props = defineProps<{
  data?: any
}>()

const emit = defineEmits(['submitForm', 'goBack'])

const { session } = await useSession()

const token = session.value?.token
const today = new Date()
const usiaOrtuWali = 40
const initDate = new Date(today.getFullYear() - usiaOrtuWali, today.getMonth(), today.getDate())

const jenjangPendidikan = ref<[{
  id: number
  keterangan: string
}]>([{ id: 0, keterangan: '' }])

const jenisPekerjaan = ref<[{
  id: number
  keterangan: string
}]>([{ id: 0, keterangan: '' }])

const schema = z.object({
  namaBapak: z.string().optional()
    .refine((value) => {
      if (!value)
        return true

      return (/^[a-zA-Z\s]+$/).test(value)
    }, 'Nama terdiri dari huruf'),
  nikBapak: z.string().optional()
    .refine((value) => {
      if (!value)
        return true

      return (/^\d+$/).test(value)
    }, 'NIK terdiri dari angka')
    .refine((value) => {
      if (!value)
        return true

      return value.length === 16
    }, 'NIK terdiri dari 16 digit angka'),
  jumlahPenghasilanBapak: z.string().optional()
    .refine((value) => {
      if (!value)
        return true

      return (/^\d+$/).test(value)
    }, 'Jumlah penghasilan terdiri dari angka dalam satuan rupiah'),
  namaIbu: z.string().min(3, 'Wajib diisi!'),
  nikIbu: z.string().optional()
    .refine((value) => {
      if (!value)
        return true

      return (/^\d+$/).test(value)
    }, 'NIK terdiri dari angka')
    .refine((value) => {
      if (!value)
        return true

      return value.length === 16
    }, 'NIK terdiri dari 16 digit angka').nullish(),
  jumlahPenghasilanIbu: z.string().optional()
    .refine((value) => {
      if (!value)
        return true

      return (/^\d+$/).test(value)
    }, 'Jumlah penghasilan terdiri dari angka dalam satuan rupiah').nullish(),
})

const dataForm = reactive({
  idJenisKeluargaBapak: 1,
  nikBapak: undefined,
  namaBapak: '',
  tanggalLahirBapak: undefined,
  idJenjangPendidikanBapak: 0,
  idJenisPekerjaanBapak: 0,
  jumlahPenghasilanBapak: undefined,

  idJenisKeluargaIbu: 2,
  nikIbu: undefined,
  namaIbu: props.data?.namaIbuKandung ?? '',
  tanggalLahirIbu: undefined,
  idJenjangPendidikanIbu: 0,
  idJenisPekerjaanIbu: 0,
  jumlahPenghasilanIbu: undefined,

  // wali: {
  //   idJenisKeluarga: 3,
  //   nik: undefined,
  //   nama: '',
  //   tanggalLahir: initDate,
  //   idJenjangPendidikan: 0,
  //   idJenisPekerjaan: 0,
  //   jumlahPenghasilan: undefined,
  // },
})

const submitForm = () => {
  emit('submitForm', {
    bapak: {
      idJenisKeluarga: 1,
      nik: dataForm.nikBapak,
      nama: dataForm.namaBapak,
      tanggalLahir: dataForm.tanggalLahirBapak ? format(dataForm.tanggalLahirBapak, 'yyyy-MM-dd') : undefined,
      idJenjangPendidikan: dataForm.idJenjangPendidikanBapak,
      idJenisPekerjaan: dataForm.idJenisPekerjaanBapak,
      jumlahPenghasilan: dataForm.jumlahPenghasilanBapak,
    },
    ibu: {
      idJenisKeluarga: 2,
      nik: dataForm.nikIbu,
      nama: dataForm.namaIbu,
      tanggalLahir: dataForm.tanggalLahirIbu ? format(dataForm.tanggalLahirIbu, 'yyyy-MM-dd') : undefined,
      idJenjangPendidikan: dataForm.idJenjangPendidikanIbu,
      idJenisPekerjaan: dataForm.idJenisPekerjaanIbu,
      jumlahPenghasilan: dataForm.jumlahPenghasilanIbu,
    },
    // wali: {
    //   ...dataForm.wali,
    //   tanggalLahir: format(dataForm.wali.tanggalLahir, 'yyyy-MM-dd'),
    // },
  })
}

const goBack = () => {
  emit('goBack')
}

onBeforeMount(async () => {
  const dataJenjangPendidikan = await MasterUmum.getAllJenjangPendidikan(token)
  jenjangPendidikan.value = dataJenjangPendidikan.data.map((item: any) => ({
    ...item,
    id: parseInt(item.id),
  }))

  const dataJenisPekerjaan = await MasterUmum.getAllJenisPekerjaan(token)
  jenisPekerjaan.value = dataJenisPekerjaan.data.map((item: any) => ({
    ...item,
    id: parseInt(item.id),
  }))

  const dataKeluarga = props.data?.biodataMahasiswaInfoKeluargaData
  if (dataKeluarga) {
    const dataIbu = dataKeluarga.find((obj: any) => obj.idJenisKeluarga === dataForm.idJenisKeluargaIbu)
    dataForm.nikIbu = dataIbu?.nik
    dataForm.namaIbu = dataIbu?.nama ?? props.data?.namaIbuKandung
    dataForm.tanggalLahirIbu = dataIbu?.tanggalLahir ? Date.parse(dataIbu?.tanggalLahir) : undefined
    dataForm.idJenjangPendidikanIbu = dataIbu?.idJenjangPendidikan
    dataForm.idJenisPekerjaanIbu = dataIbu?.idJenisPekerjaan
    dataForm.jumlahPenghasilanIbu = dataIbu?.jumlahPenghasilan

    const dataBapak = dataKeluarga.find((obj: any) => obj.idJenisKeluarga === dataForm.idJenisKeluargaBapak)
    dataForm.nikBapak = dataBapak?.nik
    dataForm.namaBapak = dataBapak?.nama
    dataForm.tanggalLahirBapak = dataBapak?.tanggalLahir ? Date.parse(dataBapak?.tanggalLahir) : undefined
    dataForm.idJenjangPendidikanBapak = dataBapak?.idJenjangPendidikan
    dataForm.idJenisPekerjaanBapak = dataBapak?.idJenisPekerjaan
    dataForm.jumlahPenghasilanBapak = dataBapak?.jumlahPenghasilan
  }
})
</script>

<template>
  <UForm :schema="schema" :state="dataForm" class="space-y-4 no-transparent" @submit="submitForm">
    <h1 class="text-ut-textDarkGray">
      Data Diri Bapak
    </h1>
    <UFormGroup label="NIK" name="nikBapak">
      <UInput v-model="dataForm.nikBapak" placeholder="Ketikkan NIK Bapak" />
    </UFormGroup>
    <UFormGroup label="Nama Lengkap" name="namaBapak">
      <UInput v-model="dataForm.namaBapak" placeholder="Ketikkan nama lengkap Bapak" />
    </UFormGroup>
    <UFormGroup label="Tanggal Lahir" name="tanggalLahirBapak">
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton
          class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-left !text-sm px-2.5 py-1.5 shadow-sm !bg-white dark:!bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
          variant="outline"
          :class="dataForm.tanggalLahirBapak !== undefined ? '' : 'text-ut-textGray'"
          :label="dataForm.tanggalLahirBapak !== undefined ? format(dataForm.tanggalLahirBapak, 'd MMM, yyy', { locale: id }) : 'Pilih Tanggal Lahir Bapak Anda'"
        />

        <template #panel="{ close }">
          <UtilsFormsDatePicker v-model="dataForm.tanggalLahirBapak" :move-to="initDate" @close="close" />
        </template>
      </UPopover>
    </UFormGroup>
    <UFormGroup label="Pendidikan Terakhir" name="idJenjangPendidikanBapak">
      <USelectMenu
        v-model="dataForm.idJenjangPendidikanBapak" :options="jenjangPendidikan" placeholder="Pilih Pendidikan Terakhir"
        option-attribute="keterangan" value-attribute="id"
      />
    </UFormGroup>
    <UFormGroup label="Pekerjaan" name="idJenisPekerjaanBapak">
      <USelectMenu
        v-model="dataForm.idJenisPekerjaanBapak" :options="jenisPekerjaan" placeholder="Pilih Pekerjaan"
        option-attribute="keterangan" value-attribute="id"
      />
    </UFormGroup>
    <UFormGroup label="Penghasilan" name="jumlahPenghasilanBapak">
      <UInput v-model="dataForm.jumlahPenghasilanBapak" placeholder="Ketikkan nominal penghasilan Bapak">
        <template #leading>
          <span class="text-gray-500 dark:text-gray-400 text-sm">Rp.</span>
        </template>
      </UInput>
    </UFormGroup>

    <br>

    <h1 class="text-ut-textDarkGray">
      Data Diri Ibu
    </h1>
    <UFormGroup label="NIK" name="nikIbu">
      <UInput v-model="dataForm.nikIbu" placeholder="Ketikkan NIK Ibu" />
    </UFormGroup>
    <UFormGroup required label="Nama Lengkap" name="namaIbu">
      <UInput v-model="dataForm.namaIbu" :disabled="props.data?.namaIbuKandung" placeholder="Ketikkan nama lengkap Ibu" />
    </UFormGroup>
    <UFormGroup label="Tanggal Lahir" name="tanggalLahirIbu">
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton
          class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-left !text-sm px-2.5 py-1.5 shadow-sm !bg-white dark:!bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
          variant="outline"
          :class="dataForm.tanggalLahirIbu !== undefined ? '' : 'text-ut-textGray'"
          :label="dataForm.tanggalLahirIbu !== undefined ? format(dataForm.tanggalLahirIbu, 'd MMM, yyy', { locale: id }) : 'Pilih Tanggal Lahir Ibu Anda'"
        />
        <template #panel="{ close }">
          <UtilsFormsDatePicker v-model="dataForm.tanggalLahirIbu" :move-to="undefined" @close="close" />
        </template>
      </UPopover>
    </UFormGroup>
    <UFormGroup label="Pendidikan Terakhir" name="idJenjangPendidikanIbu">
      <USelectMenu
        v-model="dataForm.idJenjangPendidikanIbu" :options="jenjangPendidikan" placeholder="Pilih Pendidikan Terakhir"
        option-attribute="keterangan" value-attribute="id"
      />
    </UFormGroup>
    <UFormGroup label="Pekerjaan" name="idJenisPekerjaanIbu">
      <USelectMenu
        v-model="dataForm.idJenisPekerjaanIbu" :options="jenisPekerjaan" placeholder="Pilih Pekerjaan"
        option-attribute="keterangan" value-attribute="id"
      />
    </UFormGroup>
    <UFormGroup label="Penghasilan" name="jumlahPenghasilanIbu">
      <UInput v-model="dataForm.jumlahPenghasilanIbu" placeholder="Ketikkan nominal penghasilan Ibu">
        <template #leading>
          <span class="text-gray-500 dark:text-gray-400 text-sm">Rp.</span>
        </template>
      </UInput>
    </UFormGroup>
    <br>
    <!-- <h1 class="text-ut-textDarkGray">
      Data Diri Wali
    </h1>
    <UFormGroup required label="NIK" name="nik">
      <UInput v-model="dataForm.wali.nik" placeholder="Ketikkan NIK Wali" />
    </UFormGroup>
    <UFormGroup required label="Nama Lengkap" name="namaLengkap">
      <UInput v-model="dataForm.wali.nama" placeholder="Ketikkan nama lengkap Wali" />
    </UFormGroup>
    <UFormGroup required label="Tanggal Lahir" name="tanggalLahirWali">
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-left !text-sm px-2.5 py-1.5 shadow-sm !bg-white dark:!bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400" variant="outline" :label="format(dataForm.wali.tanggalLahir, 'd MMM, yyy', { locale: id })" />
        <template #panel="{ close }">
          <UtilsFormsDatePicker v-model="dataForm.wali.tanggalLahir" @close="close" />
        </template>
      </UPopover>
    </UFormGroup>
    <UFormGroup label="Pendidikan Terakhir" name="pendidikanTerakhirWali">
      <USelectMenu
        v-model="dataForm.wali.idJenjangPendidikan" :options="jenjangPendidikan" placeholder="Pilih Pendidikan Terakhir"
        option-attribute="keterangan" value-attribute="id"
      />
    </UFormGroup>
    <UFormGroup label="Pekerjaan" name="pekerjaanWali">
      <USelectMenu
        v-model="dataForm.wali.idJenisPekerjaan" :options="jenisPekerjaan" placeholder="Pilih Pekerjaan"
        option-attribute="keterangan" value-attribute="id"
      />
    </UFormGroup>
    <UFormGroup required label="Penghasilan" name="penghasilan">
      <UInput v-model="dataForm.wali.jumlahPenghasilan" placeholder="Ketikkan nominal penghasilan Wali" />
    </UFormGroup> -->
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
