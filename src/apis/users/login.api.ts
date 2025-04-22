// utils/api/login.api.js
import { handleApiError, handleApiErrorWithoutLogout } from '~/utils/error.handler'

const instance = useApiMaster()
const instanceSso = useGraphql()

export const LoginApi = {
  login: async (param: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceSso.post('/graphql', {
          query: `
            mutation {
              loginUser(
                user: {
                  email: "${param.username}"
                  password: "${param.password}"
                }
                isSso: false
              )
            }
          `,
        })
        return response.data
      }
      catch (error) {
        return handleApiErrorWithoutLogout(error)
        // throw error;
      }
    })
  },
  loginSso: async (email_365: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceSso.post('/graphql', {
          query: `
            mutation {
              loginUser(
                user: {
                  email: "${email_365}"
                  password: "password"
                }
                isSso: true
              )
            }
          `,
        })
        return response.data
      }
      catch (error) {
        handleApiError(error)
        throw error
      }
    })
  },
  /*loginAsMhs: async (param: any, token: string) => {
    return withLoading(async () => {
      try {
        const response = await instanceSso.post('/graphql', {
          query: `
            mutation {
              loginAsUserMhs(
                user: {
                  email: "${param.email}"
                  password: "${param.password}"
                }
                isSso: false
              )
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return response.data
      }
      catch (error) {
        return handleApiErrorWithoutLogout(error)
        // throw error;
      }
    })
  },*/
  compareSrsxKurikulum: async (param: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceSso.post('/graphql', {
          query: `
            mutation{
              compareSrsxKurikulum(payload:{
                ecampusAccount: "${param.email}",
                name: "${param.name}",
                kode_group: "${param.kode_group}",
                nama_group: "${param.nama_group}",
                kode_unit: "${param.kode_unit}",
                nama_unit: "${param.nama_unit}",
              })
            }
          `,
        })
        return response.data
      }
      catch (error) {
        return handleApiErrorWithoutLogout(error)
      }
    })
  },
  verifyTokenSso: async (header: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceSso.get('/api/v1/auth-sso', header)
        // console.log(await sessionValue)
        return response.data
      }
      catch (error) {
        // console.log(error)
        handleApiErrorWithoutLogout(error)
        // throw error
      }
    })
  },
  verifyTokenSsoDosen: async (header: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceSso.get('/api/v1/auth-sso-dosen', header)

        return response.data
      }
      catch (error) {
        // console.log(error)
        handleApiErrorWithoutLogout(error)
        // throw error
      }
    })
  },
  decode: async (header?: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.get('/decode-jwt', header)
        return response.data
      }
      catch (error) {
        return null
      }
    })
  },

  checkUser: async (param: any) => {
    return withoutLoading(async () => {
      try {
        const response = await instanceSso.post('/graphql', {
          query: `
            mutation{
              checkUser(payload:{
                ecampusAccount: "${param.email}"
              }){
                status
                nim
              }
            }
          `,
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleApiErrorWithoutLogout(error)
      }
    })
  },

  /*register: async (param: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceSso.post('/graphql', {
          query: `
            mutation {
              registerAkun(payload:{
                idNegaraDikti : ${param.idNegaraDikti}
                email: "${param.email}"
                userName: "masikodong"
                name: "${param.name}"
                password: "${param.password}"
                passwordConfirmation: "${param.confirmPassword}"
                ${param.nik ? `nik : "${param.nik}"` : `noPasport : "${param.noPasport}"`}
              })
            }
          `,
        })
        return response.data
      }
      catch (error) {
        console.log(error)
        return handleGraphError(error)
      }
    })
  },
  verifikasiAkun: async (param: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceSso.post('/graphql', {
          query: `
            mutation{
              verifikasiAkun(payload:{
                kodeAktifasiAkun:"${param.code}"
                email:"${param.email}"
              })
            }
          `,
        })
        try {
          return response.data
        }
        catch {
          return false
        }
      }
      catch (error) {
        console.log(error)
        return handleGraphError(error)
      }
    })
  },
  aktivasiAkun: async (param: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceSso.post('/graphql', {
          query: `
            mutation{
              aktivasiAkun(payload:{
                kodeAktifasiAkun:"${param.code}"
                email:"${param.email}"
                password:"${param.password}"
                passwordConfirmation:"${param.passwordConfirmation}"
              })
            }
          `,
        })

        return returnDataGraph(response)
      }
      catch (error) {
        console.log(error)
        handleApiErrorWithoutLogout(error)
      }
    })
  },
  resetPassword: async (param: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceSso.post('/graphql', {
          query: `
            mutation{
              resetPassword(payload:{
                kodeLupaPassword:"${param.code}"
                email:"${param.email}"
                password:"${param.password}"
                passwordConfirmation:"${param.passwordConfirmation}"
              })
            }
          `,
        })

        return returnDataGraph(response)
      }
      catch (error) {
        console.log(error)
        handleApiErrorWithoutLogout(error)
      }
    })
  },
  requestResetPassword: async (email: string, locale: string) => {
    return withLoading(async () => {
      try {
        await instanceSso.post('/graphql', {
          query: `
            mutation{
              requestResetPassword(
                email: "${email}"
                locale: "${locale}"
              )
            }
          `,
        })

        return true
      }
      catch (error) {
        console.log(error)
      }
    })
  },
  gantiPassword: async (token: any, param: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceSso.post('/graphql', {
          query: `
            mutation{
              gantiPassword(payload:{
                currentPassword:"${param.currentPassword}"
                password:"${param.password}"
                passwordConfirmation:"${param.passwordConfirmation}"
              })
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        return response.data
      }
      catch (error) {
        console.log(error)
        handleApiErrorWithoutLogout(error)
      }
    })
  },*/


  loginAsPengembang: async (email: any, token: string) => {
    return withoutLoading(async () => {
      try {
        const response = await instanceSso.post('/graphql', {
          query: `
            mutation {
              loginAsUserPengembang(
                email: "${email}"
              )
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return response.data
      }
      catch (error) {
        return handleApiErrorWithoutLogout(error)
        // throw error;
      }
    })
  },
}
