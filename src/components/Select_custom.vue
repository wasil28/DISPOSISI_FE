<script lang="ts" setup>
const props = defineProps({
  title: String,
  name: String,
  helpShow: {
    type: Boolean,
    default: false,
  },
  isRequired: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  hideTitle: {
    default: false,
    type: Boolean,
  },
  hideHelper: {
    default: false,
    type: Boolean,
  },
  helper: {
    type: String,
  },
  style: {
    type: String,
  },
  options: Array<{ name: string; value: Number | String }>,
  modelValue: [String, Number],
})

defineEmits<{
  (event: 'update:modelValue'): void
  (event: 'show'): void
  (event: 'onChange'): void
}>()
const isRequired = (value: any) => {
  if (!props.isRequired)
    return true
  if (value || value === '0')
    return true

  return 'Kolom ini wajib diisi!'
}
</script>

<template>
  <div class="flex md:flex-row flex-col md:gap-5 justify-end text-[13px]">
    <label v-if="!hideTitle" class="md:text-end md:w-1/6 w-full text-start  break-normal  capitalize">{{ title }}</label>
    <VField v-slot="{ field, meta }" class="flex-1 relative" as="div" :rules="isRequired" :name="name ? name : title" :model-value="modelValue" :validate-on-model-update="true" @click="$emit('show')">
      <!-- :disabled="disabled" -->
      <select
        :value="modelValue"
        :disabled="disabled"
        v-bind="field"
        :class="{
          ' border-gray-400 focus:border-primaryHover': meta.valid && meta.touched,
          'border-breadcrumb focus:border-breadcrumb': !meta.valid && meta.touched,
        }"
        class="w-full border-0 border-b border-gray-300 dark:border-gray-600 dark:bg-dark text-[13px] text-gray-900 hover:border-gray-800 focus:border-primary focus:ring-0" @click="$emit('show')"
        @input="$emit('update:modelValue', ($event.target! as HTMLInputElement).value)"
        @change="$emit('onChange')"
      >
        <option v-if="title" selected disabled>
          -- Pilih {{ title }} --
        </option>
        <option v-for="option in options" :key="option.name" class="capitalize text-black" :value="option.value" :style="option.style">
          {{ option.name }}
        </option>
      </select>
      <VErrorMessage :name="name ? name : title" as="div" class="absolute text-xs text-breadcrumb top-12" />
    </VField>
    <div v-if="!hideHelper" class="group relative" :class="helpShow ? 'visible' : 'invisible'">
      <UnoIcon class="i-mdi-info-circle !text-[#00bcd4] px-[7px] py-[1.5px] text-[13px] font-semibold mr-5" />
      <p class="group-hover:scale-100 scale-0 transition-all duration-150 absolute h-fit right-0 inset-y-0 w-max max-w-xs text-[10px] tracking-wider font-medium bg-black text-white max-h-fit p-2 rounded whitespace-normal">
        {{ helper }}
      </p>
    </div>
  </div>
</template>
