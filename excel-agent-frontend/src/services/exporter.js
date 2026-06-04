import * as XLSX from 'xlsx'

export function exportCSV(sheetData, filename = 'spreadsheet.csv') {
  const { columns, rows } = sheetData
  if (!columns || !rows) return

  const headers = columns.map(c => c.name)
  const data = rows.map(row => columns.map(col => {
    const val = row.cells[col.id]
    return val !== undefined && val !== null ? val : ''
  }))

  let csv = headers.join(',') + '\n'
  for (const row of data) {
    const escaped = row.map(cell => {
      const str = String(cell)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"'
      }
      return str
    })
    csv += escaped.join(',') + '\n'
  }

  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename)
}

export function exportJSON(sheetData, filename = 'spreadsheet.json') {
  const blob = new Blob([JSON.stringify(sheetData, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

export function exportXLSX(sheetData, filename = 'spreadsheet.xlsx') {
  const { title, columns, rows } = sheetData
  if (!columns || !rows) return

  const headers = columns.map(c => c.name)
  const data = rows.map(row => columns.map(col => {
    const val = row.cells[col.id]
    return val !== undefined && val !== null ? val : ''
  }))

  data.unshift(headers)

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)

  ws['!cols'] = columns.map(c => ({ wch: Math.ceil((c.width || 100) / 7) }))

  XLSX.utils.book_append_sheet(wb, ws, title || 'Sheet1')
  const excelData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  downloadBlob(new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename)
}

export function exportHTML(sheetData, filename = 'spreadsheet.html') {
  const { title, description, columns, rows, summary } = sheetData
  if (!columns || !rows) return

  let html = `<html><head><meta charset="utf-8"><title>${title || 'Spreadsheet'}</title>`
  html += `<style>body{font-family:system-ui,sans-serif;padding:24px}table{border-collapse:collapse;width:100%}th,td{padding:8px 12px;border:1px solid #ddd;text-align:left}th{background:#f5f5f5;font-weight:600}tr:nth-child(even){background:#fafafa}</style></head><body>`
  if (title) html += `<h1>${title}</h1>`
  if (description) html += `<p>${description}</p>`
  html += '<table><thead><tr>'

  for (const col of columns) html += `<th>${col.name}</th>`
  html += '</tr></thead><tbody>'

  for (const row of rows) {
    html += '<tr>'
    for (const col of columns) {
      const val = row.cells[col.id]
      let display = val !== undefined && val !== null ? val : ''
      if (col.type === 'currency' && typeof val === 'number') display = '$' + val.toLocaleString()
      html += `<td>${display}</td>`
    }
    html += '</tr>'
  }
  html += '</tbody></table>'

  if (summary?.key_insights?.length) {
    html += '<h3>Key Insights</h3><ul>'
    for (const insight of summary.key_insights) html += `<li>${insight}</li>`
    html += '</ul>'
  }

  html += '</body></html>'
  downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8;' }), filename)
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}
