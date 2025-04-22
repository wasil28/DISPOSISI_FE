<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: String,
});

const emit = defineEmits(['update:modelValue']);

const editorContent = ref(props.modelValue);
let editorInstance: any = null;

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://cdn.ckeditor.com/4.22.1/full-all/ckeditor.js'; // Versi 4.22.1
  script.onload = () => {
    editorInstance = CKEDITOR.replace('editor', {
      startupNotifications: false, // Nonaktifkan notifikasi keamanan
      filebrowserUploadUrl: '/api/upload', // Endpoint untuk upload gambar
      toolbar: [
        { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike'] },
        { name: 'paragraph', items: ['NumberedList', 'BulletedList', 'Blockquote'] },
        { name: 'links', items: ['Link', 'Unlink'] },
        { name: 'insert', items: ['Image', 'Table'] },
        { name: 'tools', items: ['Maximize'] },
        { name: 'document', items: ['Source'] },
      ],
      height: 300,
      on: {
        change: () => {
          const content = editorInstance.getData();
          editorContent.value = content;
          emit('update:modelValue', content);
        },
      },
    });

    // Set nilai awal
    if (props.modelValue) {
      editorInstance.setData(props.modelValue);
    }
  };
  document.head.appendChild(script);
});
onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.destroy();
    editorInstance = null;
  }
});
</script>

<template>
  <div>
    <textarea id="editor"></textarea>
  </div>
</template>

<style scoped>
#editor {
  width: 100%;
  height: 300px;
  border: 1px solid #ccc;
  padding: 10px;
}
</style>