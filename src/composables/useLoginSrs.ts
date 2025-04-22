import { Srs } from '~/apis'

export const useLoginSrs = async () => {
  const config = useRuntimeConfig()

  // const param = {
  //   email: useRuntimeConfig().public.authSrsEmail,
  //   password: useRuntimeConfig().public.authSrsPassword,
  // }
  
  // const srsLogin = await Srs.postLoginSrs(param)
  // sessionStorage.setItem('tokenSrs', srsLogin.token)
  const srsLogin = await Srs.postLoginSrsBE()
  sessionStorage.setItem('tokenSrs', srsLogin)
  return srsLogin
}
