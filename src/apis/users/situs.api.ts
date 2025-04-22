// utils/api/user.api.js
import { handleApiError } from '~/utils/error.handler'

const instance = useApiMaster()

export const SitusApi = {

  getAllData: async (paramsPost: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.get('/situs', {
          params: paramsPost,
        })
        return response.data
      }
      catch (error) {
        handleApiError(error)
        throw error
      }
    })
  },
  editData: async (id: number | string, paramsPost: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.patch(`/situs/${id}`, paramsPost)
        return response.data
      }
      catch (error) {
        handleApiError(error)
        throw error
      }
    })
  },

}
