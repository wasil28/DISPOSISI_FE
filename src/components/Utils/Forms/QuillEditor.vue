<template>
  <div>
    <div ref="editor" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import 'quill/dist/quill.snow.css'

const editor = ref<HTMLElement | null>(null)
const quillInstance = ref<any>(null)
const { $quill } = useNuxtApp()

// Handler arrow function (tidak pakai "this")
const imageHandler = () => {
  const input = document.createElement('input')
  input.setAttribute('type', 'file')
  input.setAttribute('accept', 'image/*')
  input.click()

  input.onchange = async () => {
    const file = input.files?.[0]
    if (file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64Image = e.target?.result
    if (!quillInstance.value) return

    // if (!quillInstance.value) return;
    quillInstance.value.focus();

    // Paksa pembuatan selection jika belum ada
    if (!quillInstance.value.getSelection()) {
      quillInstance.value.setSelection(quillInstance.value.getLength(), 0);
    }

    const range = quillInstance.value.getSelection(true);
    if (range) {
      quillInstance.value.insertEmbed(range.index, 'image', base64Image);
    } else {
      // Fallback jika masih null, misalnya insert di akhir konten
      quillInstance.value.insertEmbed(quillInstance.value.getLength(), 'image', base64Image);
    }


    // Pastikan editor difokuskan
    // quillInstance.value.focus()

    // Tambahkan delay untuk memberi waktu agar Quill update selection
    // console.log(quillInstance.value.getSelection(),'quillInstance.value.getSelection()')
    // quillInstance.value.focus();
    // if (!quillInstance.value) {
    //   console.log('masuk sini');
    //   // quillInstance.value.setSelection(quillInstance.value.getLength(), 0);
    // }
    // quillInstance.value.format('link', false)
    // setTimeout(() => {
    //   if (!quillInstance.value?.getSelection()) {
    //     console.log('masuk sini');
    //     quillInstance.value.setSelection(quillInstance.value.getLength(), 0);
    //   }
    //   const range = quillInstance.value.getSelection(true);
    //   console.log(range, 'range');
    //   quillInstance.value.insertEmbed(range.index, 'image', base64Image);
    // }, 500);
    // setTimeout(() => {
    //   // Jika belum ada selection, tetapkan ke posisi akhir konten
    //   if (!quillInstance.value.getSelection()) {
    //     quillInstance.value.setSelection(quillInstance.value.getLength(), 0)
    //   }
    //   const range = quillInstance.value.getSelection(true)
    //   if (!range) {
    //     // fallback: sisipkan di akhir konten
    //     quillInstance.value.insertEmbed(quillInstance.value.getLength(), 'image', base64Image)
    //   } else {
    //     quillInstance.value.insertEmbed(range.index, 'image', base64Image)
    //   }
    // }, 300)
  }
  reader.readAsDataURL(file)
}


  }
}

onMounted(() => {
  if (editor.value) {
    quillInstance.value = new $quill(editor.value, {
      theme: 'snow',
      modules: {
        toolbar: {
          container: [
            ['bold', 'italic', 'underline'],
            ['image']
          ],
          // Pakai arrow function di "handlers"
          handlers: {
            image: imageHandler
          }
        }
      }
    })
  }
})
</script>

<style scoped>
.editor {
  height: 300px;
}
</style>
