<script lang="ts" setup>
import { z } from 'zod'
import { MasterUmum } from '~/apis'

const props = defineProps<{
  user?: any
  data?: any
}>()

const emit = defineEmits(['submitForm', 'goBack'])

const { session } = await useSession()

const sessionUser = session.value?.mySession?.userBssn
const token = session.value?.token

const provinsi = ref<any>([])
const kotaKab = ref<any>([])
const kecamatan = ref([])
const statusKeluarga = ref([])
const data = ref(props.data?.biodataMahasiswaInfoKontakData?.[0])

const schema = z.object({
  provinsi: z.number().min(1, 'Wajib diisi!'),
  kotaKab: z.number().min(1, 'Wajib diisi!'),
  idKecamatan: z.number().min(1, 'Wajib diisi!'),
  kelurahan: z.string().min(1, 'Wajib diisi!').trim(),
  kodePos: z.string().trim()
    .length(5, 'Kode Pos wajib diisi dan terdiri dari 5 digit angka')
    .refine(value => (/^\d+$/).test(value), 'Kode Pos terdiri dari angka'),
  rt: z.string().trim()
    .length(2, 'RT wajib diisi dan terdiri dari 2 digit angka')
    .refine(value => (/^\d+$/).test(value), 'RT terdiri dari angka'),
  rw: z.string().trim()
    .length(2, 'RW wajib diisi dan terdiri dari 2 digit angka')
    .refine(value => (/^\d+$/).test(value), 'RW terdiri dari angka'),
  namaJalan: z.string().min(3, 'Wajib diisi!').trim(),
  email: z.string().email().min(3, 'Wajib diisi!').trim(),
  nomorHp: z.string().min(8, 'Wajib diisi!')
    .refine(value => (/^\d+$/).test(value), 'No. Handphone terdiri dari angka'),
  nomorTelepon: z.string().optional()
    .refine((value) => {
      if (!value)
        return true

      return (/^\d+$/).test(value)
    }, 'No. Telepon terdiri dari angka'),
  nomorHandphoneKeluarga: z.string().nullish()
    .refine((value) => {
      if (!value)
        return true

      return (/^\d+$/).test(value)
    }, 'No. Handphone keluarga terdiri dari angka'),
  idStatusKeluarga: z.number().nullish(),
  penerimaKps: z.number(),
  nomorKps: z.string().nullish(),
}).refine((data) => {
  if (!data.nomorHandphoneKeluarga)
    return true

  return !!data.idStatusKeluarga
}, {
  message: 'Status keluarga Wajib diisi!',
  path: ['idStatusKeluarga'],
}).refine((data) => {
  if (data.penerimaKps === 0)
    return true

  return !!data.nomorKps
}, {
  message: 'Nomor KPS Wajib diisi!',
  path: ['nomorKps'],
})

const dataForm = reactive({
  provinsi: data?.value?.kecamatanData?.kabupatenKotaData?.idProvinsi ?? 0,
  kotaKab: data?.value?.kecamatanData?.idKabupatenKota ?? 0,
  idKecamatan: data?.value?.idKecamatan ?? 0,
  kelurahan: data?.value?.kelurahan ?? '',
  kodePos: data?.value?.kodePos ?? '',
  rt: data?.value?.rt ?? '',
  rw: data?.value?.rw ?? '',
  namaJalan: data?.value?.namaJalan?.trim()?.replace(/\s+/g, ' ') ?? '',
  email: data?.value?.email ?? '',
  nomorTelepon: data?.value?.nomorTelepon ?? '',
  nomorHandphone: data?.value?.nomorHandphone ?? '',
  nomorHandphoneKeluarga: data?.value?.nomorHandphoneKeluarga ?? '',
  idStatusKeluarga: data?.value?.idStatusKeluarga ?? 0,
  penerimaKps: props.data?.biodataMahasiswaInfoKpsData?.[0]?.nomorKps ? 1 : 0,
  nomorKps: props.data?.biodataMahasiswaInfoKpsData?.[0]?.nomorKps ?? '',
  nomorHp: '',
  kodeTelepon: '62',
  negara: {
    kodeTelepon: '62',
    kodeNegara: 'ID',
  },
})

