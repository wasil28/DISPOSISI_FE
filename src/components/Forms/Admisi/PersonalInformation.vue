<script lang="ts" setup>
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { z } from 'zod'
import { MasterUmum } from '~/apis'

const props = defineProps<{
  data?: any
}>()

const emit = defineEmits(['submitForm'])

const { session } = await useSession()

const token = session.value?.token

const sessionUser = session.value?.mySession?.userBssn

const today = new Date()
const usiaMhs = 21
const initDate = new Date(today.getFullYear() - usiaMhs, today.getMonth(), today.getDate())

const listKodeTelp = ref<any>([])

const schema = z.object({
  nama: z.string().min(1, 'Required!').trim(),
  tempatLahir: z.string().min(3, 'Required!').trim(),
  tanggalLahir: z.coerce.date(),
  noPassport: z.string().min(6, 'Required!').trim(),
  email: z.string().email().min(3, 'Required!').trim(),
  namaIbuKandung: z.string().min(1, 'Required!').trim(),
  nomorHp: z.string().min(8, 'Required!')
    .refine(value => (/^\d+$/).test(value), 'Phone Number only contain number'),
  idNegaraDikti: z.string().min(1, 'Required!'),
  idJenisKelamin: z.number().min(1, 'Required!'),
})

const dataForm = reactive({
  id: '',
  noPassport: sessionUser.noPasport ?? 0,
  // studentCardno: 0,
  nama: props.data?.nama ?? sessionUser.name ?? undefined,
  tempatLahir: props.data?.tempatLahir ?? '',
  tanggalLahir: props.data?.tanggalLahir ? Date.parse(props.data?.tanggalLahir) : undefined,
  idJenisKelamin: props.data?.idJenisKelamin ?? 0,
  idKewarganegaraan: 0,
  idNegaraDikti: '',
  email: props.data?.biodataMahasiswaInfoKontakData?.[0]?.email ?? sessionUser.email ?? undefined,
  nomorHandphone: props.data?.biodataMahasiswaInfoKontakData?.[0]?.nomorHandphone ?? '',
  nomorHp: '',
  namaIbuKandung: props.data?.namaIbuKandung ?? '',
  negara: undefined,
  kodeTelepon: '',
})

const submitForm = () => {
  emit('submitForm', {
    ...dataForm,
    tanggalLahir: dataForm.tanggalLahir ? format(dataForm.tanggalLahir, 'yyyy-MM-dd') : undefined,
    nomorHandphone: dataForm.kodeTelepon?.concat(dataForm.nomorHp),
  })
}

onBeforeMount(async () => {
  const negara = await MasterUmum.getNegara(sessionUser.idNegaraDikti, token)
  dataForm.idNegaraDikti = negara?.namaNegara
  dataForm.kodeTelepon = negara?.kodeTelepon
  dataForm.negara = negara

  const noHp = dataForm.nomorHandphone?.split(new RegExp(`^(0|${dataForm.kodeTelepon})`))
  dataForm.nomorHp = noHp[noHp.length - 1]

  listKodeTelp.value = [negara]
})
</script>

<template>
  <UForm :schema="schema" :state="dataForm" class="space-y-4 no-transparent" @submit="submitForm">
    <!-- <UFormGroup required label="Official ID" name="officialId">
      <UInput v-model="dataForm.officialId" placeholder="Type in your official ID number" />
    </UFormGroup> -->
    <UFormGroup required label="Passport Number" name="noPassport">
      <UInput v-model="dataForm.noPassport" placeholder="Please type your passport number" :disabled="sessionUser?.noPasport !== null " />
    </UFormGroup>
    <!-- <UFormGroup required label="Student Card Number" name="studentCardNo">
        <UInput v-model="dataForm.studentCardno" placeholder="Please type your passport number" />
      </UFormGroup> -->
    <UFormGroup required label="Full Name" name="nama">
      <UInput v-model="dataForm.nama" placeholder="Please type your full name" />
    </UFormGroup>
    <div class="grid grid-cols-2 gap-x-4">
      <UFormGroup required label="Birth Place" name="tempatLahir">
        <UInput v-model="dataForm.tempatLahir" placeholder="Please type your birth place" />
      </UFormGroup>
      <UFormGroup required label="Birth Date" name="tanggalLahir">
        <UPopover :popper="{ placement: 'bottom-start' }">
          <UButton
            class="relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0 form-input rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-left !text-sm px-2.5 py-1.5 shadow-sm !bg-white dark:!bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            variant="outline"
            :class="dataForm.tanggalLahir !== undefined ? '' : 'text-ut-textGray'"
            :label="dataForm.tanggalLahir !== undefined ? format(dataForm.tanggalLahir, 'd MMM, yyy', { locale: id }) : 'Pilih Tanggal Lahir Anda'"
          />
          <template #panel="{ close }">
            <UtilsFormsDatePicker v-model="dataForm.tanggalLahir" :move-to="initDate" @close="close" />
          </template>
        </UPopover>
      </UFormGroup>
    </div>
    <UFormGroup required label="Gender" name="idJenisKelamin">
      <URadioGroup
        v-model="dataForm.idJenisKelamin"
        :options="[{ value: 2, label: 'Female' }, { value: 1, label: 'Male' }]"
        :ui="{ wrapper: '[&_>_fieldset]:flex [&_>_fieldset]:flex-row [&_>_fieldset]:gap-x-6' }"
      />
    </UFormGroup>
    <UFormGroup required label="Country" name="idNegaraDikti">
      <UInput v-model="dataForm.idNegaraDikti" :disabled="sessionUser?.idNegaraDikti !== null " />
    </UFormGroup>
    <UFormGroup required label="Email" name="email">
      <UInput v-model="dataForm.email" placeholder="Please type your Email" :disabled="sessionUser?.email !== null " />
    </UFormGroup>
    <UFormGroup required label="Phone Number" name="nomorHp">
      <div class="flex">
        <USelectMenu
          v-model="dataForm.negara"
          :options="listKodeTelp" placeholder="Select Country Code"
          class="!w-1/6"
          disabled
        >
          <template #label>
            <UnoIcon :class="`i-flag-${dataForm.negara?.kodeNegara.trim().toLowerCase()}-1x1`" />
            <span>{{ dataForm.negara?.kodeNegara }}</span>
            <span>+{{ dataForm.negara?.kodeTelepon }}</span>
          </template>
          <template #option="{ option }">
            <UnoIcon :class="`i-flag-${option.kodeNegara.trim().toLowerCase()}-1x1`" />
            <span>{{ option.kodeNegara }}</span>
            <span>+{{ option.kodeTelepon }}</span>
          </template>
        </Uselectmenu>
        <UInput v-model="dataForm.nomorHp" placeholder="Please type your phone number" class="w-full" />
      </div>
    </UFormGroup>
    <UFormGroup required label="Mother's Maiden Name" name="namaIbuKandung">
      <UInput v-model="dataForm.namaIbuKandung" placeholder="Please type your mother's maiden name" />
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
