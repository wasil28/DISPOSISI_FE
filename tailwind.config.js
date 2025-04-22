/* eslint-env node */

const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    './composables/**/*.{js,vue,ts}',
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    'app.vue',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    asideScrollbars: {
      light: 'light',
      gray: 'gray',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'Arial', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        'ut': {
          bgBlue: {
            DEFAULT: '#2C66CF',
            hover: '#0545A2',
            footer: '#0A4595',
            subtle: '#D9E9FF',
          },
          bgYellow: {
            DEFAULT: '#FFDE00',
            hover: '#C4AB00',
            light: '#FFF08B',
          },
          bgGreen: {
            DEFAULT: '#0C9900',
            hover: '#0A8000',
          },
          textBlue: '#002A76',
          textGray: '#8C8C8C',
          textDarkGray: '#6D7580',
          textBgGray: '#636D79',
          textOrange: '#FA8C16',
          bgGray: '#E7E7E7',
          bgCardGray: '#F1F1F1',
          bgGreenCheck: '#5FFF82',
          primaryBlue: '#0055D0',
          asideBlue: '#1748A1',
          bgForm: '#EDEDED',
          actionBlue: '#3389FE',
          actionRed: '#DA1414',
          actionWarning: '#F6AA2B',
          actionSuccess: '#00D021',
          actionWhite: '#FFFFFF',
          subtleWhite: '#F4F4F4',
          tableBody: '#2C3A4B',
        },
        'action': {
          danger: {
            DEFAULT: '#FF2524',
            hover: '#D81716',
          },
          info: {
            DEFAULT: '#3389FE',
            hover: '#3170EC',
          },
          primary: {
            DEFAULT: '#0055D0',
            hover: '#063D8E',
          },
          success: {
            DEFAULT: '#009922',
            hover: '#0C7A24',
          },
          warning: {
            DEFAULT: '#FAAD14',
            hover: '#E59A05',
          },
        },
        'picton-blue': {
          50: '#f2f8fd',
          100: '#e5eff9',
          200: '#c5dff2',
          300: '#91c4e8',
          400: '#6ab0de',
          500: '#318bc6',
          600: '#216ea8',
          700: '#1c5888',
          800: '#1b4b71',
          900: '#1b405f',
          950: '#12293f',
        },
      },
      screens: {
        '3xl': '1920px',
      },
      zIndex: {
        '-1': '-1',
      },
      flexGrow: {
        5: '5',
      },
      maxHeight: {
        'screen-menu': 'calc(100vh - 3.5rem)',
        'modal': 'calc(100vh - 160px)',
      },
      transitionProperty: {
        position: 'right, left, top, bottom, margin, padding',
        textColor: 'color',
      },
      keyframes: {
        'fade-out': {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      animation: {
        'fade-out': 'fade-out 250ms ease-in-out',
        'fade-in': 'fade-in 250ms ease-in-out',
      },
      gridTemplateColumns: {
        // Buat class kustom dengan nama `cols-custom`
        'customMenu': 'repeat(4, minmax(0, 1fr))'
      },
      spacing: {
        '3%': '3%'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'aside-scrollbars': (value) => {
            const track = value === 'light' ? '100' : '900'
            const thumb = value === 'light' ? '300' : '600'
            const color = value === 'light' ? 'gray' : value

            return {
              'scrollbarWidth': 'thin',
              'scrollbarColor': `${theme(`colors.${color}.${thumb}`)} ${theme(
                `colors.${color}.${track}`,
              )}`,
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: theme(`colors.${color}.${track}`),
              },
              '&::-webkit-scrollbar-thumb': {
                borderRadius: '0.25rem',
                backgroundColor: theme(`colors.${color}.${thumb}`),
              },
            }
          },
        },
        { values: theme('asideScrollbars') },
      )
    }),
  ],
}
