<script>
import Swal from 'sweetalert2'

export default {
  name: 'ItemCard',
  props: {
    icon: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    route: {
      type: String,
      required: true,
    },
    number: {
      type: [Number, String], // Bisa menerima Number atau String
      default: '', // Default adalah string kosong
    },
    idKurikulumProdi: {
      type: [Number, String], // Bisa menerima Number atau String,
      default: 0,
    },
  },
  methods: {
    navigate() {
      // console.log(this.props)
      // console.log('iskuri',this.idKurikulumProdi)
      if(this.idKurikulumProdi != 0){
        if (this.route === '#' || this.route === '') {
          Swal.fire({
            icon: 'warning',
            title: 'Menu belum tersedia',
            text: 'Fitur ini masih dalam pengembangan!',
            confirmButtonText: 'OK',
          })
        }
        else {
          this.$router.push(this.route)
        }
      }else{
        Swal.fire({
          icon: 'warning',
          title: 'Pilih Kurikulum',
          text: 'Sebelum mengakses menu diharapkan untuk memilih Kurikulum yang akan dikembangkan!',
          confirmButtonText: 'OK',
        })
      }
    },
  },
}
</script>

<template>
  <div class="item-card" @click="navigate">
    <div class="text h-full flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-x-2">
          <div class="bg-blue-100 flex justify-center items-center font-bold w-8 h-8 rounded-full">
            {{ number ?? '' }}
          </div>
          <!-- Hanya tampilkan nomor jika number tidak kosong -->
          <h3>{{ title }}</h3>
        </div>
        <UTooltip :text="content ? content : 'Deskripsi tidak tersedia'" :ui="{ container: 'z-50', base: 'whitespace-normal overflow-auto h-fit' }">
          <p class="text-xs pl-2 mt-1">
            {{ content ? useTextLimiter(content, 10) : '-' }}
          </p>
        </UTooltip>
      </div>
      <UButton
        class="mt-1.5 mb-1 ml-2 w-fit block bg-ut-bgBlue-hover text-bold text-white hover:bg-ut-bgBlue" variant="solid" size="xs"
        @click="navigate"
      >
        Kelola
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.item-card {
  text-align: left;
  width: 100%;
  display: block;
  /* border: 1px solid #ccc; */
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0px rgba(0, 0, 0, 0.25);
  transition: border-color 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.item-card:hover {
  border-color: #007bff;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.icon {
  font-size: 36px;
  color: #1748A1;
}

.icon > i {
  height: 1em;
}

.text {
  width: 100%;
}

.text h3 {
  margin: 0;
  font-size: 14px;
  color: #1748A1;
  font-weight: bold;
}

.text p {
  margin: 4px 0 0;
  color: #666;
}
</style>
