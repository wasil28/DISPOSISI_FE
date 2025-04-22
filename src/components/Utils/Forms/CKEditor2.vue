<template>
  <div>
    <!-- Gunakan ref untuk memastikan kita mendapatkan elemen textarea -->
    <textarea ref="editorRef" name="editor"></textarea>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const editorRef = ref(null)

// Terima nilai awal dan properti ukuran dari parent
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '300px'
  },
  width: {
    type: String,
    default: '100%'
  }
})

const emit = defineEmits(['update:modelValue'])

onMounted(() => {
  // Pastikan editorRef.value sudah tersedia
  if (editorRef.value && typeof CKEDITOR !== 'undefined') {
    const editorInstance = CKEDITOR.replace(editorRef.value, {
      extraPlugins: 'uploadimage,base64image',
      filebrowserImageUploadUrl: '/dummy-upload', // URL dummy untuk memicu UI upload
      disableUpdateNotification: true,
      removePlugins: 'update',
      height: props.height,
      width: props.width
    });

    // Set nilai awal editor
    editorInstance.setData(props.modelValue);

    // Saat instance siap, hapus notifikasi update dan pasang listener perubahan
    editorInstance.on('instanceReady', (evt) => {
      const updateNotice = evt.editor.container.findOne('.cke_update_notification');
      if (updateNotice) {
        updateNotice.remove();
      }
      // Tangkap perubahan isi editor
      editorInstance.on('change', () => {
        const data = editorInstance.getData();
        emit('update:modelValue', data);
      });
    });
    
    // Intersepsi event upload untuk mengonversi file ke base64
    editorInstance.on('fileUploadRequest', (evt) => {
      const fileLoader = evt.data.fileLoader;
      const file = fileLoader.file;
      if (!file) return;
  
      // Validasi: pastikan file merupakan gambar
      if (!file.type.startsWith('image/')) {
        alert('Hanya file gambar yang diperbolehkan!');
        evt.cancel();
        return;
      }
      
      evt.cancel(); // Batalkan request upload default
  
      const reader = new FileReader();
      reader.onload = function(e) {
        fileLoader.url = e.target.result;
        fileLoader.responseData = {
          uploaded: 1,
          url: e.target.result
        };
        fileLoader.fire('uploaded');
      };
  
      reader.readAsDataURL(file);
    });
  
    // Hentikan penanganan response default agar tidak terjadi error 404
    editorInstance.on('fileUploadResponse', (evt) => {
      evt.stop();
    });
  } else {
    console.error('Textarea untuk CKEditor tidak ditemukan atau CKEDITOR belum terload.');
  }
});

// Watch agar jika modelValue berubah dari luar, editor ikut terupdate
watch(() => props.modelValue, (newVal) => {
  if (typeof CKEDITOR !== 'undefined') {
    const instance = CKEDITOR.instances[editorRef.value.id];
    if (instance && instance.getData() !== newVal) {
      instance.setData(newVal);
    }
  }
});
</script>

<style>
.cke_notifications_area,
.cke_notification_warning {
  display: none !important;
}
</style>
