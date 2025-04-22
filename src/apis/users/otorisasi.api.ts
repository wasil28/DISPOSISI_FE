// utils/api/user.api.js
import { handleApiError } from '~/utils/error.handler'
import type { ResponseRole } from '~/types/usersTypes'

const instance = useApiMaster()

export const OtorisasiApi = {

  getAllData: async (paramsPost: any, id: number | string, token: any): Promise<ResponseRole> => {
    return withoutLoading(async () => {
      try {
        const response = await instance.get(`/secpriv/${id}`, {
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
    return withoutLoading(async () => {
      try {
        const response = await instance.post('/secpriv', paramsPost, {
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
    return withoutLoading(async () => {
      try {
        const response = await instance.patch(`/secpriv/${id}`, paramsPost, {
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
    return withoutLoading(async () => {
      try {
        const response = await instance.delete(`/secpriv/${id}`, {
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
