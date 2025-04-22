export interface ILocales {
  [key: string]: {
    name: string
    iso: string
    flag: string
  }
}

export const availableLocales: ILocales = {
  id: {
    name: 'Indonesia',
    iso: 'id-ID',
    flag: 'ic-flag-id',
  },
  en: {
    name: 'English',
    iso: 'en-US',
    flag: 'ic-flag-us',
  },
}
