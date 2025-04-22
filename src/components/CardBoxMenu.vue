<script>
import Swal from 'sweetalert2';

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
      type: Number,
      default: 0,
    },
  },
  methods: {
    navigate() {
      if (this.route === '#' || this.route === '') {
        Swal.fire({
          icon: 'warning',
          title: 'Menu belum tersedia',
          text: 'Fitur ini masih dalam pengembangan!',
          confirmButtonText: 'OK',
        });
      } else {
        this.$router.push(this.route);
      }
    },
  },
};
</script>

<template>
  <div class="item-card" @click="navigate">
    <div class="icon">
      <i :class="icon" />
    </div>
    <div class="text">
      <!-- Hanya tampilkan nomor jika number tidak kosong -->
      <h3>{{ number ? number + '. ' : '' }}{{ title }}</h3>
      <p>{{ content }}</p>
    </div>
  </div>
</template>

<style scoped>
.item-card {
  text-align: center;
  width: 100%;
  display: block;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
