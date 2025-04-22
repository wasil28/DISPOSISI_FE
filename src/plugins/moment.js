import moment from 'moment-timezone'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(moment)
})
