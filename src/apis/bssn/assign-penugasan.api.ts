const instanceGraph = useGraphql()

export const AssignPenugasanApi = {
  getAllData: async (param: any, token: any) => {
    const { orderBy, order, offset, start, search, filter = {}, id = null } = param;

    return withLoading(async () => {
      try {
        // Menyiapkan query dan variables
        const query = `
                query getAllData($orderBy: PenandatanganFieldsEnum, $sort: SortByEnum, $limit: Int, $skip: Int, $search: String, $filter: PenandatanganFilter) {
                    getAllPenandatangan(
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
                            #idJenis
                            idDokumen
                            namaMahasiswa
                            nik
                            nim
                            noHp
                            noIdentitas
                            statusTte
                            tanggalTtd
                            typeFile
                            createdAt
                            createdBy
                            updatedAt
                            updatedBy
                            dokumenData {
                              id
                              kode
                              keterangan
                            }
                            pejabatPenandatanganData {
                              id
                              nik
                              pejabatData {
                                namaPejabat
                                kodeJabatan
                                keteranganJabatan
                              }
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
  getAllDataBelumAssign: async (param: any, token: any) => {
    const { orderBy, order, offset, start, search, filter = {}, id = null } = param;

    return withLoading(async () => {
      try {
        // Menyiapkan query dan variables
        const query = `
                query getAllDataBelumAssign($orderBy: PenandatanganFieldsEnum, $sort: SortByEnum, $limit: Int, $skip: Int, $search: String, $filter: PenandatanganFilter) {
                    getAllAksiBelumAssignv2(
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
                          id_nota
                          nim
                          nama_mahasiswa
                          nomor_billing
                          total_bayar
                          kode_upbjj
                          nama_upbjj
                          nama_unit
                          nama_singkat_unit
                          fakultas
                          pejabat
                          nip
                          nik
                          orientasi
                          nama_file_ijazah
                          nama_file_transkrip
                          flag
                          flag_ijazah
                          flag_ijazah_akta
                          flag_transkrip
                          flag_srs
                          keterangan
                          user_create
                          user_date_create
                          user_validasi
                          user_date_validasi
                          user_generate
                          user_date_generate
                          user_batal
                          user_date_batal
                          user_selesai
                          user_date_selesai
                          status
                          flag_folder
                          flag_hari

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
                query getData($getPenandatanganId: Int!) {
                    getPenandatangan(
                        id: $getPenandatanganId
                    ) {
                        id
                        #idJenis
                        idDokumen
                        namaMahasiswa
                        nik
                        nim
                        noHp
                        noIdentitas
                        statusTte
                        tanggalTtd
                        typeFile
                        createdAt
                        createdBy
                        updatedAt
                        updatedBy
                        dokumenData {
                          id
                          kode
                          keterangan
                        }
                        pejabatPenandatanganData {
                          id
                          nik
                          pejabatData {
                            namaPejabat
                            kodeJabatan
                            keteranganJabatan
                          }
                        }
                    }
                }
            `;

        // Variables untuk query
        const variables = {
          getPenandatanganId: id,
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
    const mutationType = id ? "updatePenandatangan" : "createPenandatangan"

    return withLoading(async () => {
      try {
        // Menyiapkan query dan variables dengan kondisi update atau create
        const query = id
          ? `
            mutation update($payload: PenandatanganPayload!, $id: Int!) {
              updatePenandatangan(payload: $payload, id: $id) {
                id
              }
            }
          `
          : `
            mutation create($payload: PenandatanganPayload!) {
              createPenandatangan(payload: $payload) {
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
            mutation delete($deletePenandatanganId: Int!){
              deletePenandatangan(id: $deletePenandatanganId)
            }
          `,
            variables: {
              deletePenandatanganId: +id,
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

  getDataDashboard: async ( token: any) => {

    return withLoading(async () => {
      try {
        // Menyiapkan query dan variables
        const query = `
                query getDashboard {
                    getDashboardBssn {
                      total_approve
                      total_proses
                      total_waiting
                    }
                }
            `;

        // Fetch data dengan variables
        const response = await instanceGraph.post(
          "/graphql",
          {
            query,
            // variables,
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

}

