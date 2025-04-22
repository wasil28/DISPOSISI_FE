import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDarkModeStore = defineStore('darkMode', () => {
  const isEnabled = ref('0')

  // Cek & set dark mode saat pertama kali load aplikasi
  function init() {
    if (process.client && localStorage.getItem('utKurikulumDarkMode')) {
      isEnabled.value = localStorage.getItem('utKurikulumDarkMode') as string

      document.body.classList[isEnabled.value === '1' ? 'add' : 'remove']('dark-scrollbars')

      document.documentElement.classList[isEnabled.value === '1' ? 'add' : 'remove'](
        'dark',
        'dark-scrollbars-compat',
      )
    }
  }

  // Toggle dark mode melalui trigger pada topbar
  function set() {
    if (process.client) {
      document.body.classList[isEnabled.value === '0' ? 'add' : 'remove']('dark-scrollbars')

      document.documentElement.classList[isEnabled.value === '0' ? 'add' : 'remove'](
        'dark',
        'dark-scrollbars-compat',
      )

      localStorage.setItem('utKurikulumDarkMode', isEnabled.value === '0' ? '1' : '0')
      isEnabled.value = isEnabled.value === '0' ? '1' : '0'
    }
  }

  init()

  return {
    isEnabled,
    set,
  }
})
