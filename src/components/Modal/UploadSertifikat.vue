<script lang="ts" setup>
import Swal from 'sweetalert2'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },
})

const emit = defineEmits(['update:model-value', 'close'])

const open = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
  },
})

const dataFormUploadSertifikat = reactive({
  sertifikat: '',
  nilai: '',
})

const handleUploadSertifikat = (event: Event) => {
  const [_file] = (event.target as HTMLInputElement).files as FileList
  dataFormUploadSertifikat.sertifikat = _file
}

const handleUploadNilai = (event: Event) => {
  const [_file] = (event.target as HTMLInputElement).files as FileList
  dataFormUploadSertifikat.nilai = _file
}

const onSubmitUbahPassword = () => {
  emit('close')
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
            Upload Sertifikat
          </h3>
          <UButton
            color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
            @click="emit('close')"
          />
        </div>
      </template>

      <UForm :state="dataFormUploadSertifikat" class="space-y-4" @submit="onSubmitUbahPassword">
        <div class="space-y-4">
          <UFormGroup required label="Sertifikat Program MBKM" name="sertifikat">
            <span class="border-2 border-ut-primaryBlue text-ut-primaryBlue rounded-md px-4 py-2 text-xs inline-flex items-center gap-x-1.5">
              <UnoIcon class="i-mdi-upload" />
              Upload
            </span>
            <UInput accept="application/pdf" type="file" class="opacity-0 absolute top-0 [&>input]:cursor-pointer" @change="handleUploadSertifikat" />
            <span class="text-xs text-ut-textDarkGray ml-2.5">{{ dataFormUploadSertifikat.sertifikat.name }}</span>
          </UFormGroup>

          <UFormGroup required label="Nilai Program MBKM" name="nilai">
            <span class="border-2 border-ut-primaryBlue text-ut-primaryBlue rounded-md px-4 py-2 text-xs inline-flex items-center gap-x-1.5">
              <UnoIcon class="i-mdi-upload" />
              Upload
            </span>
            <UInput accept="application/pdf" type="file" class="opacity-0 absolute top-0 [&>input]:cursor-pointer" @change="handleUploadNilai" />
            <span class="text-xs text-ut-textDarkGray ml-2.5">{{ dataFormUploadSertifikat.nilai.name }}</span>
          </UFormGroup>
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
