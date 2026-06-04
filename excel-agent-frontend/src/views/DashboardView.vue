<template>
  <div class="dashboard-page">
    <div class="dashboard-bg">
      <div class="dashboard-bg-orb orb-1"></div>
      <div class="dashboard-bg-orb orb-2"></div>
    </div>

    <header class="dashboard-header">
      <router-link :to="{ name: 'App' }" class="dashboard-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back
      </router-link>
      <div class="dashboard-logo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <span>ExcelAgent</span>
      </div>
      <router-link :to="{ name: 'App' }" class="dashboard-new-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Sheet
      </router-link>
    </header>

    <main class="dashboard-main">
      <!-- Stats Row -->
      <div class="dashboard-stats" v-if="spreadsheets.length">
        <div class="d-stat">
          <span class="d-stat-num">{{ spreadsheets.length }}</span>
          <span class="d-stat-label">Total Sheets</span>
        </div>
        <div class="d-stat">
          <span class="d-stat-num">{{ recentCount }}</span>
          <span class="d-stat-label">Created This Month</span>
        </div>
        <div class="d-stat">
          <span class="d-stat-num">{{ totalRows }}</span>
          <span class="d-stat-label">Total Rows</span>
        </div>
      </div>

      <!-- Search -->
      <div class="dashboard-toolbar" v-if="spreadsheets.length">
        <div class="d-search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" placeholder="Search spreadsheets..." />
        </div>
      </div>

      <!-- Header -->
      <div class="dashboard-top">
        <h1>My Spreadsheets</h1>
        <span class="d-count" v-if="filtered.length">{{ filtered.length }} sheet{{ filtered.length !== 1 ? 's' : '' }}</span>
      </div>

      <!-- Empty State -->
      <div v-if="!spreadsheets.length" class="dashboard-empty">
        <div class="d-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        </div>
        <h2>No spreadsheets yet</h2>
        <p>Create your first AI-powered spreadsheet</p>
        <router-link :to="{ name: 'App' }" class="d-empty-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Spreadsheet
        </router-link>
      </div>

      <!-- No search results -->
      <div v-else-if="!filtered.length" class="dashboard-empty">
        <div class="d-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h2>No results</h2>
        <p>Try a different search term</p>
      </div>

      <!-- Grid -->
      <div class="dashboard-grid" v-if="filtered.length">
        <div v-for="s in filtered" :key="s.id" class="d-card" @click="openSpreadsheet(s)">
          <button class="d-card-delete" @click.stop="deleteSpreadsheet(s)" title="Delete spreadsheet">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div class="d-card-thumb">
            <div class="d-card-thumb-grid">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="15" y1="21" x2="15" y2="9"/></svg>
            </div>
          </div>
          <div class="d-card-info">
            <div class="d-card-title">{{ s.title || 'Untitled' }}</div>
            <div class="d-card-meta">
              <span class="d-card-date">{{ s.date }}</span>
              <span class="d-card-rows" v-if="s.sheetData?.rows">{{ s.sheetData.rows.length }} rows</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'DashboardView',
  data() {
    return { spreadsheets: [], search: '' }
  },
  computed: {
    filtered() {
      if (!this.search.trim()) return this.spreadsheets
      const q = this.search.toLowerCase()
      return this.spreadsheets.filter(s =>
        (s.title || '').toLowerCase().includes(q) ||
        (s.prompt || '').toLowerCase().includes(q)
      )
    },
    recentCount() {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const currentMonth = `${now.getMonth() + 1}/${now.getFullYear()}`
      return this.spreadsheets.filter(s => {
        if (s.date) {
          return s.date.includes(`/${now.getFullYear()}`) ||
            s.date === new Date().toLocaleDateString() ||
            (s.date && monthStart <= new Date(s.date))
        }
        return true
      }).length
    },
    totalRows() {
      return this.spreadsheets.reduce((sum, s) => sum + (s.sheetData?.rows?.length || 0), 0)
    },
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      try {
        const saved = localStorage.getItem('excelagent_spreadsheets')
        if (saved) this.spreadsheets = JSON.parse(saved)
      } catch {}
    },
    openSpreadsheet(s) {
      this.$router.push(`/app?spreadsheet=${s.id}`)
    },
    deleteSpreadsheet(s) {
      if (!confirm(`Delete "${s.title || 'Untitled'}"?`)) return
      this.spreadsheets = this.spreadsheets.filter(x => x.id !== s.id)
      localStorage.setItem('excelagent_spreadsheets', JSON.stringify(this.spreadsheets))
    },
  },
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ─── Background ─── */
.dashboard-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.dashboard-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
  animation: float 15s ease-in-out infinite;
}
.dashboard-bg-orb.orb-1 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(5,150,105,0.2), transparent 70%);
  top: -60px; right: -60px;
}
.dashboard-bg-orb.orb-2 {
  width: 250px; height: 250px;
  background: radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%);
  bottom: -60px; left: -60px;
  animation-delay: -7s;
}

