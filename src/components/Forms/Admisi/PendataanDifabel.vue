<script lang="ts" setup>
import { z } from 'zod'
import { MasterUmum } from '~/apis'

const props = defineProps<{
  data?: any
}>()

const emit = defineEmits(['submitForm', 'goBack'])

const { session } = await useSession()

const sessionUser = session.value?.mySession?.userBssnuserKurikulum
const token = session.value?.token

const jenisDisabilitas = ref<[{
  id: number
  namaJenisDisabilitas: string
  keterangan: string
}]>([{ id: 0, namaJenisDisabilitas: '', keterangan: '' }])

const schema = z.object({
  isDifabel: z.number(),
  idJenisDisabilitas: z.number().nullish(),
  menggunakanAlatBantu: z.number(),
}).refine((data) => {
  if (data.isDifabel === 0)
    return true

  return !!data.idJenisDisabilitas
}, {
  message: 'Jenis disabilitas wajib diisi!',
  path: ['idJenisDisabilitas'],
})

const dataForm = reactive({
  // mhs: {
  //   isDifabel: props.data?.biodataMahasiswaInfoDisabilitasData[0]?.idJenisDisabilitas ? 1 : 0,
  //   idJenisDisabilitas: props.data?.biodataMahasiswaInfoDisabilitasData[0]?.idJenisDisabilitas ?? 0,
  //   menggunakanAlatBantu: props.data?.biodataMahasiswaInfoDisabilitasData[0]?.menggunakanAlatBantu ?? 0,
  // },
  isDifabel: props.data?.biodataMahasiswaInfoDisabilitasData?.[0]?.idJenisDisabilitas ? 1 : 0,
  idJenisDisabilitas: props.data?.biodataMahasiswaInfoDisabilitasData?.[0]?.idJenisDisabilitas ?? 0,
  menggunakanAlatBantu: props.data?.biodataMahasiswaInfoDisabilitasData?.[0]?.menggunakanAlatBantu ?? 0,
  // bapak: {
  //   idJenisKeluarga: 1,
  //   isDifabel: 0,
  //   idJenisDisabilitas: 0,
  //   menggunakanAlatBantu: 0,
  // },
  // ibu: {
  //   idJenisKeluarga: 2,
  //   isDifabel: 0,
  //   idJenisDisabilitas: 0,
  //   menggunakanAlatBantu: 0,
  // },
  // wali: {
  //   idJenisKeluarga: 3,
  //   isDifabel: 0,
  //   idJenisDisabilitas: 0,
  //   menggunakanAlatBantu: 0,
  // },
})

const submitForm = () => {
  emit('submitForm', {
    mhs: {
      isDifabel: dataForm.isDifabel,
      idJenisDisabilitas: dataForm.idJenisDisabilitas,
      menggunakanAlatBantu: dataForm.menggunakanAlatBantu,
    },
  })
}

const goBack = () => {
  emit('goBack')
}

onBeforeMount(async () => {
  const dataJenisDisabilitas = await MasterUmum.getAllJenisDisabilitas(token)
  jenisDisabilitas.value = dataJenisDisabilitas.data.map((item: any) => ({
    ...item,
    id: parseInt(item.id),
  }))
})
</script>

