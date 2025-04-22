<template>
  <div>
    <h1>Integrasi CKEditor 4 Lokal di Nuxt 3</h1>
    <Ckeditor v-model="editorContent" />
  </div>
  <div>
    hasil editor: <br />
    {{ editorContent }}
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Ckeditor from '~/components/Utils/Forms/CKEditor2.vue'

const editorContent = ref('<p>Isi awal editor</p>');
</script>
