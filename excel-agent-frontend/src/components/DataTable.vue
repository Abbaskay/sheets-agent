<template>
  <div class="data-table-wrap" ref="wrapRef">
    <div ref="hotContainer" class="hot-container"></div>
  </div>
</template>

<script>
import Handsontable from 'handsontable'
import 'handsontable/styles/ht-theme-classic.min.css'

export default {
  name: 'DataTable',
  props: {
    columns: { type: Array, default: () => [] },
    rows: { type: Array, default: () => [] },
    formulas: { type: Array, default: () => [] },
    formatting: { type: Object, default: () => ({}) },
  },
  emits: ['data-change'],
  data() {
    return { hot: null, observer: null, lastSelection: null }
  },
  watch: {
    columns: { deep: true, handler() { this.scheduleRebuild() } },
    rows: { deep: true, handler() { this.scheduleRebuild() } },
  },
  methods: {
    scheduleRebuild() {
      this.$nextTick(() => this.rebuildHot())
    },
    rebuildHot() {
      if (this.hot) { this.hot.destroy(); this.hot = null }
      this.$nextTick(() => this.initHot())
    },
    getContainerSize() {
      if (!this.$refs.wrapRef) return { width: 800, height: 400 }
      return {
        width: this.$refs.wrapRef.clientWidth,
        height: this.$refs.wrapRef.clientHeight,
      }
    },
    initHot() {
      if (!this.$refs.hotContainer || !this.columns.length) return

      const self = this
      const data = this.rows.map(row =>
        this.columns.map(col => {
          const val = row.cells[col.id]
          return val !== undefined && val !== null ? val : ''
        })
      )

      const hotColumns = this.columns.map(col => ({
        type: self.hotType(col.type),
        numericFormat: col.type === 'currency' ? { style: 'currency', currency: 'USD' } :
                       col.type === 'percentage' ? { style: 'percent' } : undefined,
        width: col.width || 100,
      }))

      this.hot = new Handsontable(this.$refs.hotContainer, {
        data,
        colHeaders: this.columns.map(c => c.name),
        columns: hotColumns,
        rowHeaders: true,
        width: '100%',
        height: '100%',
        minSpareRows: 200,
        minSpareCols: 5,
        licenseKey: 'non-commercial-and-evaluation',
        contextMenu: {
          items: {
            row_above: {}, row_below: {}, col_left: {}, col_right: {},
            remove_row: {}, remove_col: {},
            separator1: Handsontable.plugins.ContextMenu.SEPARATOR,
            copy: {}, cut: {},
            separator2: Handsontable.plugins.ContextMenu.SEPARATOR,
            alignment: {},
            sep3: Handsontable.plugins.ContextMenu.SEPARATOR,
            readOnly: {},
          },
        },
        fillHandle: true,
        undo: true,
        sortIndicator: true,
        columnSorting: true,
        autoWrapRow: true,
        autoWrapCol: true,
        enterMoves: { row: 1, col: 0 },
        tabMoves: { row: 0, col: 1 },
        stretchH: 'all',
        rowHeights: 28,
        manualColumnResize: true,
        manualRowResize: true,
        selectionMode: 'range',
        afterSelection: function(row1, col1, row2, col2) {
          self.lastSelection = [[row1, col1, row2, col2]]
        },
        afterDeselect: function() {
          self.lastSelection = null
        },
        afterRenderer: function(td, row, col, prop, value, cellProperties) {
          if (cellProperties.fontWeight) td.style.fontWeight = cellProperties.fontWeight
          if (cellProperties.fontStyle) td.style.fontStyle = cellProperties.fontStyle
          if (cellProperties.textDecoration) td.style.textDecoration = cellProperties.textDecoration
          if (cellProperties.textAlign) td.style.textAlign = cellProperties.textAlign
          if (cellProperties.fontFamily) td.style.fontFamily = cellProperties.fontFamily
          if (cellProperties.fontSize) td.style.fontSize = cellProperties.fontSize
        },
        afterChange(changes, source) {
          if (source === 'loadData' || !changes) return
          const updated = {}
          for (const [row, col, oldVal, newVal] of changes) {
            const colId = self.columns[col]?.id
            const rowId = self.rows[row]?.id
            if (!colId || !rowId) continue
            if (!updated[rowId]) updated[rowId] = {}
            updated[rowId][colId] = newVal
          }
          if (Object.keys(updated).length) self.$emit('data-change', updated)
        },
      })
    },
    getHot() {
      return this.hot
    },
    getSelection() {
      if (this.hot) {
        const s = this.hot.getSelected()
        if (s && s.length) return s
      }
      return this.lastSelection
    },
    applyStyle(styleProps) {
      if (!this.hot) return
      const selected = this.hot.getSelected()
      if (!selected) return
      for (const [rowStart, colStart, rowEnd, colEnd] of selected) {
        for (let r = rowStart; r <= rowEnd; r++) {
          for (let c = colStart; c <= colEnd; c++) {
            const meta = this.hot.getCellMeta(r, c) || {}
            Object.assign(meta, styleProps)
            this.hot.setCellMeta(r, c, '__custom_style', JSON.stringify(styleProps))
          }
        }
      }
      this.hot.render()
    },
    insertRow(direction) {
      if (!this.hot) return
      const selected = this.hot.getSelected()
      if (selected) {
        const row = direction === 'above' ? selected[0][0] : selected[0][0] + 1
        this.hot.alter('insert_row', row)
      }
    },
    insertCol(direction) {
      if (!this.hot) return
      const selected = this.hot.getSelected()
      if (selected) {
        const col = direction === 'left' ? selected[0][1] : selected[0][1] + 1
        this.hot.alter('insert_col', col)
      }
    },
    deleteRow() {
      if (!this.hot) return
      const selected = this.hot.getSelected()
      if (selected) this.hot.alter('remove_row', selected[0][0], selected[0][2] - selected[0][0] + 1)
    },
    deleteCol() {
      if (!this.hot) return
      const selected = this.hot.getSelected()
      if (selected) this.hot.alter('remove_col', selected[0][1], selected[0][3] - selected[0][1] + 1)
    },
    autoSum() {
      if (!this.hot) return
      const selected = this.hot.getSelected()
      if (!selected) return
      const [rowStart, colStart, rowEnd, colEnd] = selected[0]
      const sumRow = rowEnd + 1
      let formula = '=SUM(' + this.hotColumnLetter(colStart) + (rowStart + 1) + ':' + this.hotColumnLetter(colEnd) + (rowEnd + 1) + ')'
      this.hot.setDataAtCell(sumRow, colStart, formula)
    },
    hotColumnLetter(index) {
      let letter = ''
      let i = index
      while (i >= 0) {
        letter = String.fromCharCode(65 + (i % 26)) + letter
        i = Math.floor(i / 26) - 1
      }
      return letter
    },
    hotType(type) {
      switch (type) {
        case 'number': case 'currency': case 'percentage': return 'numeric'
        case 'date': return 'date'
        default: return 'text'
      }
    },
  },
  mounted() {
    this.initHot()
    this.observer = new ResizeObserver(() => {
      if (this.hot) this.hot.render()
    })
    if (this.$refs.wrapRef) this.observer.observe(this.$refs.wrapRef)
  },
  beforeUnmount() {
    if (this.observer) this.observer.disconnect()
    if (this.hot) { this.hot.destroy(); this.hot = null }
  },
}
</script>

