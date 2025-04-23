<template>
  <div>
    <DynamicTable
      title="Daftar Bahan Ajar"
      :columns="columns"
      :data="allData"
      :totalItems="totalItems"
      :pageSize="pageSize"
      :currentPage="currentPage"
      @update:currentPage="currentPage = $event"  
      @search="onSearch" 
      @sort="handleSort"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import DynamicTable from '@/components/TableTabulator.vue'; // Ganti dengan path ke komponen tabel dinamis
import { useLazyAsyncData } from 'nuxt/app'; // Import dari Nuxt
// import { BahanAjarApi } from '~/apis'; // Import API Anda
import type { sorter } from '~/types/tableTypes';
const { session } = await useSession()

const token = session.value?.token


const allData = ref<Record<string, any>[]>([]); // Menyimpan semua data
const totalItems = ref(0); // Total item dari API
const pageSize = ref(10); // Ukuran halaman
const currentPage = ref(1); // Halaman saat ini
const searchQuery = ref(""); // Query pencarian
const sort = ref<sorter>({ column: 'kodeBahanAjar', direction: 'asc' })

function paramLookup(column, dir){
  console.log('Sorting:', column.getField(), dir?.toUpperCase());
  const dirValue = dir?.toUpperCase()||null;
  const field = column.getField()||null;
  if(dirValue && field){
    sort.value = { column: field, direction: dirValue };
  }else{
    sort.value = { column: 'kodeBahanAjar', direction: 'asc' };
  }
  return {param1:"green"};

}

const columns = ref([
  { title: "Kode Bahan Ajar", field: "kodeBahanAjar", width: 150, sort: true, sorterParams: paramLookup },
  { title: "Nama Bahan Ajar", field: "namaBahanAjar", width: 150, sort: false },
  { title: "ID Program Studi", field: "idProgramStudi", width: 150, sort: true },
  { title: "Kode Konversi", field: "kodeKonversi", width: 150,sort: false },
  { title: "Custom Field", field: "customField", width: 150,sort: false },
  {
    title: "Total Items",
    field: "id",
    width: 150,
    bottomCalc: "sum", // Menggunakan fungsi bawaan untuk menjumlahkan total
    footer: "Total Items", // Menampilkan label di footer
  },
]);

// Menggunakan watch untuk fetch data
watch([currentPage, searchQuery], async () => {
  await fetchData(); // Ambil data baru setiap kali currentPage atau searchQuery berubah
});


// Fungsi untuk mengambil data dari API
const fetchData = async () => {
  // try {
  //   const result = await BahanAjarApi.getAllData({
  //     start: currentPage.value,
  //     offset: pageSize.value,
  //     order: sort.value.direction.toUpperCase(),
  //     orderBy: sort.value.column,
  //     search: searchQuery.value,
  //     filter: {},
  //   }, token);
  //   // Pastikan untuk memperbarui allData dan totalItems
  //   allData.value = result?.data||[]; // Update allData
  //   totalItems.value = result?.totalItems||0; // Update totalItems

  //   return { data: result?.data||[], totalItems: result?.totalItems||0 }; // Kembalikan hasil
  // } catch (error) {
  //   console.error("Error fetching data:", error);
  //   return { data: [], totalItems: 0 }; // Kembalikan nilai default jika ada error
  // }
};


// Fungsi untuk menangani pencarian
const onSearch = (query) => {
  searchQuery.value = query; // Set query pencarian
  currentPage.value = 1; // Reset halaman saat melakukan pencarian
};
const handleSort = (column, dir) => {
  console.log('Sorting:', column, dir);
  // sortColumn.value = column;
  // sortDirection.value = dir;
  // currentPage.value = 1; // Reset ke halaman pertama setelah sorting
};

// Menggunakan watch untuk memantau perubahan pada currentPage dan searchQuery
// watch([currentPage, searchQuery], async () => {
//   console.log('Fetching data:', currentPage.value, searchQuery.value);
//   await fetchData(); // Ambil data baru setiap kali currentPage atau searchQuery berubah
// });

// Mengambil data saat komponen dimuat
onMounted(() => {
  fetchData(); // Mengambil data saat komponen dimuat
});
</script>

<style scoped>
</style>
