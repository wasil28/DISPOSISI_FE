<script lang="ts" setup>
import { ref, onMounted, computed, defineProps, watch, toRefs, defineEmits } from 'vue';
import "tabulator-tables/dist/css/tabulator.min.css";
import { TabulatorFull as Tabulator, type ColumnDefinition } from "tabulator-tables";
import type { string } from 'zod';

const isLoading = ref(true) // Tambahkan state loading

const props = withDefaults(defineProps<{
  title?: string;
  columns?: ColumnDefinition[];
  data?: Record<string, any>[]; // Data dari luar
  totalItems?: number; // Total item
  pageSize?: number; // Ukuran halaman
  currentPage?: number; // Halaman saat ini
  footer?: boolean;
  remoteSearch?: boolean;
  fitLayout?: string;
  height?: string;
}>(), {
  title: '',
  columns: () => [] as ColumnDefinition[],
  data: () => [],
  totalItems: 0,
  pageSize: 10,
  currentPage: 1,
  footer: false,
  remoteSearch: false,
  fitLayout: "fitDataStretch", // Nilai default
  height: '550px',
});

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void; // Emit event untuk mengubah halaman
  (e: 'search', query: string): void; // Emit event untuk pencarian
  (e: 'sort', column: string, dir: string): void; // Emit event untuk sorting
  (event: 'cellClick', field: string, rowData: any): void;
}>();

const { data, totalItems, pageSize } = toRefs(props);
const table = ref(null); // Referensi ke elemen tabel
const tabulator = ref<Tabulator | null>(null); // Variabel untuk menyimpan tabel
const searchQuery = ref(""); // Variabel untuk menyimpan query pencarian

const totalPages = computed(() => {
  return Math.ceil(totalItems.value / pageSize.value); // Menghitung total halaman
});

// Mengambil semua data yang ditampilkan
const displayedData = computed(() => {
  return data.value; // Ambil semua data dari API jika remote search
});

// Mengatur tabel ketika komponen dimuat
onMounted(() => {
  isLoading.value = true
  // nextTick()
  if (!table.value)
    return // Pastikan table sudah ada

  tabulator.value = new Tabulator(table.value, {
    data: displayedData.value || [], // Menghubungkan data ke tabel
    reactiveData: true, // Mengaktifkan reaktivitas data
    columns: props.columns || [], // Mendefinisikan kolom tabel dari props dan mengaktifkan sorting
    layout: props.fitLayout,
    height: props.height,
    placeholder: 'Data tidak ditemukan',
    loading: true,
  })

  // Set timount untuk menghilangkan loading
  setTimeout(() => {
    isLoading.value = false
  }, 500)

  // Set data awal setelah tabel diinisialisasi
  tabulator.value.setData(displayedData.value)

  // Menambahkan event listener untuk header kolom
  tabulator.value.on('headerMouseOver', (e, column) => {
    const tooltipText = column.getDefinition().tooltip
    if (tooltipText) {
      // Buat elemen tooltip
      const tooltipElement = document.createElement('div')
      tooltipElement.innerText = tooltipText
      tooltipElement.className = 'custom-tooltip' // Pastikan ada CSS untuk ini
      document.body.appendChild(tooltipElement)

      // Ambil posisi dari header kolom
      const headerElement = column.getElement() // Ambil elemen header kolom
      const rect = headerElement.getBoundingClientRect() // Mendapatkan posisi dan ukuran header kolom

      // Tempatkan tooltip di atas header kolom
      tooltipElement.style.top = `${rect.top + window.scrollY - tooltipElement.offsetHeight - 5}px`; // 5px di atas header
      tooltipElement.style.left = `${rect.left + window.scrollX}px` // Sesuaikan dengan posisi kiri header
      tooltipElement.classList.add('show') // Menampilkan tooltip
    }
  })

  // tabulator.value.on("headerMouseOut", function() {
  tabulator.value.on("headerMouseOut", function () {
    const tooltipElement = document.querySelector('.custom-tooltip');
    if (tooltipElement) {
      tooltipElement.remove(); // Hapus tooltip saat mouse keluar
    }
  });

  tabulator.value.on("cellClick", function (e, cell) {
    const rowData = cell.getRow().getData(); // Mendapatkan data baris
    const field = cell.getField(); // Mendapatkan nama field
    emit('cellClick', field, rowData); // Emit event dengan field dan rowData
  });

});