<style scoped>
.data-table-wrap { width: 100%; height: 100%; position: relative; overflow: hidden; background: #ffffff; }
.hot-container { width: 100%; height: 100%; background: #ffffff; }

/* Force light theme on handsontable (override dark-mode CSS variables) */
:deep(.handsontable) {
  --ht-background-color: #ffffff;
  --ht-background-secondary-color: #f8f9fa;
  --ht-cell-background-color: #ffffff;
  --ht-cell-hover-background-color: #f0f5ff;
  --ht-header-row-background-color: #f0f0f0;
  --ht-colors-white: #ffffff;
  --ht-colors-palette-50: #f8f9fa;
  --ht-colors-palette-100: #f0f0f0;
  --ht-colors-palette-800: #e0e0e0;
  --ht-colors-palette-900: #d0d0d0;
  --ht-colors-palette-950: #cccccc;
  --ht-colors-transparent: transparent;
  --ht-border-color: #d4d4d4;
  --ht-cell-border-color: #d4d4d4;
  --ht-cell-editor-background: #ffffff;
  --ht-cell-editor-color: #1a1a1a;
  --ht-cell-text-color: #1a1a1a;
  --ht-header-text-color: #1a1a1a;
  --ht-primary-text-color: #1a1a1a;
  --ht-secondary-text-color: #555555;
  --ht-cell-editor-border-color: #4682b4;
  background: #ffffff !important;
}
:deep(.ht_master) { background: #ffffff; }
:deep(.ht_master .wtHolder) { background: #ffffff; }
:deep(.handsontable table.htCore) { background: #ffffff; }
:deep(.handsontable td) { background: #ffffff !important; }
:deep(.handsontable th) { background: #f8f9fa !important; }
:deep(.handsontable .htCore td) { background: #ffffff !important; border: 1px solid #d4d4d4; }
:deep(.handsontable .htCore th) { background: #f0f0f0 !important; border: 1px solid #d4d4d4; }
:deep(.htCore td) {
  font-size: 12px;
  padding: 2px 6px;
  font-family: var(--font);
  background: #ffffff !important;
  color: #1a1a1a !important;
}
:deep(.htCore th) {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 6px;
  position: relative;
  background: #f0f0f0 !important;
  color: #1a1a1a !important;
}
:deep(.handsontableInput) {
  background: #ffffff !important;
  color: #1a1a1a !important;
  caret-color: #1a1a1a !important;
}
:deep(.handsontable .currentRow) { background: #f0f7ff !important; }
:deep(.handsontable .currentCol) { background: #f0f7ff !important; }
:deep(.handsontable .htHighlight) { background: #e8f4ff !important; }
:deep(.handsontable td.area) { background: rgba(70,130,180,0.04) !important; }
:deep(.handsontableInputHolder) { background: #ffffff; }
:deep(.handsontable .wtBorder) { background: #4682b4 !important; }
:deep(.handsontable .manualColumnResizer) {
  cursor: col-resize;
  width: 5px;
}
:deep(.handsontable .manualRowResizer) {
  cursor: row-resize;
  height: 5px;
}
:deep(.handsontableInput) {
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 12px !important;
}
:deep(.htContextMenu) {
  border-radius: 8px;
  overflow: hidden;
}
</style>
