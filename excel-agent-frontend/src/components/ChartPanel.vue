<template>
  <div class="chart-panel">
    <div class="cp-header">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      <span>Charts</span>
    </div>

    <div v-if="!columns.length" class="cp-empty">
      Generate a spreadsheet first to create charts
    </div>

    <div v-else class="cp-body">
      <div class="cp-controls">
        <div class="cp-field">
          <label>Chart Type</label>
          <select v-model="chartType" class="cp-select">
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
            <option value="doughnut">Doughnut</option>
            <option value="area">Area</option>
          </select>
        </div>
        <div class="cp-field">
          <label>Label Column</label>
          <select v-model="labelCol" class="cp-select">
            <option v-for="col in textColumns" :key="col.id" :value="col.id">{{ col.name }}</option>
          </select>
        </div>
        <div class="cp-field">
          <label>Data Column</label>
          <select v-model="dataCol" class="cp-select">
            <option v-for="col in numericColumns" :key="col.id" :value="col.id">{{ col.name }}</option>
          </select>
        </div>
        <div class="cp-field">
          <label>Title</label>
          <input v-model="chartTitle" class="cp-input" placeholder="Chart title" />
        </div>
        <button class="cp-btn" @click="addChart">Add Chart</button>
      </div>

      <div v-if="charts.length" class="cp-charts">
        <div v-for="(chart, i) in charts" :key="i" class="cp-chart-card">
          <div class="cp-chart-header">
            <span class="cp-chart-title">{{ chart.title || 'Chart' }}</span>
            <button class="cp-chart-del" @click="removeChart(i)">✕</button>
          </div>
          <div class="cp-chart-canvas">
            <canvas :ref="el => setChartRef(el, i)"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default {
  name: 'ChartPanel',
  props: {
    columns: { type: Array, default: () => [] },
    rows: { type: Array, default: () => [] },
    initialCharts: { type: Array, default: () => [] },
  },
  emits: ['charts-change'],
  data() {
    return {
      chartType: 'bar',
      labelCol: '',
      dataCol: '',
      chartTitle: '',
      charts: [],
      chartInstances: [],
    }
  },
  computed: {
    textColumns() {
      return this.columns.filter(c => ['text', 'email', 'url', 'phone'].includes(c.type))
    },
    numericColumns() {
      return this.columns.filter(c => ['number', 'currency', 'percentage'].includes(c.type))
    },
  },
  watch: {
    initialCharts: {
      immediate: true,
      handler(v) {
        if (v?.length) {
          this.charts = v.map(c => ({ ...c }))
          this.$nextTick(() => this.renderAllCharts())
        }
      },
    },
    rows: {
      deep: true,
      handler() { this.renderAllCharts() },
    },
  },
  methods: {
    setChartRef(el, i) {
      if (el) {
        this.$nextTick(() => this.renderChart(el, i))
      }
    },
    addChart() {
      if (!this.labelCol || !this.dataCol) return
      const chart = {
        id: 'chart-' + (this.charts.length + 1),
        type: this.chartType,
        title: this.chartTitle || 'Chart ' + (this.charts.length + 1),
        label_column: this.labelCol,
        data_column: this.dataCol,
      }
      this.charts.push(chart)
      this.$emit('charts-change', this.charts)
      this.chartTitle = ''
      this.$nextTick(() => this.renderAllCharts())
    },
    removeChart(i) {
      if (this.chartInstances[i]) {
        this.chartInstances[i].destroy()
        this.chartInstances.splice(i, 1)
      }
      this.charts.splice(i, 1)
      this.$emit('charts-change', this.charts)
    },
    renderAllCharts() {
      this.$nextTick(() => {
        const canvases = this.$el.querySelectorAll('.cp-chart-canvas canvas')
        canvases.forEach((canvas, i) => {
          if (i < this.charts.length) this.renderChart(canvas, i)
        })
      })
    },
    renderChart(canvas, i) {
      if (!canvas || i >= this.charts.length) return

      if (this.chartInstances[i]) {
        this.chartInstances[i].destroy()
        this.chartInstances[i] = null
      }

      const chart = this.charts[i]
      const labels = this.rows.map(row => {
        const val = row.cells[chart.label_column]
        return val !== undefined && val !== null ? String(val) : ''
      })
      const data = this.rows.map(row => {
        const val = row.cells[chart.data_column]
        return val !== undefined && val !== null ? parseFloat(val) || 0 : 0
      })

      const colors = [
        '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0',
        '#047857', '#065f46', '#0d9488', '#14b8a6', '#2dd4bf',
      ]

      const datasets = []

      if (chart.type === 'pie' || chart.type === 'doughnut') {
        datasets.push({
          data,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderColor: '#0c0c11',
          borderWidth: 2,
        })
      } else {
        datasets.push({
          label: chart.title,
          data,
          backgroundColor: chart.type === 'area' ? 'rgba(5,150,105,0.2)' : 'rgba(5,150,105,0.7)',
          borderColor: '#059669',
          borderWidth: 2,
          fill: chart.type === 'area',
          tension: 0.3,
          pointBackgroundColor: '#059669',
          pointRadius: 3,
        })
      }

      const ctx = canvas.getContext('2d')
      this.chartInstances[i] = new Chart(ctx, {
        type: chart.type === 'area' ? 'line' : chart.type,
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: chart.type !== 'bar' && chart.type !== 'line' && chart.type !== 'area', labels: { color: '#92929d', font: { size: 10 } } },
            title: { display: false },
          },
          scales: (chart.type === 'pie' || chart.type === 'doughnut') ? {} : {
            x: { ticks: { color: '#636370', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
            y: { ticks: { color: '#636370', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' }, beginAtZero: true },
          },
        },
      })
    },
  },
  beforeUnmount() {
    this.chartInstances.forEach(instance => { if (instance) instance.destroy() })
    this.chartInstances = []
  },
}
</script>

<style scoped>
.chart-panel { height: 100%; display: flex; flex-direction: column; background: var(--surface); }
.cp-header { display: flex; align-items: center; gap: 8px; padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 13px; font-weight: 600; color: var(--text-muted); }
.cp-header svg { color: var(--accent); }
.cp-empty { display: flex; align-items: center; justify-content: center; padding: 32px 16px; color: var(--text-dim); font-size: 12px; text-align: center; }
.cp-body { flex: 1; overflow-y: auto; padding: 12px; }
.cp-controls { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.cp-field label { display: block; font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 3px; font-weight: 600; }
.cp-select, .cp-input { width: 100%; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--card); color: var(--text); font-size: 11px; outline: none; font-family: var(--font); }
.cp-select:focus, .cp-input:focus { border-color: rgba(5,150,105,0.3); }
.cp-btn { padding: 7px; border-radius: 6px; border: none; background: var(--accent); color: #fff; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 2px; font-family: var(--font); }
.cp-btn:hover { background: var(--accent-hover); }
.cp-charts { display: flex; flex-direction: column; gap: 12px; }
.cp-chart-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
.cp-chart-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-bottom: 1px solid var(--border); }
.cp-chart-title { font-size: 11px; font-weight: 600; color: var(--text-muted); }
.cp-chart-del { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 11px; padding: 2px 4px; border-radius: 4px; }
.cp-chart-del:hover { background: rgba(255,69,58,0.15); color: var(--red); }
.cp-chart-canvas { padding: 8px; }
.cp-chart-canvas canvas { width: 100% !important; max-height: 180px; }
</style>
