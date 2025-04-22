<script lang="ts" setup>
import Swal from 'sweetalert2'
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
// import { PengembangApi } from '~/apis'

const { session } = await useSession()
const userName = computed(() =>
  session.value?.mySession ? session.value?.mySession?.userBssn?.name : '',
)
const urlApi = useRuntimeConfig().public.apiEndpointMaster;

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },
  token: {
    type: String,
    required: true,
    default: '',
  },
})

const emit = defineEmits(['update:model-value', 'close'])

const open = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
  },
})

const dataFormPengembang = ref({
  id: undefined,
  nip: '',
  nik: '',
  nidn: '',
  email: '',
  kodePengembang: '',
  namaLengkap: '',
  pekerjaan: '',
  idStatusPekerjaan: undefined,
  namaInstitusi: '',
  idStatusInstitusi: undefined,
  noHp: '',
  namaBank: '',
  noRekening: '',
  atasNamaBank: '',
  fileTtd: undefined as File | undefined,
  urlFile: "",
})

const ubahPasswordVisible = ref({
  old: false,
  new: false,
  confirm: false,
})

const schema = z.object({
  
  // new: z.string({
  //   required_error: 'Wajib diisi',
  // }).min(8, 'Minimal 8 karakter').max(24, 'Maksimal 24 Karakter'),
  // confirm: z.string({
  //   required_error: 'Wajib diisi',
  // }).min(8, 'Minimal 8 karakter').max(24, 'Maksimal 24 Karakter'),
})

const fetchData = async() => {
  const mySession = session.value?.mySession?.userBssn;
  // if(mySession.idPengembang != null && mySession.idPengembang != ''){
  //   const { data } = await PengembangApi.getDatapengembang(mySession.idPengembang ,props.token);
  //   dataFormPengembang.value.id  = data.id
  //   dataFormPengembang.value.nip  = data.nip
  //   dataFormPengembang.value.nik = data.nik
  //   dataFormPengembang.value.nidn = data.nidn
  //   dataFormPengembang.value.email = data.email
  //   dataFormPengembang.value.kodePengembang = data.kodePengembang
  //   dataFormPengembang.value.namaLengkap = data.namaLengkap
  //   dataFormPengembang.value.pekerjaan = data.pekerjaan
  //   dataFormPengembang.value.idStatusPekerjaan = data.idStatusPekerjaan
  //   dataFormPengembang.value.namaInstitusi = data.namaInstitusi
  //   dataFormPengembang.value.idStatusInstitusi = data.idStatusInstitusi
  //   dataFormPengembang.value.noHp = data.noHp
  //   dataFormPengembang.value.namaBank = data.namaBank
  //   dataFormPengembang.value.noRekening = data.noRekening
  //   dataFormPengembang.value.atasNamaBank = data.atasNamaBank

  //   if(data.fileTtd != null){
  //     dataFormPengembang.value.urlFile = `${urlApi}/pengembang/get-file-pengembang/${data.kodePengembang}/${data.fileTtd.replaceAll('/', '$')}?token=${props.token}`
  //   }
  // }
}

await fetchData();
type Schema = z.output<typeof schema>

const onSubmitPengembang = async (event: FormSubmitEvent<Schema>) => {
    const dataForm = dataFormPengembang.value
    const dataFormBodyUpload = ref(new FormData())
    dataFormBodyUpload.value.append('nip', dataForm.nip)
    dataFormBodyUpload.value.append('nik', dataForm.nik)
    dataFormBodyUpload.value.append('nidn', dataForm.nidn)
    dataFormBodyUpload.value.append('email', dataForm.email)
    dataFormBodyUpload.value.append('namaLengkap', dataForm.namaLengkap)
    dataFormBodyUpload.value.append('pekerjaan', dataForm.pekerjaan)
    dataFormBodyUpload.value.append('idStatusPekerjaan', parseInt(dataForm.idStatusPekerjaan))
    dataFormBodyUpload.value.append('namaInstitusi', dataForm.namaInstitusi)
    dataFormBodyUpload.value.append('idStatusInstitusi', parseInt(dataForm.idStatusInstitusi))
    dataFormBodyUpload.value.append('noHp', dataForm.noHp)
    dataFormBodyUpload.value.append('namaBank', dataForm.namaBank)
    dataFormBodyUpload.value.append('noRekening', dataForm.noRekening)
    dataFormBodyUpload.value.append('atasNamaBank', dataForm.atasNamaBank)
    dataFormBodyUpload.value.append('createdBy', userName.value)
    

    if(dataForm.fileTtd && (typeof dataForm.fileTtd != 'string') ){
        dataFormBodyUpload.value.append('file', dataForm.fileTtd)
    }

    // const isSubmit = await PengembangApi.addData(dataForm.id, dataFormBodyUpload.value, props.token);

  if (isSubmit) {
    Swal.fire({
      icon: 'success',
      title: 'Upload Tanda Tangan Berhasil',
      text: 'Anda bisa mengakses menu Pengembang.',
      timer: 2000,
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      // navigateTo('/adminpanel/pengembangan-rps/rps', { replace: true })
      window.location.href = '/adminpanel/pengembangan-rps/rps'
    })
  }
  else {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: response?.errors[0].message ?? 'Gagal Upload Tanda Tangan',
    })
  }
}

// upload
const handleLampiran = (event: Event) => {
  const [_file] = (event.target as HTMLInputElement).files as FileList
  dataFormPengembang.value.fileTtd = _file

  const selectedFile = _file;
  if (selectedFile) {
    // Buat URL untuk preview
    dataFormPengembang.value.urlFile = URL.createObjectURL(selectedFile);
  }
}
</script>

<template>
  <UModal
    v-model="open"
    :ui="{
      width: 'w-full sm:max-w-lg',
    }"
    prevent-close
  >
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">
            Form Upload Tanda Tangan
          </h3>
          <UButton
            color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
            @click=" emit('close')"
          />
        </div>
      </template>

      <p>
        <b>Lengkapi data Tanda Tangan</b><br>
        Sebelum mengakses aplikasi diwajibkan mmengupload file Tanda Tangan Terlebih dahulu
      </p>
      <br>
      <UDivider orientation="horizontal" />
      <br>
      <UForm :schema="schema" :state="dataFormPengembang" class="space-y-4" @submit="onSubmitPengembang">

        <UFormGroup label="File Tanda Tangan" name="FileTtd">
          <div class="relative">
            <UInput  placeholder="Lampiran" accept=".jpg,.jpeg,.png" type="file" class="[&>input]:cursor-pointer" @change="handleLampiran" />
          </div>
        </UFormGroup>
        
        <UBadge
          icon="i-mdi-information-slab-circle-outline"
          size="sm"
          color="gray"
          variant="solid"
          label="File harus berformat PNG dengan ukuran tidak melebihi 5MB."
          :trailing="false"
        /> 
        
        <div v-if="dataFormPengembang.urlFile">
          <h4>Preview:</h4>
          <img :src="dataFormPengembang.urlFile" alt="Preview" class="!w-[250px] !h-[250px] object-contain rounded" />
        </div>

        <div class="text-right !mt-8">
          <UButton type="submit" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-4">
            <UnoIcon class="i-mdi-content-save" /> Simpan
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
