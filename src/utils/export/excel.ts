import excelJs from 'exceljs'
import { Response } from 'express'

type ValidationFn = (cell: excelJs.Cell, rowNumber: number) => void

export type ColumnValidation = {
  key: string
  validate: ValidationFn
}

export type ExportDataToExcelType = {
  res: Response
  filename: string
  sheetName: string
  columns: Partial<excelJs.Column>[]
  dataToExport: object[]
  validations?: ColumnValidation[]
}

export async function exportDataToExcel({
  res,
  filename,
  sheetName,
  columns,
  dataToExport,
  validations = [],
}: ExportDataToExcelType) {
  const workbook = new excelJs.Workbook()

  const allowedKeys = columns.map((col) => col.key)
  const rows = dataToExport.map((obj) => {
    const row: Record<string, unknown> = {}
    allowedKeys.forEach((key) => {
      if (key && key in obj) {
        row[key] = obj[key as keyof typeof obj]
      }
    })
    return row
  })

  const sheet = workbook.addWorksheet(sheetName)
  sheet.columns = columns
  sheet.addRows(rows)

  validations.forEach(({ key, validate }) => {
    const colIndex = sheet.columns.findIndex((col) => col.key === key) + 1
    if (colIndex <= 0) return
    sheet.getColumn(colIndex).eachCell((cell, rowNumber) => {
      if (rowNumber === 1) return
      return validate(cell, rowNumber)
    })
  })
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`)
  await workbook.xlsx.write(res)
}
