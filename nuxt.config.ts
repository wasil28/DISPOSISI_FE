// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  
  experimental: {
    asyncContext: true,
  },
  
  sourcemap: false,
  
  app: {
    baseURL: process.env.SUB_FOLDER, // Sesuaikan dengan subfolder di production
    head: {
      charset: 'UTF-8',
      viewport: 'width=device-width, initial-scale=1',
      // script: [
      //   {
      //     src: '/ckeditor/ckeditor.js',
      //     defer: true,
      //   },
      // ],
    },
    // link: [
    //   { rel: 'stylesheet', href: 'https://cdn.ckeditor.com/4.16.2/standard-all/ckeditor.css' }
    // ]
  },

  srcDir: 'src',

  css: [
    '@/assets/css/main.css',
    '@/assets/scss/main.scss',
    '@/assets/scss/preload.scss',
    '@/assets/scss/responsive.scss',
    'katex/dist/katex.min.css'
  ],

  components: [
    {
      path: '~/components',
      pathPrefix: true,
    },
  ],

  imports: {
    dirs: [
      'composables/',
    ],
  },

  tailwindcss: {
    viewer: false,
  },

  turnstile: {
    siteKey: process.env.TURNSTILE_SITEKEY,
  },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/turnstile',
    '@pinia/nuxt',
    '@sidebase/nuxt-auth',
    '@sidebase/nuxt-session',
    // '@nuxtjs/moment',
    '@unocss/nuxt',
    'nuxt-tiptap-editor',
    '@samk-dev/nuxt-vcalendar',
  ],

  tiptap: {
    prefix: 'Tiptap', // prefix for Tiptap imports, composables not included
  },

  plugins: [
    { src: '~/plugins/vue-good-table', ssr: false },
    { src: '~/plugins/msal.ts', mode: 'client' },
    { src: '~/plugins/moment' },
    // { src: '~/plugins/ckeditor.js', mode: 'client' }
  ],

  session: {
    session: {
      expiryInSeconds: 60 * 240,
      rolling: true,
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/adminpanel/**': { prerender: true },
    '/mahasiswa/**': { prerender: true },
    // '/administrator/**': { ssr: false },
    // '/api/**': { cors: true, ssr: false },
  },

  nitro: {
    prerender: {
      routes: ['/', '/mahasiswa/**', '/adminpanel/**'],
    },
  },

  auth: {
    // Konfigurasi Sidebase Auth
    provider: {
      type: 'local', // Tipe provider, bisa 'local' atau 'oauth'
      options: {
        localStorageKey: 'my_app_auth', // Kunci penyimpanan lokal untuk token
        cookieName: 'my_app_auth_token', // Nama cookie untuk token
      },
    },
    endpoints: {
      signIn: {
        path: 'http://192.168.0.179:3333/api/v1/login', // Ubah URL endpoint login
        method: 'post', // HTTP method untuk login
        headers: {
          'Content-Type': 'application/json', // Header yang diperlukan
        },
      },
      signOut: {
        path: '/api/v1/logout', // URL endpoint logout (opsional)
        method: 'post', // HTTP method untuk logout (opsional)
      },
    },
    token: {
      maxAgeInSeconds: 3600 * 24 * 7, // Durasi token dalam detik (default: 3600)
      storage: 'localStorage', // Tempat penyimpanan token (default: 'localStorage')
      cookie: {
        sameSite: 'lax', // Konfigurasi cookie (opsional)
        secure: true, // Konfigurasi cookie (opsional)
      },
    },
  },

  postcss: {
    plugins: {
      'postcss-import': true,
      'tailwindcss/nesting': {},
      'postcss-nested': {},
      'tailwindcss': {},
      'autoprefixer': {},
    },
  },

  i18n: {
    locales: [
      {
        code: 'id-ID',
        file: 'id-ID.json',
      },
      {
        code: 'en-US',
        file: 'en-US.json',
      },
    ],
    langDir: 'locales/',
    strategy: 'no_prefix',
    defaultLocale: 'id-ID',
    detectBrowserLanguage: {
      alwaysRedirect: true,
      fallbackLocale: 'id-ID',
      useCookie: true,
      cookieKey: 'i18n_utbssn',
      cookieCrossOrigin: true,
    },
    vueI18n: {
      legacy: false,
      locale: 'id-ID',
      availableLocales: ['id-ID', 'en-US'],
    },
  },

  runtimeConfig: {
    // authSrsEmail: '',
    // authSrsPassword: '',
    public: {
      nodeEnv: process.env.NODE_ENV,
      apiEndpointMaster: process.env.API_ENDPOINT_MASTER,
      apiEndpointGraphql: process.env.API_ENDPOINT_GRAPHQL,
      apiEndpointSrs: process.env.API_ENDPOINT_SRS,
      baseEndpoint: process.env.BASE_ENDPOINT,
      authSrsEmail: process.env.NUXT_AUTH_SRS_EMAIL,
      authSrsPassword: process.env.NUXT_AUTH_SRS_PASSWORD,
      secretKeyCrypt: process.env.CRYPTY_SECRET,
      // featRunningTextHome: process.env.FEAT_RUNNING_TEXT_HOME,
    },
    turnstile: {
      // This can be overridden at runtime via the NUXT_TURNSTILE_SECRET_KEY
      // environment variable.
      secretKey: process.env.TURNSTILE_SECRET,
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        strict: true,
        types: ['@pinia/nuxt', '@intlify/nuxt3', './type.d.ts'],
      },
    },
  },

  colorMode: {
    preference: 'light',
    classSuffix: '',
    fallback: 'light',
    storageKey: 'utKurikulumColorMode',
  },

  vite: {
    logLevel: 'info',
    define: {
      __DEV__: (process.env.NODE_ENV === 'development').toString(),
    },
  },

  nitro: {
    compressPublicAssets: true,
  },

  compatibilityDate: '2024-07-18',
})
