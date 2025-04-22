<template>
    <ClientOnly>
      <Editor
        v-model="localContent"
        api-key="xf5tlurbems37xprze246ljnfk1za9cg4w1dxwtmrwq9l4hk"
        :init="editorConfig"
      />
    </ClientOnly>
  </template>
  
  <script setup>
  import { ref, watch, computed, defineProps, defineEmits } from 'vue';
  import Editor from '@tinymce/tinymce-vue';
  
  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: () => ({})
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  const localContent = ref(props.modelValue);
  
  watch(localContent, (value) => {
    emit('update:modelValue', value);
  });
  
  watch(() => props.modelValue, (newVal) => {
    if (newVal !== localContent.value) {
      localContent.value = newVal;
    }
  });
  
  const defaultConfig = {
    toolbar_mode: 'sliding',
    plugins: [
      'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'searchreplace', 'table', 'visualblocks', 'wordcount'
    ],
    toolbar:
      'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
    tinycomments_mode: 'embedded',
    tinycomments_author: 'Author name',
    mergetags_list: [
      { value: 'First.Name', title: 'First Name' },
      { value: 'Email', title: 'Email' },
    ],
    // Fungsi upload gambar untuk mengonversi gambar menjadi base64
    images_upload_handler: (blobInfo, success, failure) => {
      const reader = new FileReader();
      reader.readAsDataURL(blobInfo.blob());
      reader.onload = () => {
        const base64 = reader.result; // base64 string
        success(base64); // Kembalikan string base64 ke TinyMCE
      };
      reader.onerror = (error) => {
        failure('Gagal membaca file: ' + error.message);
      };
    },
    // Konfigurasi AI dan fitur lainnya (opsional)
    ai_request: (request, respondWith) =>
      respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
  };
  
  const editorConfig = computed(() => {
    return { ...defaultConfig, ...props.config };
  });
  </script>
  