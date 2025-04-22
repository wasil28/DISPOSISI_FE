// utils/api/user.api.js
import { handleApiError } from '~/utils/error.handler'
import type { ResponseRole } from '~/types/usersTypes'

const instance = useApiMaster()

export const RoleApi = {

  getAllData: async (paramsPost: any, token: any): Promise<ResponseRole> => {
    return withoutLoading(async () => {
      try {
        const response = await instance.get('/roles', {
          params: paramsPost,
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
  addData: async (id: number | string, paramsPost: any, token: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.post('/roles', paramsPost, {
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
  editData: async (id: number | string, paramsPost: any, token: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.patch(`/roles/${id}`, paramsPost, {
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
  deleteData: async (id: number | string, token: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.delete(`/roles/${id}`, {
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

}
