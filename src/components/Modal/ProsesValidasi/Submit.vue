<script lang="ts" setup>
import imageDissaprove from '~/public/assets/images/illustration/registrasi-mbkm-proses-validasi.png'

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
        @click="emit('close')"
      />
      <div class="flex flex-col items-center gap-y-4">
        <img class=" w-7/12" :src="imageDissaprove" alt="Illustration Proses Validasi">
        <h1 class="text-sm font-bold text-center">
          Data Registrasi Anda masih dalam tahap proses validasi.
        </h1>
      </div>
    </UCard>
  </UModal>
</template>
