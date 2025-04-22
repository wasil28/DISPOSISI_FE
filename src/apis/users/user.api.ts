// utils/api/user.api.js
import { handleApiError } from '~/utils/error.handler'

const instance = useApiMaster()

export const UserApi = {

  getAllData: async (paramsPost: any, token: any) => {
    return withoutLoading(async () => {
      try {
        const response = await instance.get('/users', {
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
  getDataById: async (id: number, token: any) => {
    return withoutLoading(async () => {
      try {
        const response = await instance.get(`/users/${id}`, {
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
  getDataByEmail: async (email: string, token: any) => {
    return withoutLoading(async () => {
      try {
        const response = await instance.get(`/users/byemail/${email}`, {
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
  getDataMhsByEmail: async (email: string, token: any) => {
    return withoutLoading(async () => {
      try {
        const response = await instance.get(`/users/mahasiswa/${email}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return response.data
      }
      catch (error) {
        return handleApiError(error)
        // throw error
      }
    })
  },
  addData: async (id: number | string, paramsPost: any, token: any) => {
    return withoutLoading(async () => {
      try {
        const response = await instance.post('/users', paramsPost, {
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
        const response = await instance.patch(`/users/${id}`, paramsPost, {
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
        const response = await instance.delete(`/users/${id}`, {
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

  editRoleData: async (id: number | string, paramsPost: any, token: any) => {
    return withoutLoading(async () => {
      try {
        const response = await instance.patch(`/users/role/${id}`, paramsPost, {
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

  deleteRoleData: async (idUserRole: number, token: any) => {
    return withoutLoading(async () => {
      try {
        const response = await instance.delete(`/users/role/${idUserRole}`, {
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
