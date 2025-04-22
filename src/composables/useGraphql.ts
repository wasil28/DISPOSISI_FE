import axios from 'axios'

// Sesuaikan dengan api url nya.
export const useGraphql = () => {
  return axios.create({
    baseURL: useRuntimeConfig().public.apiEndpointGraphql,
    headers: {},
  })
}