const apiForm = reactive({
  provinsi: '',
  kotaKab: '',
  idKecamatan: '',
  kelurahan: '',
  kodePos: '',
  rt: '',
  rw: '',
  namaJalan: '',
  email: '',
  nomorTelepon: '',
  nomorHandphone: '',
  nomorHandphoneKeluarga: '',
  idStatusKeluarga: '',
  penerimaKps: 0,
  nomorKps: '',
})

const listKodeTelp = ref([dataForm.negara])

const handleProvinceChange = async () => {
  try {
    const dataKotaKab = await MasterUmum.getAllDataKabupaten(token, dataForm.provinsi)

    kotaKab.value = dataKotaKab.data.map((item: any) => ({
      ...item,
      id: parseInt(item.id),
    }))

    kecamatan.value = []
    dataForm.kotaKab = 0
    dataForm.idKecamatan = 0
  }
  catch (error) {
    console.error('Error fetching kabupaten data:', error)
  }
}

const handleKotaKabChange = async () => {
  try {
    const dataKotaKab = await MasterUmum.getAllDataKecamatan(token, dataForm.kotaKab)
    kecamatan.value = dataKotaKab.data.map((item: any) => ({
      ...item,
      id: parseInt(item.id),
    }))

    dataForm.idKecamatan = 0
  }
  catch (error) {
    console.error('Error fetching kecamatan data:', error)
  }
}

onBeforeMount(async () => {
  const dataStatusKeluarga = await MasterUmum.getAllStatusKeluarga(token)
  statusKeluarga.value = dataStatusKeluarga.data.map((item: any) => ({
    ...item,
    id: parseInt(item.id),
  }))

  const dataProvinsi = await MasterUmum.getAllDataProvinsi(token)
  provinsi.value = dataProvinsi.data.map((item: any) => ({
    ...item,
    id: parseInt(item.id),
  }))

  if (props.user) {
    const provinsiObj: any = provinsi.value.find((obj: any) => obj.kodeProvinsiDikti === props.user?.info_kontak.pos?.kabupaten_kota?.provinsi?.kode_provinsi)

    if (provinsiObj) {
      const dataKotaKab = await MasterUmum.getAllDataKabupaten(token, provinsiObj.id)
      kotaKab.value = dataKotaKab.data.map((item: any) => ({
        ...item,
        id: parseInt(item.id),
      }))
    }

    const kotaKabObj: any = kotaKab.value.find((obj: any) => obj.kodeKabkoDikti === props.user?.info_kontak.pos?.kabupaten_kota?.kode_kabko)

    if (kotaKabObj) {
      const dataKecamatan = await MasterUmum.getAllDataKecamatan(token, kotaKabObj.id)
      kecamatan.value = dataKecamatan.data.map((item: any) => ({
        ...item,
        id: parseInt(item.id),
      }))
    }

    dataForm.provinsi = data?.value?.kecamatanData?.kabupatenKotaData?.idProvinsi ?? parseInt(provinsiObj?.id)
    dataForm.kotaKab = data?.value?.kecamatanData?.idKabupatenKota ?? parseInt(kotaKabObj?.id)
    dataForm.kodePos = data?.value?.kodePos ?? props.user?.info_kontak.pos?.kode_pos
    dataForm.kelurahan = data?.value?.kelurahan ?? props.user?.info_kontak.pos?.nama_pos
    dataForm.namaJalan = data?.value?.namaJalan ?? props.user?.info_kontak.alamat_mahasiswa?.trim()?.replace(/\s+/g, ' ')
    dataForm.email = data?.value?.email ?? props.user?.info_kontak.alamat_email_mahasiswa
    dataForm.nomorHandphone = data?.value?.nomorHandphone ?? props.user?.info_kontak.nomor_hp_mahasiswa
    dataForm.nomorTelepon = data?.value?.nomorTelepon ?? props.user?.info_kontak.nomor_telepon_mahasiswa ?? ''
    dataForm.nomorHandphoneKeluarga = data?.value?.nomorHandphoneKeluarga ?? props.user?.info_kontak.nomor_kontak_kerabat

    apiForm.provinsi = provinsiObj?.id
    apiForm.kotaKab = kotaKabObj?.id
    apiForm.kodePos = props.user?.info_kontak.pos?.kode_pos
    apiForm.kelurahan = props.user?.info_kontak.pos?.nama_pos
    apiForm.email = props.user?.info_kontak.alamat_email_mahasiswa
    apiForm.nomorHandphone = props.user?.info_kontak.nomor_hp_mahasiswa
    apiForm.nomorTelepon = props.user?.info_kontak.nomor_telepon_mahasiswa
    apiForm.nomorHandphoneKeluarga = props.user?.info_kontak.nomor_kontak_kerabat
  }
  else {
    const provinsiObj: any = provinsi.value.find((obj: any) => obj.id === dataForm.provinsi)

    if (provinsiObj) {
      const dataKotaKab = await MasterUmum.getAllDataKabupaten(token, provinsiObj.id)
      kotaKab.value = dataKotaKab.data.map((item: any) => ({
        ...item,
        id: parseInt(item.id),
      }))
    }

    const kotaKabObj: any = kotaKab.value.find((obj: any) => obj.id === dataForm.kotaKab)

    if (kotaKabObj) {
      const dataKecamatan = await MasterUmum.getAllDataKecamatan(token, kotaKabObj.id)
      kecamatan.value = dataKecamatan.data.map((item: any) => ({
        ...item,
        id: parseInt(item.id),
      }))
    }

    dataForm.email = sessionUser.email ?? ''
  }

  const noHp = dataForm.nomorHandphone?.split(new RegExp(`^(0|${dataForm.kodeTelepon})`))
  dataForm.nomorHp = noHp[noHp.length - 1]
})

