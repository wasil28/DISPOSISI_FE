import { handleApiError } from '~/utils/error.handler'
const instanceGraph = useGraphql()

const instance = useApiSrs()

export const Srs = {
  
  getDataUserByEmail: async (email: string, token: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.get(`/v1/data-user/${email}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return response.data
      }
      catch (error) {
        console.error(error)
      }
    })
  },

  postLoginSrs: async (param: any) => {
    const { email, password } = param
    try {
      const response = await instance.post('/v1/auth', {
        email,
        password,
      })
      return response.data
    }
    catch (error) {
      handleApiError(error)
      console.error(error)
      throw error
    }
  },
  postLoginSrsBE: async () => {
    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {            
              getAccessToken
            }
          `,
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
      }
    })
  }
}
