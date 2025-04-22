// utils/api/login.api.js
import { handleApiError } from '~/utils/error.handler'

const instance = useApiMaster()
const instanceSso = useGraphql()

export const AuthApi = {
  getSession: async (token: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceSso.post('/graphql', {
          query: `
            {
              mySession{
                id
                createdAt
                updatedAt
                isFirstLogin
                expiredAt
                userBssn{
                  #idGroup
                  #username
                  name
                  email
                  ecampusAccount
                  status
                  emailVerified
                  roles{
                    id
                    kode
                    kodeSrs
                    name
                    description
                  }
                }
              }
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
        handleApiError(error)
        throw error
      }
    })
  },
  updateSession: async (token: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceSso.post('/graphql', {
          query: `
          mutation{
            updateSession
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
        handleApiError(error)
        throw error
      }
    })
  },

  getMenu: async (roleId: number, header: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.get(`/secpriv/${roleId}`, header)
        return response.data
      }
      catch (error) {
        console.log(error)
        return handleApiError(error)
      }
    })
  },
  login: async (param: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.post('/login', param)
        return response.data
      }
      catch (error) {
        return null
      }
    })
  },

}
