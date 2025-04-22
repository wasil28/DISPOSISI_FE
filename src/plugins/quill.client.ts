// plugins/quill.client.ts
import { defineNuxtPlugin } from '#app'
import Quill from 'quill'

export default defineNuxtPlugin(() => {
  // Plugin ini hanya akan berjalan di sisi client
  return {
    provide: {
      quill: Quill
    }
  }
})
