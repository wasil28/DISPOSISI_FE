<script setup lang="ts">
  const props = defineProps({
    rows: Array,
    columns: Array
  });
  
  const q = ref('');
  const page = ref(1);
  const itemCount = ref(0);
  const pageCount = 2;
  
  const filteredRows = computed(() => {

    if (!props.rows)
        return []

    if (!q.value) {
     itemCount.value = props.rows.length
      return props.rows.slice((page.value - 1) * pageCount, page.value * pageCount);
    }

    console.log(props.rows)
    console.log('pageCount',pageCount)
  
    const data =  props.rows.filter(person => {
      return Object.values(person).some(value => {
        return (String(value).toLowerCase().includes(q.value.toLowerCase()));
      });
    });
    itemCount.value = data.length
    return data
  });
</script>
<template>
    <div>
      <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
        <UInput v-model="q" placeholder="Cari..." />
      </div>
      <UTable :ui="{ td: { base: '!whitespace-normal !break-all dark:text-white max-w-[0]' }, selectable: { size: 'sm' } }" :rows="filteredRows" :columns="columns" class="w-full" >
        <template #number-data="{ row, index }">
            <div class="flex justify-center items-center gap-x-1.5">
                <span v-if="index !== -1">{{ index + 1 }}</span>
            </div>
        </template>
        <template #keteranganError-data="{ row, index }">
            <p v-html="row.keteranganError" />
        </template>
        </UTable>
      <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
        <UPagination 
            v-model="page" 
            :page-count="pageCount" 
            :total="itemCount" 
            :ui="{
                    wrapper: 'flex items-center gap-1',
                    rounded: '!rounded-full min-w-[32px] justify-center',
                    default: {
                    activeButton: {
                        variant: 'outline',
                    },
                    },
                }"
        />
      </div>
    </div>
</template>
  
  