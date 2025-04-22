// utils/api/user.api.js
import { handleApiError } from '~/utils/error.handler'

const instance = useApiMaster()

export const ModuleApi = {

  getAllData: async (paramsPost: any, token: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.get('/modules', {
          params: paramsPost,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return response.data
      }
      catch (error) {
        console.log(error)
        // handleApiError(error)
        // throw error
      }
    })
  },
  addData: async (id: number | string, paramsPost: any, token: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.post('/modules', paramsPost, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return response.data
      }
      catch (error) {
        console.log(error)
        // handleApiError(error)
        // throw error
      }
    })
  },
  editData: async (id: number | string, paramsPost: any, token: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.patch(`/modules/${id}`, paramsPost, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return response.data
      }
      catch (error) {
        console.log(error)
        // handleApiError(error)
        // throw error
      }
    })
  },
  deleteData: async (id: number, token: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.delete(`/modules/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return response.data
      }
      catch (error) {
        console.log(error)
        // handleApiError(error)
        // throw error
      }
    })
  },

}