// Memperbarui tabel ketika data baru diterima
watch(data, () => {
  isLoading.value = true
  if (tabulator.value && displayedData.value.length > 0) {
    tabulator.value?.setData(displayedData.value); // Set data baru
    tabulator.value.redraw();
  }
  isLoading.value = false
});

// Memperbarui tabel ketika currentPage berubah
watch(() => props.currentPage, () => {
  isLoading.value = true
  tabulator.value?.setData(displayedData.value);
  tabulator.value?.redraw();
  isLoading.value = false
});

// Memperbarui kolom saat props.columns berubah
watch(() => props.columns, (newColumns) => {
  isLoading.value = true
  if (tabulator.value) {
    tabulator.value.setColumns(newColumns); // Memperbarui kolom Tabulator
    tabulator.value.redraw();
  }
  isLoading.value = false
});

// Memperbarui tabel ketika searchQuery berubah
watch(searchQuery, (newQuery) => {
  isLoading.value = true;
  if (props.remoteSearch) {
    // Jika pencarian remote, emit ke parent
    emitSearch();
  } else {
    // Pencarian lokal, filter data yang sudah ada
    tabulator.value?.setData(
      displayedData.value.filter((item) => {
        const searchInObject = (obj, query) => {
          return Object.values(obj).some(value => {
            if (typeof value === 'object' && value !== null) {
              return searchInObject(value, query);
            }
            return String(value).toLowerCase().includes(query.toLowerCase());
          });
        };

        return searchInObject(item, searchQuery.value);
      })
    );
    tabulator.value?.redraw();
  }
  isLoading.value = false;
});



// Fungsi untuk mengubah halaman ke halaman sebelumnya
const prevPage = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1); // Emit event ke parent
  }
};

// Fungsi untuk mengubah halaman ke halaman berikutnya
const nextPage = () => {
  if (props.currentPage < totalPages.value) {
    emit('update:currentPage', props.currentPage + 1); // Emit event ke parent
  }
};

// Emit pencarian
const emitSearch = () => {
  emit('search', searchQuery.value); // Emit event pencarian ke parent
};

// Fungsi untuk mengambil data dari tabel
const getTableData = async () => {
  return await tabulator.value?.getData();
};

// Ekspos metode menggunakan defineExpose
defineExpose({
  getTableData
});
</script>

<template>
  <div class="w-full relative">
    <div class="flex items-center justify-between gap-3 px-4 py-3">
      <div class="flex space-x-2">
      </div>
      <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass-20-solid" :placeholder="`Cari ...`"
        :ui="{ icon: { trailing: { pointer: '' } } }" @input="emitSearch">
        <template #trailing>
          <UButton v-show="searchQuery !== ''" color="gray" variant="link" icon="i-heroicons-x-mark-20-solid"
            :padded="false" @click="searchQuery = '';" />
        </template>
      </UInput>
    </div>

    <!-- Tabel -->
    <div v-show="!isLoading" ref="table" />

    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-x-0 bottom-0 bg-white bg-opacity-50 flex items-center justify-center z-10"
    >
      <div class="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500" />
      <p class="ml-4 text-blue-500 font-semibold">
        Loading data...
      </p>
    </div>

    <div v-if="props.footer" class="flex justify-between mt-4">
      <button :disabled="currentPage === 1" @click="prevPage">Prev</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage >= totalPages" @click="nextPage">Next</button>
    </div>
  </div>
</template>


<style >
/* Spinner Loading */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite !important;
}

.relative {
  position: relative;
}

.tabulator .tabulator-header {
  background-color: #2196f3;
  color: white;
  font-weight: bold;
}

.tabulator .tabulator-cell {
  padding: 5px;
}

.tabulator-row-odd {
  background-color: #f9f9f9;
}

.tabulator-row-even {
  background-color: white;
}

.tabulator-row:hover {
 /* background-color: #e3f2fd; */
}

.tabulator-header .tabulator-col {
  background-color: #2196F3 !important;
}

.custom-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 5px;
  border-radius: 5px;
  z-index: 1000;
  pointer-events: none;
  transition: opacity 0.3s;
  opacity: 0;
}

.custom-tooltip.show {
  opacity: 1;
}
</style>