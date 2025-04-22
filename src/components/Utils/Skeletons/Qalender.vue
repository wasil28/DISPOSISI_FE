<template>
  <div class="bg-white rounded-md shadow-md p-4">
    <div class="flex justify-between">
      <USkeleton class="h-10 w-24" :ui="{ background: 'bg-gray-200' }" />
      <div class="gap-x-2 flex">
        <USkeleton class="h-10 w-24" :ui="{ background: 'bg-gray-200' }" />
        <USkeleton class="h-10 w-24" :ui="{ background: 'bg-gray-200' }" />
      </div>
    </div>
    <div class="grid grid-cols-7 grid-rows-5 gap-1 mt-4">
      <USkeleton v-for="i in 35" :key="i" class="h-12 w-full" :ui="{ background: 'bg-gray-200' }" />
    </div>
  </div>
</template>