const submitForm = () => {
  emit('submitForm', {
    ...dataForm,
    kelurahan: dataForm.kelurahan?.trim(),
    namaJalan: dataForm.namaJalan?.trim(),
    idStatusKeluarga: !dataForm.nomorHandphoneKeluarga ? null : dataForm.idStatusKeluarga,
    nomorHandphone: dataForm.kodeTelepon?.concat(dataForm.nomorHp),
  })
}

const goBack = () => {
  emit('goBack')
}
</script>

<template>
  <h1 class="text-ut-textDarkGray">
    Informasi Kontak
  </h1>
  <UForm :schema="schema" :state="dataForm" class="space-y-4 no-transparent" @submit="submitForm">
    <UFormGroup required label="Provinsi" name="provinsi">
      <USelectMenu
        v-model="dataForm.provinsi"
        searchable
        searchable-placeholder="Cari Provinsi"
        :options="provinsi" placeholder="Pilih Provinsi"
        option-attribute="namaProvinsi" value-attribute="id"
        @change="handleProvinceChange"
      />
    </UFormGroup>
    <UFormGroup required label="Kota/Kab." name="kotaKab">
      <USelectMenu
        v-model="dataForm.kotaKab"
        searchable
        searchable-placeholder="Cari Kota / Kabupaten" :options="kotaKab" placeholder="Pilih Kota/Kab."
        option-attribute="namaKabupatenKota" value-attribute="id"
        @change="handleKotaKabChange"
      />
    </UFormGroup>
    <UFormGroup required label="Kecamatan" name="idKecamatan">
      <USelectMenu
        v-model="dataForm.idKecamatan"
        searchable
        searchable-placeholder="Cari Kecamatan" :options="kecamatan" placeholder="Pilih Kecamatan"
        option-attribute="namaKecamatan" value-attribute="id"
      />
    </UFormGroup>
    <UFormGroup required label="Kelurahan" name="kelurahan">
      <UInput
        v-model="dataForm.kelurahan" placeholder="Pilih Kelurahan"
      />
    </UFormGroup>
    <UFormGroup required label="Kode Pos" name="kodePos">
      <UInput v-model="dataForm.kodePos" placeholder="Ketikkan kode pos Anda" />
    </UFormGroup>
    <div class="grid grid-cols-2 gap-x-4">
      <UFormGroup required label="RT" name="rt">
        <UInput v-model="dataForm.rt" placeholder="Ketikkan RT Anda" />
      </UFormGroup>
      <UFormGroup required label="RW" name="rw">
        <UInput v-model="dataForm.rw" placeholder="Ketikkan RW Anda" />
      </UFormGroup>
    </div>
    <UFormGroup required label="Alamat Lengkap" name="namaJalan">
      <UTextarea v-model="dataForm.namaJalan" rows="2" placeholder="Ketikkan alamat lengkap Anda" />
    </UFormGroup>
    <UFormGroup required label="Email" name="email">
      <UInput v-model="dataForm.email" placeholder="Ketikkan alamat email Anda" />
    </UFormGroup>
    <UFormGroup label="No. Telepon" name="nomorTelepon">
      <UInput v-model="dataForm.nomorTelepon" placeholder="Ketikkan nomor telepon Anda" />
    </UFormGroup>
    <UFormGroup required label="No. Handphone" name="nomorHp">
      <div class="flex">
        <USelectMenu
          v-model="dataForm.negara"
          :options="listKodeTelp" placeholder="Silahkan Pilih Kode Negara"
          class="!w-1/6"
          disabled
        >
          <template #label>
            <UnoIcon class="i-flag-id-1x1" />
            <span>{{ dataForm.negara?.kodeNegara }}</span>
            <span>+{{ dataForm.negara?.kodeTelepon }}</span>
          </template>
          <template #option="{ option }">
            <UnoIcon class="i-flag-id-1x1" />
            <span>{{ option.kodeNegara }}</span>
            <span>+{{ option.kodeTelepon }}</span>
          </template>
        </Uselectmenu>
        <UInput v-model="dataForm.nomorHp" placeholder="Ketikkan nomor handphone Anda" class="w-full" />
      </div>
    </UFormGroup>
    <div class="grid grid-cols-2 gap-x-4">
      <UFormGroup label="No. Handphone Keluarga" name="nomorHandphoneKeluarga">
        <UInput v-model="dataForm.nomorHandphoneKeluarga" placeholder="Ketikkan nomor handphone keluarga Anda" />
      </UFormGroup>
      <UFormGroup v-if="!!dataForm.nomorHandphoneKeluarga" required label="Status Keluarga" name="idStatusKeluarga">
        <USelectMenu
          v-model="dataForm.idStatusKeluarga" :options="statusKeluarga" placeholder="Pilih Status Keluarga"
          option-attribute="keterangan" value-attribute="id"
        />
      </UFormGroup>
    </div>
    <UFormGroup label="Penerima Kartu Perlindungan Sosial (KPS)" name="penerimaKps">
      <URadioGroup
        v-model="dataForm.penerimaKps"
        :options="[{ value: 1, label: 'Ya' }, { value: 0, label: 'Tidak' }]"
        :ui="{ wrapper: '[&_>_fieldset]:flex [&_>_fieldset]:flex-row [&_>_fieldset]:gap-x-6' }"
      />
    </UFormGroup>
    <UFormGroup v-if="dataForm.penerimaKps === 1" required label="No. KPS" name="nomorKps">
      <UInput v-model="dataForm.nomorKps" placeholder="Ketikkan nomor KPS Anda" />
    </UFormGroup>
    <div class="flex justify-end gap-x-2.5 !mt-8">
      <UButton
        type="button"
        class="bg-transparent border-2 border-ut-primaryBlue text-ut-primaryBlue hover:text-ut-textBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-6 py-3" @click="goBack"
      >
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

.no-transparent :deep(textarea.bg-transparent) {
  background-color: #FFF !important;
}
</style>
