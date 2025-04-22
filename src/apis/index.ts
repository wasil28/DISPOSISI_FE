// utils/api/index.js
import { UserApi } from './users/user.api'
import { RoleApi } from './users/role.api'
import { ModuleApi } from './users/module.api'
import { SitusApi } from './users/situs.api'
import { AuthApi } from './users/auth.api'
import { LoginApi } from './users/login.api'
import { OtorisasiApi } from './users/otorisasi.api'
import { Srs } from './external/srs'

// Master
import { MasterUmum } from './referensi/masterUmum.api'

// Asign Penugasan
import { AssignPenugasanApi } from './bssn/assign-penugasan.api'

// Pejabat Penandatangan
import { PejabatPenandatanganApi } from './bssn/pejabat-penandatangan.api'

import { handleApiError, handleGraphError, returnDataGraph, withLoading } from '~/utils/error.handler'

export {
  // Utilitas
  UserApi,
  RoleApi,
  ModuleApi,
  SitusApi,
  AuthApi,
  LoginApi,
  OtorisasiApi,

  // Integrasi
  Srs,

  // Referensi
  MasterUmum,
  
  // Asign Penugasan
  AssignPenugasanApi,

  // Pejabat Penandatangan
  PejabatPenandatanganApi,

  // Error handler
  handleApiError,
  returnDataGraph,
  handleGraphError,
  withLoading,
}
