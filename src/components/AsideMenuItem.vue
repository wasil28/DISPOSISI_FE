<script setup lang="ts">
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  isDropdownList: Boolean,
  isPortal: Boolean,
})

const emit = defineEmits(['menuClick'])

const isDropdownActive = ref(false)

const componentClass = computed(() => [
  props.isDropdownList ? 'py-2 pl-6' : 'py-2',
])

const hasDropdown = computed(() => !!props.item.menu && props.item.menu.length > 0)

const menuClick = (event: Event) => {
  emit('menuClick', event, props.item)

  if (hasDropdown.value)
    isDropdownActive.value = !isDropdownActive.value
}
</script>

<template>
  <li>
    <NuxtLink
      :to="item.to ?? '#'"
      class="flex cursor-pointer text-xs items-center px-2 transition-all duration-150"
      :class="[componentClass, isDropdownActive ? 'bg-white dark:bg-slate-500 dark:text-gray-300 text-ut-asideBlue hover:text-ut-asideBlue rounded-l-full' : 'text-white hover:text-ut-bgYellow', isPortal ? 'bg-ut-primaryBlue rounded-full' : '', item.isLogout ? 'mr-2.5' : '']"
      @click.stop="menuClick"
    >
      <UnoIcon class="mr-2" :class="item.icon" />
      <span
        class="grow"
        :class="[{ 'pr-2 pl-0': !hasDropdown }]"
      >{{ item.label }}</span>
      <UnoIcon
        v-if="hasDropdown"
        class="i-mdi-chevron-right flex-none transition-all duration-150"
        :class="[isDropdownActive ? ' rotate-90' : 'rotate-0']"
      />
    </NuxtLink>
    <AsideMenuList
      v-if="hasDropdown"
      :menu="item.menu"
      class="aside-menu-dropdown" :class="[isDropdownActive ? 'block dark:bg-slate-800/50' : 'hidden']"
      is-dropdown-list
    />
  </li>
</template>
