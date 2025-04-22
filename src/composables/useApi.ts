import axios from 'axios'

// Sesuaikan dengan api url nya.
export const useApiMaster = () => {
  return axios.create({
    baseURL: useRuntimeConfig().public.apiEndpointMaster,
    headers: {},
  })
}

export const useApiSrs = () => {
  return axios.create({
    baseURL: useRuntimeConfig().public.apiEndpointSrs,
    headers: {},
  })
}
