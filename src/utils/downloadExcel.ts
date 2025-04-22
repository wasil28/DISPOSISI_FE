import { utils, writeFile, writeFileXLSX } from 'xlsx'

export const downloadExcel = (data: any, filename: string) => {
  const workbook = utils.book_new()
  data.forEach((item: any, index: number) => {
    const worksheet = utils.json_to_sheet(item.data)
    utils.book_append_sheet(workbook, worksheet, item.sheetName ?? `Sheet${index + 1}`)
  })
  writeFileXLSX(workbook, filename)
}

export const downloadCsv = (data: any, filename: string) => {
  const workbook = utils.book_new()
  const worksheet = utils.json_to_sheet(data[0].data)
  utils.book_append_sheet(workbook, worksheet)
  writeFile(workbook, filename, { bookType: 'csv' })
}