<template>
  <UForm :schema="schema" :state="dataForm" class="space-y-4 no-transparent" @submit="submitForm">
    <h1 class="text-ut-textDarkGray">
      Data Difabel Mahasiswa
    </h1>
    <UFormGroup label="Apakah Anda Difabel?" name="isDifabel">
      <URadioGroup
        v-model="dataForm.isDifabel"
        :options="[{ value: 1, label: 'Ya' }, { value: 0, label: 'Tidak' }]"
        :ui="{ wrapper: '[&_>_fieldset]:flex [&_>_fieldset]:flex-row [&_>_fieldset]:gap-x-6' }"
      />
    </UFormGroup>
    <UFormGroup v-if="dataForm.isDifabel === 1" :required="dataForm.isDifabel === 1" label="Kategori Difabel" name="idJenisDisabilitas">
      <USelectMenu
        v-model="dataForm.idJenisDisabilitas"
        :options="jenisDisabilitas" placeholder="Pilih Kategori Difabel"
        option-attribute="namaJenisDisabilitas" value-attribute="id"
      />
    </UFormGroup>
    <UFormGroup v-if="dataForm.isDifabel === 1" label="Apakah Anda Menggunakan Alat Bantu?" name="menggunakanAlatBantu">
      <URadioGroup
        v-model="dataForm.menggunakanAlatBantu"
        :options="[{ value: 1, label: 'Ya' }, { value: 0, label: 'Tidak' }]"
        :ui="{ wrapper: '[&_>_fieldset]:flex [&_>_fieldset]:flex-row [&_>_fieldset]:gap-x-6' }"
      />
    </UFormGroup>
    <br>
    <!-- <h1 class="text-ut-textDarkGray">
      Data Difabel Keluarga
    </h1>
    <UFormGroup label="Apakah Bapak Anda Difabel?" name="isDifabelBapak">
      <URadioGroup
        v-model="dataForm.bapak.isDifabel"
        :options="[{ value: 1, label: 'Ya' }, { value: 0, label: 'Tidak' }]"
        :ui="{ wrapper: '[&_>_fieldset]:flex [&_>_fieldset]:flex-row [&_>_fieldset]:gap-x-6' }"
      />
    </UFormGroup>
    <UFormGroup v-if="dataForm.bapak.isDifabel === 1" label="Kategori Difabel" name="kategoriDifabelBapak">
      <USelectMenu
        v-model="dataForm.bapak.idJenisDisabilitas" :options="jenisDisabilitas" placeholder="Pilih Kategori Difabel"
        option-attribute="namaJenisDisabilitas" value-attribute="id"
      />
    </UFormGroup>
    <UFormGroup v-if="dataForm.bapak.isDifabel === 1" label="Apakah Menggunakan Alat Bantu?" name="isAlatBantuBapak">
      <URadioGroup
        v-model="dataForm.bapak.menggunakanAlatBantu"
        :options="[{ value: 1, label: 'Ya' }, { value: 0, label: 'Tidak' }]"
        :ui="{ wrapper: '[&_>_fieldset]:flex [&_>_fieldset]:flex-row [&_>_fieldset]:gap-x-6' }"
      />
    </UFormGroup>
    <br>
    <UFormGroup label="Apakah Ibu Anda Difabel?" name="isDifabelIbu">
      <URadioGroup
        v-model="dataForm.ibu.isDifabel"
        :options="[{ value: 1, label: 'Ya' }, { value: 0, label: 'Tidak' }]"
        :ui="{ wrapper: '[&_>_fieldset]:flex [&_>_fieldset]:flex-row [&_>_fieldset]:gap-x-6' }"
      />
    </UFormGroup>
    <UFormGroup v-if="dataForm.ibu.isDifabel === 1" label="Kategori Difabel" name="kategoriDifabelIbu">
      <USelectMenu
        v-model="dataForm.ibu.idJenisDisabilitas" :options="jenisDisabilitas" placeholder="Pilih Kategori Difabel"
        option-attribute="namaJenisDisabilitas" value-attribute="id"
      />
    </UFormGroup>
    <UFormGroup v-if="dataForm.ibu.isDifabel === 1" label="Apakah Menggunakan Alat Bantu?" name="isAlatBantuIbu">
      <URadioGroup
        v-model="dataForm.ibu.menggunakanAlatBantu"
        :options="[{ value: 1, label: 'Ya' }, { value: 0, label: 'Tidak' }]"
        :ui="{ wrapper: '[&_>_fieldset]:flex [&_>_fieldset]:flex-row [&_>_fieldset]:gap-x-6' }"
      />
    </UFormGroup>
    <br>
    <UFormGroup label="Apakah Wali Anda Difabel?" name="isDifabelWali">
      <URadioGroup
        v-model="dataForm.wali.isDifabel"
        :options="[{ value: 1, label: 'Ya' }, { value: 0, label: 'Tidak' }]"
        :ui="{ wrapper: '[&_>_fieldset]:flex [&_>_fieldset]:flex-row [&_>_fieldset]:gap-x-6' }"
      />
    </UFormGroup>
    <UFormGroup v-if="dataForm.wali.isDifabel === 1" label="Kategori Difabel" name="kategoriDifabelWali">
      <USelectMenu
        v-model="dataForm.wali.idJenisDisabilitas" :options="jenisDisabilitas" placeholder="Pilih Kategori Difabel"
        option-attribute="namaJenisDisabilitas" value-attribute="id"
      />
    </UFormGroup>
    <UFormGroup v-if="dataForm.wali.isDifabel === 1" label="Apakah Menggunakan Alat Bantu?" name="isAlatBantuWali">
      <URadioGroup
        v-model="dataForm.wali.menggunakanAlatBantu"
        :options="[{ value: 1, label: 'Ya' }, { value: 0, label: 'Tidak' }]"
        :ui="{ wrapper: '[&_>_fieldset]:flex [&_>_fieldset]:flex-row [&_>_fieldset]:gap-x-6' }"
      />
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
