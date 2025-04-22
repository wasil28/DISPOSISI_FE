import { useI18n } from 'vue-i18n'
import { availableLocales } from '~/locales/availableLocales'

export function languageController() {
  // composable
  const { locale } = useI18n()
  const localeUserSetting = useCookie('i18n_utkurikulum')

  // methods
  const readBrowserLanguage = (): string => {
    try {
      const lang = window ? window.navigator.language : 'id-ID'
      return availableLocales[lang] ? lang : 'id-ID'
    }
    catch (error) {
      return 'id-ID'
    }
  }
  const readUserLocale = (): string =>
    localeUserSetting.value || readBrowserLanguage()

  const systemi18n = useState<string>('i18n_utkurikulum', () => readUserLocale())

  watch(systemi18n, (localeSetting) => {
    localeUserSetting.value = localeSetting
    locale.value = localeSetting
  })

  const init = () => {
    locale.value = systemi18n.value
  }

  onMounted(() => init())

  return {
    systemi18n,
    init,
  }
}