/* ─── Header ─── */
.dashboard-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  border-bottom: 1px solid var(--border);
  background: rgba(10,10,18,0.8);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 1;
}
.dashboard-back {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.15s;
}
.dashboard-back:hover { color: var(--accent); }
.dashboard-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  margin-right: auto;
}
.dashboard-new-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}
.dashboard-new-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(5,150,105,0.3);
}

/* ─── Main ─── */
.dashboard-main {
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 24px;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* ─── Stats ─── */
.dashboard-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.d-stat {
  flex: 1;
  background: rgba(22,22,42,0.5);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
}
.d-stat-num {
  display: block;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  background: linear-gradient(135deg, #34d399, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.d-stat-label {
  font-size: 11px;
  color: var(--text-dim);
  margin-top: 2px;
}

/* ─── Toolbar ─── */
.dashboard-toolbar {
  margin-bottom: 16px;
}
.d-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.d-search-wrap svg {
  position: absolute;
  left: 12px;
  color: var(--text-dim);
  pointer-events: none;
}
.d-search-wrap input {
  width: 100%;
  padding: 9px 12px 9px 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.03);
  color: var(--text);
  font-size: 13px;
  font-family: var(--font);
  outline: none;
  transition: all 0.2s;
}
.d-search-wrap input:focus {
  border-color: var(--accent);
  background: rgba(255,255,255,0.05);
  box-shadow: 0 0 0 3px rgba(5,150,105,0.06);
}
.d-search-wrap input::placeholder { color: var(--text-dim); }

/* ─── Top ─── */
.dashboard-top {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 20px;
}
.dashboard-top h1 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.d-count {
  font-size: 12px;
  color: var(--text-dim);
  font-weight: 500;
}

/* ─── Empty ─── */
.dashboard-empty {
  text-align: center;
  padding: 60px 24px;
}
.d-empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(22,22,42,0.5);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: var(--text-dim);
}
.dashboard-empty h2 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
}
.dashboard-empty p {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 24px;
}
.d-empty-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}
.d-empty-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(5,150,105,0.3);
}

/* ─── Grid ─── */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.d-card {
  cursor: pointer;
  border-radius: var(--radius);
  overflow: hidden;
  background: rgba(22,22,42,0.5);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  transition: all 0.3s;
  position: relative;
  animation: fadeInUp 0.4s ease-out both;
}
.d-card:nth-child(1) { animation-delay: 0s; }
.d-card:nth-child(2) { animation-delay: 0.05s; }
.d-card:nth-child(3) { animation-delay: 0.1s; }
.d-card:nth-child(4) { animation-delay: 0.15s; }
.d-card:nth-child(5) { animation-delay: 0.2s; }
.d-card:nth-child(6) { animation-delay: 0.25s; }
.d-card-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.4);
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
  z-index: 2;
}
.d-card:hover .d-card-delete { opacity: 1; }
.d-card-delete:hover { background: rgba(239,68,68,0.85); color: #fff; }

.d-card:hover {
  border-color: rgba(5,150,105,0.3);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.2), 0 0 30px rgba(5,150,105,0.05);
}

.d-card-thumb {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0f1e, #16162a);
  position: relative;
  overflow: hidden;
}
.d-card-thumb::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(10,10,18,0.6));
}
.d-card-thumb-grid svg {
  opacity: 0.6;
}

.d-card-info {
  padding: 14px;
}
.d-card-title {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}
.d-card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.d-card-date {
  font-size: 11px;
  color: var(--text-dim);
}
.d-card-rows {
  font-size: 10px;
  color: var(--accent);
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(5,150,105,0.1);
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .dashboard-header { padding: 14px 16px; }
  .dashboard-stats { flex-direction: column; gap: 10px; }
  .dashboard-grid { grid-template-columns: 1fr; }
}
</style>
