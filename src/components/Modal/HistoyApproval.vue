<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  dataView: Object,
  responseHist: Object,
  pending: Boolean,
  token: String,
  urlApi: String,
  modalTitle: String,
  // columnsHistory: Array
});

const columnsHistory = [
  {
    key: 'createdAt',
    label: 'Tanggal',
    class: 'text-center !w-[80px] whitespace-normal',
  },
  {
    key: 'verifikasi',
    label: 'Posisi',
    class: '!w-[80px] whitespace-normal',
  },
  {
    key: 'createdBy',
    label: 'Nama',
    class: '!w-[80px] whitespace-normal',
  },
  {
    key: 'keterangan',
    label: 'Keterangan',
    class: '!w-[100px] whitespace-normal',
  },
 
  {
    key: 'idStatus',
    label: 'Status Verifikasi',
    class: 'text-center !w-[60px] whitespace-normal',
  },
  {
    key: 'files',
    label: 'File Lampiran',
    class: 'text-center !w-[70px] whitespace-normal',
  },
]

const open = computed({
  get: () => props.isOpen,
  set: (value) => {
    emit('update:model-value', value)
  },
})

const emit = defineEmits(['close']);

const formatDate = (date) => new Date(date).toLocaleString('id-ID');

const getStatusBadge = (status) => {
  return status === 1 ? '!bg-ut-primaryBlue px-1.5 py-1.5' :
         status === 2 ? '!bg-action-danger px-1.5 py-1.5' :
                        '!bg-action-success px-1.5 py-1.5';
};

const getStatusText = (status) => {
  return status === 1 ? 'Menyetujui' : status === 2 ? 'Revisi' : 'Submit';
};
</script>

<template>
    <UModal v-model="open" :style="{ width: '80%' }" :ui="{ width: 'w-full sm:max-w-4xl' }" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Riwayat Persetujuan <b>{{ modalTitle }}</b></h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="$emit('close')" />
          </div>
        </template>
  
        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Kode Mata Kuliah">{{ dataView.kodeMataKuliah }}</UFormGroup>
          <UFormGroup label="Nama Mata Kuliah">{{ dataView.namaMataKuliah }}</UFormGroup>
          <UFormGroup label="Edisi">{{ dataView.edisi }}</UFormGroup>
          <UFormGroup label="Tahun Pengembangan">{{ dataView.tahunPengembangan }}</UFormGroup>
        </div>
        <br>
        <UDivider />
  
        <div class="min-h-[240px] overflow-auto mt-4">
          <UTable v-bind:sort="sort" :rows="responseHist.data" :columns="columnsHistory" :loading="pending"
            sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down" sort-mode="manual"
            class="min-h-[240px]" :ui="{ td: { base: 'whitespace-normal !break-word dark:text-white max-w-[0]' } }">
  
            <template #createdAt-data="{ row }">
              <div class="flex justify-center items-center">
                <span class="text-bold">{{ formatDate(row.createdAt) }}</span>
              </div>
            </template>
  
            <template #keterangan-data="{ row }">
              <div class="flex justify-start items-start">
                <span v-html="row.keterangan"></span>
              </div>
            </template>

            <template #verifikasi-data="{ row }">
              <div class="flex">
                {{ row.verifikasi }}
              </div>
            </template>
  
            <template #createdBy-data="{ row }">
              <div class="flex">
                {{ row.createdBy }}
              </div>
            </template>
  
            <template #idStatus-data="{ row }">
              <div class="flex justify-center items-center">
                <UBadge :ui="{ rounded: 'rounded-full' }" :class="getStatusBadge(row.status)">{{ getStatusText(row.status) }}</UBadge>
              </div>
            </template>
  
            <template #files-data="{ row }">
              <div v-if="row.fileLampiran">
                <ul>
                  <li v-for="(file, index) in row.fileLampiran.split(';')" :key="file">
                  <a :href="`${urlApi}/pengembangan-rps/history/get-file-rps-hist/${file.replaceAll('/', '$')}?token=${token}`"
                    target="_blank" class="text-blue-500 hover:underline">File Lampiran {{ index + 1 }}</a>
                  </li>
                </ul>
              </div>
            </template>
          </UTable>
        </div>
      </UCard>
    </UModal>
  </template>
  
<style scoped>
.text-bold {
  font-weight: bold;
}
</style>
