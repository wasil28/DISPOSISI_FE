<script lang="ts" setup>
import { z } from 'zod'
import Swal from 'sweetalert2'

const props = defineProps<{
  data?: any
}>()

const emit = defineEmits(['submitForm', 'goBack'])

const schema = z.object({
  scanKtp: z.any({
    required_error: 'Wajib diisi',
  }).refine(value => value !== undefined && value != null && value !== '', {
    message: 'Wajib diisi',
  }),
  foto: z.any({
    required_error: 'Wajib diisi',
  }).refine(value => value !== undefined && value != null && value !== '', {
    message: 'Wajib diisi',
  }),
})

const dataForm = reactive({
  scanKtp: '',
  foto: '',
})

const handleFileUploadscanKtp = (event: Event) => {
  const [_file] = (event.target as HTMLInputElement).files as FileList

  // Memeriksa tipe file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (!allowedTypes.includes(_file.type)) {
    Swal.fire({
      icon: 'error',
      title: 'File harus berupa gambar (.JPG, .JPEG, .PNG).',
      timer: 2000,
      showConfirmButton: false,
    })
    return
  }

  // Memeriksa ukuran file
  const maxSizeInBytes = 2 * 1024 * 1024 // 2MB dalam bytes
  if (_file.size > maxSizeInBytes) {
    Swal.fire({
      icon: 'error',
      title: 'File terlalu besar! Maksimal 2MB.',
      timer: 2000,
      showConfirmButton: false,
    })
    return
  }

  dataForm.scanKtp = _file
}
const handleFileUploadfoto = (event: Event) => {
  const [_file] = (event.target as HTMLInputElement).files as FileList

  // Memeriksa tipe file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (!allowedTypes.includes(_file.type)) {
    Swal.fire({
      icon: 'error',
      title: 'File harus berupa gambar (.JPG, .JPEG, .PNG).',
      timer: 2000,
      showConfirmButton: false,
    })
    return
  }

  // Memeriksa ukuran file
  const maxSizeInBytes = 2 * 1024 * 1024 // 2MB dalam bytes
  if (_file.size > maxSizeInBytes) {
    Swal.fire({
      icon: 'error',
      title: 'File terlalu besar! Maksimal 2MB.',
      timer: 2000,
      showConfirmButton: false,
    })
    return
  }

  dataForm.foto = _file
}

const submitForm = () => {
  console.log(props.data)
  const body = new FormData()

  if (dataForm.scanKtp)
    body.append('file_1', dataForm.scanKtp, dataForm.scanKtp.name)

  if (dataForm.foto)
    body.append('file_2', dataForm.foto, dataForm.foto.name)

  body.append('id_mhs', props.data.idMhs)

  emit('submitForm', body)
}

const goBack = () => {
  emit('goBack')
}
</script>

<template>
  <UForm :schema="schema" :state="dataForm" class="space-y-4 no-transparent" @submit="submitForm">
    <UFormGroup required label="Scan KTP" name="scanKtp">
      <span class="border-2 border-ut-primaryBlue text-ut-primaryBlue rounded-md px-4 py-2 text-xs inline-flex items-center gap-x-1.5">
        <UnoIcon class="i-mdi-upload" />
        Unggah
      </span>
      <UInput accept=".jpg,.jpeg,.png" type="file" class="opacity-0 absolute top-0 [&>input]:cursor-pointer" @change="handleFileUploadscanKtp" />
      <span class="text-xs text-ut-textDarkGray ml-2.5">{{ dataForm.scanKtp.name }}</span>
      <small class="text-xs text-ut-textGray block mt-1">Berkas dalam format gambar (.JPG, .JPEG, .PNG) dengan ukuran berkas maksimal 2 MB</small>
    </UFormGroup>
    <UFormGroup required label="Pas Foto 4x6" name="foto">
      <span class="border-2 border-ut-primaryBlue text-ut-primaryBlue rounded-md px-4 py-2 text-xs inline-flex items-center gap-x-1.5">
        <UnoIcon class="i-mdi-upload" />
        Unggah
      </span>
      <UInput accept=".jpg,.jpeg,.png" type="file" class="opacity-0 absolute top-0 [&>input]:cursor-pointer" @change="handleFileUploadfoto" />
      <span class="text-xs text-ut-textDarkGray ml-2.5">{{ dataForm.foto.name }}</span>
      <small class="text-xs text-ut-textGray block mt-1">Berkas dalam format gambar (.JPG, .JPEG, .PNG) dengan ukuran berkas maksimal 2 MB</small>
    </UFormGroup>
    <div class="flex justify-end gap-x-2.5 !mt-8">
      <UButton type="button" class="bg-transparent border-2 border-ut-primaryBlue text-ut-primaryBlue hover:text-ut-textBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-6 py-3" @click="goBack">
        <UnoIcon class="i-mdi-arrow-left text-lg" /> Kembali
      </UButton>
      <UButton type="submit" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-6 py-3">
        <UnoIcon class="i-mdi-content-save text-lg" /> Submit Data Registrasi
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
