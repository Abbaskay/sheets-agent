import * as XLSX from 'xlsx'

export function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length < 2) return null

  const headers = parseCSVLine(lines[0])
  const columns = headers.map((h, i) => ({
    id: 'col-' + (i + 1),
    name: h.trim(),
    type: inferType(lines.slice(1).map(l => parseCSVLine(l)[i])),
    width: 120,
  }))

  const rows = lines.slice(1).map((line, ri) => {
    const cells = parseCSVLine(line)
    const rowCells = {}
    columns.forEach((col, ci) => {
      rowCells[col.id] = cells[ci] ? convertType(cells[ci].trim(), col.type) : ''
    })
    return { id: 'row-' + (ri + 1), cells: rowCells }
  })

  return {
    title: 'Imported Data',
    description: 'Imported from CSV file',
    format_type: 'table',
    columns,
    rows,
    summary: { total_rows: rows.length, key_insights: [] },
  }
}

export function parseXLSX(buffer) {
  const wb = XLSX.read(buffer, { type: 'array' })
  const wsname = wb.SheetNames[0]
  const ws = wb.Sheets[wsname]
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 })

  if (data.length < 2) return null

  const headers = data[0]
  const columns = headers.map((h, i) => ({
    id: 'col-' + (i + 1),
    name: String(h || 'Column ' + (i + 1)),
    type: i === 0 ? 'text' : 'number',
    width: 120,
  }))

  const rows = data.slice(1).map((row, ri) => {
    if (!row || !row.length) return null
    const rowCells = {}
    columns.forEach((col, ci) => {
      const val = row[ci]
      rowCells[col.id] = val !== undefined ? val : ''
    })
    return { id: 'row-' + (ri + 1), cells: rowCells }
  }).filter(Boolean)

  return {
    title: wsname || 'Imported Data',
    description: 'Imported from Excel file',
    format_type: 'table',
    columns,
    rows,
    summary: { total_rows: rows.length, key_insights: [] },
  }
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function inferType(values) {
  const numbers = values.filter(v => v && !isNaN(parseFloat(v))).length
  if (numbers > values.length / 2) return isCurrency(values) ? 'currency' : 'number'

  if (values.some(v => /^\d{4}-\d{2}-\d{2}/.test(v))) return 'date'
  if (values.some(v => /@/.test(v))) return 'email'
  return 'text'
}

function isCurrency(values) {
  const currencyCount = values.filter(v => /[\$€£¥]/.test(String(v))).length
  return currencyCount > values.length / 3
}

function convertType(val, type) {
  if (type === 'number' || type === 'currency') {
    const cleaned = String(val).replace(/[$,€£¥\s]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? val : num
  }
  return val
}
