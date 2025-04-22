const instanceGraph = useGraphql()
const instanceRest = useApiMaster()

export const PejabatPenandatanganApi = {
  getAllData: async (param: any, token: any) => {
    const { orderBy, order, offset, start, search, filter = {}, id = null } = param;

    return withLoading(async () => {
      try {
        // Menyiapkan query dan variables
        const query = `
                query getAllData($orderBy: PejabatPenandatanganFieldsEnum, $sort: SortByEnum, $limit: Int, $skip: Int, $search: String, $filter: PejabatPenandatanganFilter) {
                    getAllPejabatPenandatangan(
                        orderBy: $orderBy,
                        sort: $sort,
                        limit: $limit,
                        skip: $skip,
                        search: $search,
                        filter: $filter
                    ) {
                        currentPage
                        totalItems
                        totalPages
                        data {
                          id
                          nik
                          fileTtd
                          fileIjazah
                          fileLegalisir
                          idPejabat
                          pejabatData {
                            id
                            idFakultas
                            fakultasData {
                              id
                              kodeFakultas
                              namaFakultas
                            }
                            keteranganJabatan
                            kodeJabatan
                            namaPejabat
                            nip
                            statusAktif
                          }
                        }
                    }
                }
            `;

        // Variables untuk query
        const variables = {
          orderBy,
          sort: order,
          limit: offset,
          skip: start,
          search,
          filter
        };

        // Fetch data dengan variables
        const response = await instanceGraph.post(
          "/graphql",
          {
            query,
            variables,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return returnDataGraph(response);
      } catch (error) {
        return handleGraphError(error);
      }
    });
  },

  getData: async (param: any, token: any) => {
    const { id = null } = param;

    return withLoading(async () => {
      try {
        // Menyiapkan query dan variables
        const query = `
                query getData($getPejabatPenandatanganId: Int!) {
                    getPejabatPenandatangan(
                        id: $getPejabatPenandatanganId
                    ) {
                        id
                        nik
                        fileTtd
                        idPejabat
                        pejabatData {
                          id
                          idFakultas
                          fakultasData {
                            id
                            kodeFakultas
                            namaFakultas
                          }
                          keteranganJabatan
                          kodeJabatan
                          namaPejabat
                          nip
                          statusAktif
                        }
                    }
                }
            `;

        // Variables untuk query
        const variables = {
          getPejabatPenandatanganId: id,
        };

        // Fetch data dengan variables
        const response = await instanceGraph.post(
          "/graphql",
          {
            query,
            variables,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return returnDataGraph(response);
      } catch (error) {
        return handleGraphError(error);
      }
    });
  },
  
  addData: async (param: any, token: any) => {
    const {
      id,
      // nik,
      idDokumen,
      // idJenis,
      // namaMahasiswa,
      // noIdentitas,
      // statusTte,
      // tanggalTtd,
      nim,
      masa,
      // noHp,
      // typeFile,
      // idRpsPustaka,
      // idCpumk
    } = param;


    // Menyiapkan payload berdasarkan tipe program
    const payload: any = {
      // nik,
      idDokumen,
      // idJenis: +idJenis,
      // namaMahasiswa,
      // noIdentitas,
      // statusTte: +statusTte,
      // tanggalTtd,
      nim,
      masa,
      // noHp,
      // typeFile
    };

    // Menentukan jenis mutation: update atau create
    const mutationType = id ? "updatePejabatPenandatangan" : "createPejabatPenandatangan"

    return withLoading(async () => {
      try {
        // Menyiapkan query dan variables dengan kondisi update atau create
        const query = id
          ? `
            mutation update($payload: PejabatPenandatanganPayload!, $id: Int!) {
              updatePejabatPenandatangan(payload: $payload, id: $id) {
                id
              }
            }
          `
          : `
            mutation create($payload: PejabatPenandatanganPayload!) {
              createPejabatPenandatangan(payload: $payload) {
                id
              }
            }
          `

        // Menyiapkan variables berdasarkan kondisi update atau create
        const variables = id
          ? { payload, id : +id }
          : { payload }

        // Fetch data menggunakan variables
        const response = await instanceGraph.post(
          '/graphql',
          {
            query,
            variables,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        return returnDataGraph(response)
      } catch (error) {
        return handleGraphError(error)
      }
    })
  },

  deleteData: async (id: number, token: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceGraph.post(
          "/graphql",
          {
            query: `
            mutation delete($deletePejabatPenandatanganId: Int!){
              deletePejabatPenandatangan(id: $deletePejabatPenandatanganId)
            }
          `,
            variables: {
              deletePejabatPenandatanganId: +id,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // const dynamicProperty = Object.keys(response.data.data)[0]
        // return response.data.data[dynamicProperty]
        return returnDataGraph(response);
      } catch (error) {
        return handleGraphError(error);
        // throw error;
      }
    });
  },

  addMassal: async (param: any, password: any, token: any) => {
    return withLoading(async () => {
      try {
        // Parameter yang dikirim ke GraphQL
        const response = await instanceGraph.post('/graphql', {
          query: `
            mutation createMassal($massal: [MasalEntriProsesTteArgs!]!, $password: String!){
              createMasalProsesTte(dataMasal: $massal, password: $password){
                messages
                status
                dataSuccess{
                  namaMahasiswa
                  dokumen
                }
                dataFailed{
                  namaMahasiswa
                  dokumen  
                  message
                }
              }
            }
          `,
          variables: {
            "password": password,  // ID kurikulum yang ingin dikirim
            "massal": param,  // Mengirim param langsung
          },
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        return returnDataGraph(response);
      } catch (error) {
        return handleGraphError(error);
      }
    });
  },

  uploadBerkas: async (token: any, body: any) => {
    return withLoading(async () => {
      try {
        const response = await instanceRest.post('kegiatan/upload-ttd-pejabat', body, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // console.log(await sessionValue)
        return response.data
      }
      catch (error) {
        console.log(error)
        handleApiErrorWithoutLogout(error)
        // throw error
      }
    })
  },

}
