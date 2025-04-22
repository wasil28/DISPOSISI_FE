<script lang="ts" setup>
import Editor from '@tinymce/tinymce-vue'

const props = defineProps({
  modelValue: String,
  mode: String,
  height: {
    type: String,
    required: false,
  },
})
defineEmits<{
  (event: 'update:modelValue'): void
}>()

const TinyMce = ref()

onMounted(() => {
  TinyMce.value = Editor
})
</script>

<template>
  <div>
    <div class="text-[13px]" @click="(e) => $emit('show')">
      <div
        class="flex-1 relative"
        :class="`height-${height}`"
      >
        <TinyMce
          api-key="8wi9fz6pimsiw8d1ackrrzlvxh5rpa41o6urdsmifddlirzn"
          :initial-value="modelValue"
          :init="{
            plugins: props.mode === 'minimal' ? 'code' : 'lists link image table code help wordcount',
            setup: (editor: any) => {
              editor.on('input change undo redo', () => {
                $emit('update:modelValue', editor.getContent())
              });
            },
          }"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.height-xl .tox.tox-tinymce {
  height: 400px !important;
}
.height-lg .tox.tox-tinymce {
  height: 300px !important;
}
.height-sm .tox.tox-tinymce {
  height: 200px !important;
}
</style>
