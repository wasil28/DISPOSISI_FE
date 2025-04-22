// utils/api/user.api.js
import { handleApiError, handleGraphError } from '~/utils/error.handler'

const instance = useApiMaster()
const instanceGraph = useGraphql()

export const MasterUmum = {
  getAllDataNegara: async () => {
    return withLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllNegara(orderBy: namaNegara, sort: ASC, limit: 9999999, skip: 1) {
                currentPage
                totalPages
                totalItems
                data {
                  id
                  namaNegara
                  kodeNegara
                  kodeTelepon
                }
              }
            }
          `,
        })
        // const dynamicProperty = Object.keys(response.data.data)[0]
        // return response.data.data[dynamicProperty]
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
        // throw error;
      }
    })
  },
  getNegara: async (id: any, token: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getNegara(id: ${id}) {
                id
                namaNegara
                kodeNegara
                kodeTelepon
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // const dynamicProperty = Object.keys(response.data.data)[0]
        // return response.data.data[dynamicProperty]
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
        // throw error;
      }
    })
  },
  getAllDataModule: async (token: any) => {
    return withLoading(async () => {
      try {
        const response = await instance.get('/modules', {
          params: {
            start: 1,
            offset: 999999,
            orderBy: 'id',
            order: 'ASC',
            keyword: '',
          },
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
  getAllDataProgramStudi: async (token: any, idFakultas: any = null) => {
    let fakultas = ''
    if (idFakultas != null)
      fakultas = `idFakultas: ${idFakultas}`

    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllProgramStudi(
                orderBy: namaProgramStudi, 
                sort: ASC, 
                limit: 9999999, 
                skip: 1,
                filter:{${fakultas}}
              ) {
                currentPage
                totalPages
                totalItems
                data {
                  id
                  idJenisProgram
                  namaProgramStudi
                  kodeProgramStudi
                  masaKurikulum
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
      }
    })
  },
  getAllDataProvinsi: async (token: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllProvinsi(orderBy: namaProvinsi, sort: ASC, limit: 9999999, skip: 1) {
                currentPage
                totalPages
                totalItems
                data {
                  id
                  namaProvinsi
                  kodeProvinsi
                  kodeProvinsiDikti
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // const dynamicProperty = Object.keys(response.data.data)[0]
        // return response.data.data[dynamicProperty]
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
        // throw error;
      }
    })
  },
  getAllDataKabupaten: async (token: any, idProvinsi: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
               getAllKabupatenKota(filter:{idProvinsi: ${idProvinsi}}, sort:ASC, orderBy:namaKabupatenKota, limit:9999){
                  currentPage
                  totalPages
                  data{
                    id
                    namaKabupatenKota
                    kodeKabupatenKota
                    kodeKabkoDikti
                  }
                }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // const dynamicProperty = Object.keys(response.data.data)[0]
        // return response.data.data[dynamicProperty]
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
        // throw error;
      }
    })
  },
  getAllDataKecamatan: async (token: any, idKabupatenKota: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllKecamatan(filter:{idKabupatenKota: ${idKabupatenKota}}, sort:ASC, orderBy:namaKecamatan, limit:9999){
                currentPage
                totalPages
                data{
                  id
                  namaKecamatan
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // const dynamicProperty = Object.keys(response.data.data)[0]
        // return response.data.data[dynamicProperty]
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
        // throw error;
      }
    })
  },
  getAllDataMasa: async (token: any, filter: any = {statusAktif : 1}) => {    
    const dataFilter = ref('')

    for (const [key, value] of Object.entries(filter))
      dataFilter.value += `, ${key}: ${value}`
      
    return withLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllMasa(orderBy:statusAktif,sort:DESC, limit:99999${dataFilter.value.length > 0 ? `, filter: {${dataFilter.value.slice(2)}}` : ''}
              ){
                currentPage
                totalPages
                totalItems
                data{
                  id
                  idLabelSemester
                  masa
                  labelSemesterData{
                    id
                    keterangan
                  }
                  tahunAkademik
                  statusAktif
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // const dynamicProperty = Object.keys(response.data.data)[0]
        // return response.data.data[dynamicProperty]
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
        // throw error;
      }
    })
  },
  getAllDataMasaAktif: async (token: any, statusAktif: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllMasa(filter:{statusAktif:${statusAktif}}, orderBy:masa,sort:DESC, limit:9999){
                currentPage
                totalPages
                totalItems
                data{
                  id
                  idLabelSemester
                  masa
                  labelSemesterData{
                    id
                    keterangan
                  }
                  tahunAkademik
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // const dynamicProperty = Object.keys(response.data.data)[0]
        // return response.data.data[dynamicProperty]
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
        // throw error;
      }
    })
  },
  getAllDataFakultas: async (token: any) => {
    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllFakultas(orderBy:kodeFakultas , sort: ASC, limit: 0) {
                currentPage
                totalPages
                totalItems
                data{
                  id
                  kodeFakultas
                  singkatan
                  namaFakultas
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
      }
    })
  },
  getDataMasaAktif: async (token: any, idJenisProgram: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
               getAllKalenderMbkm(skip: 0, limit:1, filter:{idJenisProgramDetail:${idJenisProgram}, statusAktif:1, idKegiatanMbkm:1}){
                  currentPage
                  totalPages
                  data{
                    idMasa
                    masaData{
                      masa
                      labelSemesterData{
                        keterangan
                      }
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
        // const dynamicProperty = Object.keys(response.data.data)[0]
        // return response.data.data[dynamicProperty]
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
        // throw error;
      }
    })
  },
  getAllDataUpbjj: async (token: any, idUpbjj: any = null) => {
    let upbjj = ''
    if (idUpbjj != null && idUpbjj != 0)
      upbjj = `id: ${idUpbjj}`

    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllUpbjj(
                filter: { 
                  statusAktif: 1 
                  ${upbjj}
                }, 
                orderBy: namaUpbjj, 
                sort: ASC, 
                limit: 0, 
                skip: 1
              ){
                currentPage
                totalPages
                totalItems
                data {
                  id
                  kodeUpbjj
                  namaUpbjj
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // const dynamicProperty = Object.keys(response.data.data)[0]
        // return response.data.data[dynamicProperty]
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
        // throw error;
      }
    })
  },
  getAllSemester: async (token: any) => {

    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllSemester(limit: 0) {
                currentPage
                totalItems
                totalPages
                data {
                  id
                  semester
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
        // throw error;
      }
    })
  },
  getAllTipePembelajaran: async (token: any) => {

    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllTipePembelajaran{
                currentPage
                totalPages
                totalItems
                data{
                  id
                  keterangan
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
        // throw error;
      }
    })
  },

  getAllDataKegiatanKalender: async (token: any) => {

    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllKegiatanKalender(
                orderBy: id, 
                sort: ASC, 
                limit: 9999999, 
                skip: 1,
              ) {
                currentPage
                totalPages
                totalItems
                data {
                  id
                  keterangan
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
      }
    })
  },

  getAllStatusInstitusi: async (token: any) => {

    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllStatusInstitusi(
                orderBy: id, 
                sort: ASC, 
                limit: 9999999, 
                skip: 1,
              ) {
                currentPage
                totalPages
                totalItems
                data {
                  id
                  keterangan
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
      }
    })
  },

  getAllStatusPekerjaan: async (token: any) => {

    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllStatusPekerjaan(
                orderBy: id, 
                sort: ASC, 
                limit: 9999999, 
                skip: 1,
              ) {
                currentPage
                totalPages
                totalItems
                data {
                  id
                  keterangan
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
      }
    })
  },

  getAllPosisiPengembang: async (token: any) => {

    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllPosisiPengembang(
                orderBy: nomorUrut, 
                sort: ASC, 
                limit: 9999999, 
                skip: 1,
              ) {
                currentPage
                totalPages
                totalItems
                data {
                  id
                  keterangan
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
      }
    })
  },
  getAllWaktuSksAktivitasBelajar: async (token: any,param: any = null) => {

    const { filter = {} } = param
    const dataFilter = ref('')

    if (filter) {
      for (const [key, value] of Object.entries(filter))
        dataFilter.value += `, ${key}: ${typeof value == 'string' ? `"${value}"` : value}`
    }


    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllWaktuSksAktivitasBelajar(
                orderBy: id, 
                sort: ASC, 
                limit: 9999999, 
                skip: 1,
                ${dataFilter.value.length > 0 ? ` filter: {${dataFilter.value}}` : ''}
              ) {
                currentPage
                totalPages
                totalItems
                data {
                  id
                  idKelompokAktivitasBelajar
                  kodeBelajarTerstruktur
                  keterangan
                  menit1sks
                  menit2sks
                  menit3sks
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
      }
    })
  },
  getAllDokumenPengembangan: async (token: any) => {

    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllDokumenPengembangan(
                orderBy: id, 
                sort: ASC, 
                limit: 9999999, 
                skip: 1,
              ) {
                currentPage
                totalPages
                totalItems
                data {
                  id
                  keterangan
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
      }
    })
  },
  getAllTahapanSat: async (token: any) => {

    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllTahapanSat(
                orderBy: id, 
                sort: ASC, 
                limit: 9999999, 
                skip: 1,
              ) {
                currentPage
                totalPages
                totalItems
                data {
                  id
                  keterangan
                }
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
      }
    })
  },

  getKurikulumByMtk: async (idProgramStudi:number, idMataKuliah:number, token: any) => {
    const idPart = 'idProgramStudi: ' + idProgramStudi + ', idMataKuliah: ' + idMataKuliah

    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getMtkProdi(${idPart}) {
                id
                kode
                nama
              }
            }
          `,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
      }
    })
  },

  getAllPejabat: async (token: any) => {

    return withoutLoading(async () => {
      try {
        const response = await instanceGraph.post('/graphql', {
          query: `
            {
              getAllPejabat(
                orderBy: id, 
                sort: ASC, 
                limit: 9999999, 
                skip: 1,
              ) {
                currentPage
                totalPages
                totalItems
                data {
                  id
                  kodePejabat
                  namaPejabat
                  keteranganJabatan
                  statusAktif
                  nip
                  idFakultas
                  fakultasData {
                    id
                    kodeFakultas
                    namaFakultas
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
        return returnDataGraph(response)
      }
      catch (error) {
        return handleGraphError(error)
      }
    })
  },
  
}


