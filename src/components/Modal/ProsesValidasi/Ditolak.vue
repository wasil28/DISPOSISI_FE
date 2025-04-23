<script lang="ts" setup>
import imageDissaprove from '~/public/assets/images/illustration/registrasi-mbkm-ditolak.png'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },
  message: {
    type: String,
    required: false,
  },
})

const emit = defineEmits(['update:model-value', 'close'])

const open = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
  },
})
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
      <UButton
        color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="absolute right-4 top-4"
        @click="open = false"
      />
      <div class="flex flex-col items-center gap-y-4">
        <img class=" w-5/12" :src="imageDissaprove" alt="Illustration Validasi Ditolak">
        <h1 class="font-bold text-center">
          Proses registrasi MBKM Anda <span class="text-ut-actionRed">Ditolak</span>
        </h1>
        <p class="text-sm self-start">
          Berikut ini catatan penolakan validasi:
        </p>
        <p class="text-sm self-start" v-html="message ?? '-'" />
      </div>
      <!-- <UButton
        icon="i-mdi-chevron-left"
        class="inline-flex mt-4 bg-ut-textGray hover:bg-ut-textDarkGray dark:bg-ut-textGray dark:text-tableBody dark:hover:bg-ut-textDarkGray text-xs justify-center pr-3 pl-2 py-2"
        to="/portal/mahasiswa"
      >
        Kembali
      </UButton> -->
    </UCard>
  </UModal>
</template>
