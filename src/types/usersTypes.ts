export interface DataRole {
  id: number
  name: string
  description: string
  active: number
}

export interface ResponseRole {
  data: DataRole[]
  status: number
  message: string
}
