// File: src/stores/layoutStore.js
import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', () => {
  const pageTitle = ref<string>('')
  const pageBreadcrumb = ref<string>('')

  const setTitleBreadcrumb = (title: string, breadcrumb: string) => {
    pageTitle.value = title
    pageBreadcrumb.value = breadcrumb
  }

  return {
    pageTitle,
    pageBreadcrumb,
    setTitleBreadcrumb,
  }
})
