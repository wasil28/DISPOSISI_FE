import locale_id_ID from "../src/locales/id-ID.json" assert { type: "json" };
import locale_en_US from "../src/locales/en-US.json" assert { type: "json" };
export const localeCodes = ["id-ID","en-US"]

export const localeMessages = {
  "id-ID": [{ key: "../src/locales/id-ID.json", load: () => Promise.resolve(locale_id_ID) }],
  "en-US": [{ key: "../src/locales/en-US.json", load: () => Promise.resolve(locale_en_US) }],
}

export const additionalMessages = Object({"en-US":[],})

export const resolveNuxtI18nOptions = async (context) => {
  const nuxtI18nOptions = Object({})
  const vueI18nOptionsLoader = async (context) => Object({"legacy":false,"locale":"id-ID","availableLocales":["id-ID","en-US"],"messages": Object({"id-ID":{
  
},}),})
  nuxtI18nOptions.vueI18n = await vueI18nOptionsLoader(context)
  nuxtI18nOptions.locales = [Object({"code":"id-ID","file":"id-ID.json","path":"/Users/wasilmawardi/Documents/work/UT/TTE/BSSN_TTE_FE/src/locales/id-ID.json"}),Object({"code":"en-US","file":"en-US.json","path":"/Users/wasilmawardi/Documents/work/UT/TTE/BSSN_TTE_FE/src/locales/en-US.json"})]
  nuxtI18nOptions.defaultLocale = "id-ID"
  nuxtI18nOptions.defaultDirection = "ltr"
  nuxtI18nOptions.routesNameSeparator = "___"
  nuxtI18nOptions.trailingSlash = false
  nuxtI18nOptions.defaultLocaleRouteNameSuffix = "default"
  nuxtI18nOptions.strategy = "no_prefix"
  nuxtI18nOptions.lazy = false
  nuxtI18nOptions.langDir = "locales/"
  nuxtI18nOptions.rootRedirect = null
  nuxtI18nOptions.detectBrowserLanguage = Object({"alwaysRedirect":true,"cookieCrossOrigin":true,"cookieDomain":null,"cookieKey":"i18n_utbssn","cookieSecure":false,"fallbackLocale":"id-ID","redirectOn":"root","useCookie":true})
  nuxtI18nOptions.differentDomains = false
  nuxtI18nOptions.baseUrl = ""
  nuxtI18nOptions.dynamicRouteParams = false
  nuxtI18nOptions.customRoutes = "page"
  nuxtI18nOptions.pages = Object({})
  nuxtI18nOptions.skipSettingLocaleOnNavigate = false
  nuxtI18nOptions.onBeforeLanguageSwitch = (() => "")
  nuxtI18nOptions.onLanguageSwitched = (() => null)
  nuxtI18nOptions.types = undefined
  nuxtI18nOptions.debug = false
  return nuxtI18nOptions
}

export const nuxtI18nOptionsDefault = Object({vueI18n: undefined,locales: [],defaultLocale: "",defaultDirection: "ltr",routesNameSeparator: "___",trailingSlash: false,defaultLocaleRouteNameSuffix: "default",strategy: "prefix_except_default",lazy: false,langDir: null,rootRedirect: null,detectBrowserLanguage: Object({"alwaysRedirect":false,"cookieCrossOrigin":false,"cookieDomain":null,"cookieKey":"i18n_redirected","cookieSecure":false,"fallbackLocale":"","redirectOn":"root","useCookie":true}),differentDomains: false,baseUrl: "",dynamicRouteParams: false,customRoutes: "page",pages: Object({}),skipSettingLocaleOnNavigate: false,onBeforeLanguageSwitch: (() => ""),onLanguageSwitched: (() => null),types: undefined,debug: false})

export const nuxtI18nInternalOptions = Object({__normalizedLocales: [Object({"code":"id-ID","file":"id-ID.json","path":"/Users/wasilmawardi/Documents/work/UT/TTE/BSSN_TTE_FE/src/locales/id-ID.json"}),Object({"code":"en-US","file":"en-US.json","path":"/Users/wasilmawardi/Documents/work/UT/TTE/BSSN_TTE_FE/src/locales/en-US.json"})]})
export const NUXT_I18N_MODULE_ID = "@nuxtjs/i18n"
export const isSSG = false
export const isSSR = true
