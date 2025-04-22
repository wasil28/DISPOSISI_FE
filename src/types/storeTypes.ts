interface mainStateClients {
  id: number
  avatar: string
  login: string
  name: string
  email: string
  company: string
  city: string
  progress: number
  created: string
}

interface mainStateHistory {
  amount: number
  name: string
  date: string
  type: string
  business: string
}

export interface mainState {
  clients: mainStateClients[]
  history: mainStateHistory[]
}

export interface menuStore {
  b_id: number
  b_name: string
  b_alias: string
  b_seq: number
  pid: number
  url: string
  icon_cls: string
  allow_view: number
  allow_new: number
  allow_edit: number
  allow_delete: number
  allow_print: number
  allow_approve: number
}

export interface menuAside {
  label: string
  icon: string
  menu: menuAside[]
  to: string
}
