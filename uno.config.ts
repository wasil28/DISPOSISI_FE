import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: 'inline-block',
      },
    }),
  ],
  safelist: [
    'i-mdi-home',
    'i-mdi-layers-triple',
    'i-mdi-view-grid',
    'i-mdi-paper-plane',
    'i-mdi-bookshelf',
    'i-mdi-file-table',
    'i-mdi-file-chart',
    'i-mdi-calendar-multiple',
    'i-mdi-clipboard-text-multiple',
    'i-mdi-certificate',
    'i-mdi-check',
    'i-mdi-text-box-multiple',
    'i-mdi-text-box-check',
    'i-mdi-text-box-remove',
    'i-mdi-text-box',
  ],
})
