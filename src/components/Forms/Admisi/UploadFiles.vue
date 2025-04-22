<script lang="ts" setup>
import { z } from 'zod'
import Swal from 'sweetalert2'

const props = defineProps<{
  data?: any
}>()

const emit = defineEmits(['submitForm', 'goBack'])

const schema = z.object({
  passport: z.any({
    required_error: 'Required',
  }).refine((value: any) => value !== undefined && value != null && value !== '', {
    message: 'Required',
  }),
  photo: z.any({
    required_error: 'Required',
  }).refine((value: any) => value !== undefined && value != null && value !== '', {
    message: 'Required',
  }),
})

const dataForm = reactive({
  passport: '',
  photo: '',
})

const submitForm = () => {
  const body = new FormData()

  if (dataForm.photo)
    body.append('file_2', dataForm.photo, dataForm.photo.name)

  if (dataForm.passport)
    body.append('file_4', dataForm.passport, dataForm.passport.name)

  body.append('id_mhs', props.data.idMhs)

  emit('submitForm', body)
}

const goBack = () => {
  emit('goBack')
}

const handleFileUploadPassport = (event: Event) => {
  const [_file] = (event.target as HTMLInputElement).files as FileList

  // Memeriksa tipe file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (!allowedTypes.includes(_file.type)) {
    Swal.fire({
      icon: 'error',
      title: 'File must in image format (.JPG, .JPEG, .PNG).',
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
      title: 'File is too big! Maximum file size is 2MB.',
      timer: 2000,
      showConfirmButton: false,
    })
    return
  }

  dataForm.passport = _file
}
const handleFileUploadPhoto = (event: Event) => {
  const [_file] = (event.target as HTMLInputElement).files as FileList

  // Memeriksa tipe file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (!allowedTypes.includes(_file.type)) {
    Swal.fire({
      icon: 'error',
      title: 'File must in image format (.JPG, .JPEG, .PNG).',
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
      title: 'File is too big! Maximum file size is 2MB.',
      timer: 2000,
      showConfirmButton: false,
    })
    return
  }

  dataForm.photo = _file
}
</script>

<template>
  <UForm :schema="schema" :state="dataForm" class="space-y-4" @submit="submitForm">
    <UFormGroup required label="Passport" name="passport">
      <span class="border-2 border-ut-primaryBlue text-ut-primaryBlue rounded-md px-4 py-2 text-xs inline-flex items-center gap-x-1.5">
        <UnoIcon class="i-mdi-upload" />
        Upload
      </span>
      <UInput accept=".jpg,.jpeg,.png" type="file" class="opacity-0 absolute top-0 [&>input]:cursor-pointer" @change="handleFileUploadPassport" />
      <span class="text-xs text-ut-textDarkGray ml-2.5">{{ dataForm.passport.name }}</span>
      <small class="text-xs text-ut-textGray block mt-1">File in image format (.JPG, .JPEG, .PNG) with a maximum file size of 2 MB</small>
    </UFormGroup>
    <UFormGroup required label="Pass Photo 4x6" name="photo">
      <span class="border-2 border-ut-primaryBlue text-ut-primaryBlue rounded-md px-4 py-2 text-xs inline-flex items-center gap-x-1.5">
        <UnoIcon class="i-mdi-upload" />
        Upload
      </span>
      <UInput accept=".jpg,.jpeg,.png" type="file" class="opacity-0 absolute top-0 [&>input]:cursor-pointer" @change="handleFileUploadPhoto" />
      <span class="text-xs text-ut-textDarkGray ml-2.5">{{ dataForm.photo.name }}</span>
      <small class="text-xs text-ut-textGray block mt-1">File in image format (.JPG, .JPEG, .PNG) with a maximum file size of 2 MB</small>
    </UFormGroup>
    <!-- <UFormGroup required label="Curriculum Vitae (CV)" name="cv">
      <span class="border-2 border-ut-primaryBlue text-ut-primaryBlue rounded-md px-4 py-2 text-xs inline-flex items-center gap-x-1.5">
        <UnoIcon class="i-mdi-upload" />
        Upload
      </span>
      <UInput accept=".pdf" type="file" class="opacity-0 absolute top-0 [&>input]:cursor-pointer" @change="handleFileUploadCv" />
      <span class="text-xs text-ut-textDarkGray ml-2.5">{{ dataForm.cv.name }}</span>
      <small class="text-xs text-ut-textGray block mt-1">File in PDF format with a maximum file size of 5 MB</small>
    </UFormGroup>
    <UFormGroup required label="Letter of Commitment" name="suratPernyataan">
      <span class="border-2 border-ut-primaryBlue text-ut-primaryBlue rounded-md px-4 py-2 text-xs inline-flex items-center gap-x-1.5">
        <UnoIcon class="i-mdi-upload" />
        Upload
      </span>
      <UInput accept=".pdf" type="file" class="opacity-0 absolute top-0 [&>input]:cursor-pointer" @change="handleFileUploadSuratPernyataan" />
      <span class="text-xs text-ut-textDarkGray ml-2.5">{{ dataFormKhusus.suratPernyataan.name }}</span>
      <small class="text-xs text-ut-textGray block mt-1">File in PDF format with a maximum file size of 5 MB</small>
    </UFormGroup>
    <UFormGroup required label="Work Program" name="programKerja">
      <span class="border-2 border-ut-primaryBlue text-ut-primaryBlue rounded-md px-4 py-2 text-xs inline-flex items-center gap-x-1.5">
        <UnoIcon class="i-mdi-upload" />
        Upload
      </span>
      <UInput accept=".pdf" type="file" class="opacity-0 absolute top-0 [&>input]:cursor-pointer" @change="handleFileUploadProgramKerja" />
      <span class="text-xs text-ut-textDarkGray ml-2.5">{{ dataFormKhusus.programKerja.name }}</span>
      <small class="text-xs text-ut-textGray block mt-1">File in PDF format with a maximum file size of 5 MB</small>
    </UFormGroup>
    <UFormGroup required label="Proposal" name="programKerja">
      <span class="border-2 border-ut-primaryBlue text-ut-primaryBlue rounded-md px-4 py-2 text-xs inline-flex items-center gap-x-1.5">
        <UnoIcon class="i-mdi-upload" />
        Upload
      </span>
      <UInput accept=".pdf" type="file" class="opacity-0 absolute top-0 [&>input]:cursor-pointer" @change="handleFileUploadProposal" />
      <span class="text-xs text-ut-textDarkGray ml-2.5">{{ dataFormKhusus.proposal.name }}</span>
      <small class="text-xs text-ut-textGray block mt-1">File in PDF format with a maximum file size of 5 MB</small>
    </UFormGroup> -->
    <div class="flex justify-end gap-x-2.5 !mt-8">
      <UButton type="button" class="bg-transparent border-2 border-ut-primaryBlue text-ut-primaryBlue hover:bg-ut-asideBlue hover:text-white dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-6 py-3" @click="goBack">
        <UnoIcon class="i-mdi-arrow-left text-lg" /> Previous
      </UButton>
      <UButton type="submit" class="bg-ut-primaryBlue hover:bg-ut-asideBlue dark:bg-ut-primaryBlue dark:text-white dark:hover:bg-ut-asideBlue px-6 py-3">
        <UnoIcon class="i-mdi-content-save text-lg" /> Submit Registration Data
      </UButton>
    </div>
  </UForm>
</template>
