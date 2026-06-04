export function evaluateFormula(expression, getCellValue) {
  if (!expression || !expression.startsWith('=')) return null

  const expr = expression.substring(1).trim()

  try {
    return parseExpression(expr, getCellValue)
  } catch {
    return '#ERROR!'
  }
}

function parseExpression(expr, getCellValue) {
  expr = expr.trim()

  if (expr.startsWith('SUM(')) return aggregateFunc(expr, 'SUM', getCellValue, (a, b) => a + b, 0)
  if (expr.startsWith('AVERAGE(')) return aggregateFunc(expr, 'AVERAGE', getCellValue, (a, b) => a + b, 0, true)
  if (expr.startsWith('COUNT(')) return aggregateFunc(expr, 'COUNT', getCellValue, (a) => a + 1, 0, false, true)
  if (expr.startsWith('MIN(')) return aggregateFunc(expr, 'MIN', getCellValue, Math.min, Infinity)
  if (expr.startsWith('MAX(')) return aggregateFunc(expr, 'MAX', getCellValue, Math.max, -Infinity)
  if (expr.startsWith('IF(')) return ifFunc(expr, getCellValue)

  return evalSimpleMath(expr, getCellValue)
}

function aggregateFunc(expr, name, getCellValue, operation, initial, isAverage, isCount) {
  const inner = expr.slice(name.length + 1, -1).trim()
  const ranges = inner.split(',').map(s => s.trim())

  const values = []
  for (const range of ranges) {
    const resolved = resolveRange(range, getCellValue)
    for (const v of resolved) {
      if (isCount) {
        if (v !== null && v !== undefined && v !== '') values.push(v)
      } else {
        const num = parseNum(v)
        if (num !== null) values.push(num)
      }
    }
  }

  if (values.length === 0) return isCount ? 0 : null

  if (isCount) return values.length

  let result = initial
  for (const v of values) {
    if (initial === Infinity) {
      result = Math.min(result, v)
    } else if (initial === -Infinity) {
      result = Math.max(result, v)
    } else {
      result = operation(result, v)
    }
  }

  if (isAverage) return values.length > 0 ? +(result / values.length).toFixed(2) : null
  return +result.toFixed(2)
}

function ifFunc(expr, getCellValue) {
  const inner = expr.slice(3, -1).trim()
  const parts = splitTopLevel(inner, ',')

  if (parts.length < 2) return '#ERROR!'

  const condition = parts[0].trim()
  const trueVal = parts[1].trim()
  const falseVal = parts[2] ? parts[2].trim() : null

  const result = evalSimpleMath(condition, getCellValue)
  if (result) {
    const t = parseFloat(trueVal)
    return isNaN(t) ? trueVal : t
  } else if (falseVal !== null) {
    const f = parseFloat(falseVal)
    return isNaN(f) ? falseVal : f
  }
  return false
}

function evalSimpleMath(expr, getCellValue) {
  const resolved = expr.replace(/[A-Z]+[0-9]+/gi, (match) => {
    const val = getCellValue(match.toUpperCase())
    const n = parseNum(val)
    return n !== null ? String(n) : '0'
  })

  try {
    const sanitized = resolved.replace(/[^0-9+\-*/.() ]/g, '')
    if (!sanitized.trim()) return null
    const result = Function('"use strict"; return (' + sanitized + ')')()
    return isFinite(result) ? +result.toFixed(2) : '#DIV/0!'
  } catch {
    return '#VALUE!'
  }
}

function resolveRange(range, getCellValue) {
  range = range.toUpperCase().trim()

  const colonIdx = range.indexOf(':')
  if (colonIdx === -1) {
    const v = getCellValue(range)
    return [v]
  }

  const start = range.slice(0, colonIdx)
  const end = range.slice(colonIdx + 1)

  const startCol = start.match(/[A-Z]+/)[0]
  const startRow = parseInt(start.match(/[0-9]+/)[0])
  const endCol = end.match(/[A-Z]+/)[0]
  const endRow = parseInt(end.match(/[0-9]+/)[0])

  const values = []
  const cols = [startCol, endCol]
  const minRow = Math.min(startRow, endRow)
  const maxRow = Math.max(startRow, endRow)

  const colLetters = getColumnLetters(startCol, endCol)

  for (const col of colLetters) {
    for (let row = minRow; row <= maxRow; row++) {
      const ref = col + row
      const v = getCellValue(ref)
      values.push(v)
    }
  }

  return values
}

function getColumnLetters(startCol, endCol) {
  const cols = []
  const startIdx = colToNum(startCol)
  const endIdx = colToNum(endCol)
  const min = Math.min(startIdx, endIdx)
  const max = Math.max(startIdx, endIdx)

  for (let i = min; i <= max; i++) {
    cols.push(numToCol(i))
  }
  return cols
}

function colToNum(col) {
  let num = 0
  for (let i = 0; i < col.length; i++) {
    num = num * 26 + (col.charCodeAt(i) - 64)
  }
  return num
}

function numToCol(num) {
  let col = ''
  while (num > 0) {
    const rem = (num - 1) % 26
    col = String.fromCharCode(65 + rem) + col
    num = Math.floor((num - 1) / 26)
  }
  return col
}

function parseNum(val) {
  if (val === null || val === undefined || val === '') return null
  if (typeof val === 'number') return val
  const cleaned = String(val).replace(/[$,€£¥\s]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function splitTopLevel(str, delimiter) {
  const parts = []
  let depth = 0
  let current = ''

  for (const ch of str) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === delimiter && depth === 0) {
      parts.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current) parts.push(current)
  return parts
}
