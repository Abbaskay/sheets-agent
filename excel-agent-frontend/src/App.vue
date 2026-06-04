<template>
  <div class="app" :class="{ 'workspace-active': workspaceActive }">
    <div class="toast" :class="toast.visible ? 'show' : ''" :style="{ background: toast.color }">{{ toast.text }}</div>
    <input type="file" ref="fileInput" accept=".csv,.xlsx,.tsv,.txt" style="display:none" @change="onFileImport" />
    <LoginModal :visible="showLoginModal" agent-name="ExcelAgent" @close="showLoginModal = false" @logged-in="onLoggedIn" />

    <router-view v-if="isStandaloneRoute" />

    <template v-else-if="isAppRoute">
      <!-- Landing Page -->
      <div v-if="!workspaceActive" class="landing">
        <div class="lp-bg">
          <div class="lp-bg-orb orb-1"></div>
          <div class="lp-bg-orb orb-2"></div>
          <div class="lp-bg-grid"></div>
        </div>
        <header class="lp-header">
          <div class="lp-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            <span>AI Sheets</span>
          </div>
          <nav class="lp-nav">
            <router-link :to="{ name: 'Dashboard' }" class="lp-h-link">My Spreadsheets</router-link>
            <router-link :to="{ name: 'Pricing' }" class="lp-h-link">Pricing</router-link>
          </nav>
          <div class="lp-header-right">
            <template v-if="isAuthenticated">
              <div class="user-menu" ref="userMenu">
                <button @click="userMenuOpen = !userMenuOpen" class="user-trigger">
                  <span class="user-avatar">{{ userInitial }}</span>
                  <span class="user-name">{{ authState.user?.name || 'User' }}</span>
                  <span class="user-plan">{{ authState.plan }}</span>
                </button>
                <Transition name="menu">
                  <div class="user-dropdown" v-if="userMenuOpen">
                    <div class="ud-user">
                      <span class="ud-name">{{ authState.user?.name || 'User' }}</span>
                      <span class="ud-email">{{ authState.user?.email || '' }}</span>
                    </div>
                    <div class="ud-usage">
                      <div class="ud-u-label">Sheets this month</div>
                      <div class="ud-u-bar"><div class="ud-u-fill" :style="{ width: usagePercent + '%' }"></div></div>
                      <div class="ud-u-text">{{ authState.usage.generated }} / {{ authState.usageLimit.generated }}</div>
                    </div>
                    <router-link :to="{ name: 'Settings' }" class="ud-item" @click="userMenuOpen = false">Settings</router-link>
                    <router-link :to="{ name: 'Pricing' }" class="ud-item" @click="userMenuOpen = false">Billing & Plan</router-link>
                    <div class="ud-divider"></div>
                    <button class="ud-item ud-logout" @click="handleLogout">Sign out</button>
                  </div>
                </Transition>
              </div>
            </template>
            <template v-else>
              <router-link :to="{ name: 'Login' }" class="lp-h-link">Sign in</router-link>
              <router-link :to="{ name: 'Signup' }" class="lp-h-btn">Get Started</router-link>
            </template>
          </div>
        </header>

        <ExcelLanding
          v-model="prompt"
          :format-type="formatType"
          :loading="loading"
          :recent-prompts="recentPrompts"
          @update:format-type="formatType = $event"
          @send="doLandingSend"
          @upload="importFile"
          @use-history="useHistoryPrompt"
          @clear-history="clearHistory"
        />
      </div>

      <!-- Workspace -->
      <div v-else class="full-workspace">
        <!-- Top Nav Bar -->
        <header class="top-nav">
          <div class="tn-left">
            <button class="tn-btn" @click="goToLanding" title="Back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <button class="tn-btn" @click="menuOpen = !menuOpen" title="Menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <Transition name="menu">
              <div class="tn-dropdown" v-if="menuOpen" @click.self="menuOpen = false">
                <div class="tn-dd-item" @click="menuOpen = false; goToLanding()">New Spreadsheet</div>
                <div class="tn-dd-item" @click="menuOpen = false; importFile()">Import CSV/XLSX</div>
                <div class="tn-dd-item" @click="menuOpen = false; $refs.dataTable?.getHot()?.getPlugin('columnSorting')?.clearSort()">Clear Sort</div>
                <div class="tn-dd-divider"></div>
                <div class="tn-dd-item" @click="menuOpen = false; $router.push('/dashboard')">My Spreadsheets</div>
                <div class="tn-dd-item" @click="menuOpen = false; $router.push('/pricing')">Pricing</div>
              </div>
            </Transition>
          </div>
          <div class="tn-center">
            <span class="tn-title">AI Sheets</span>
          </div>
          <div class="tn-right">
            <button class="tn-btn" @click="goToLanding" title="New Spreadsheet">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </button>
            <div class="user-menu" ref="wsUserMenu">
              <button @click="userMenuOpen = !userMenuOpen" class="user-trigger ws-user-trigger">
                <span class="user-avatar">{{ userInitial }}</span>
              </button>
            </div>
          </div>
        </header>

        <div class="ws-body">
          <!-- Left AI Panel -->
          <aside class="ai-panel">
            <div class="ai-hero" v-if="!sheetData">
              <h2 class="ai-hero-title">Unleash the Power of<br/>AI Sheets</h2>
              <ul class="ai-hero-list">
                <li><span class="ai-bullet">✦</span> Auto-find companies, people, papers, products, or anything</li>
                <li><span class="ai-bullet">✦</span> Transform your existing data into powerful insights and visuals</li>
                <li><span class="ai-bullet">✦</span> Work with your data freely — auto-search, analyze or visualize</li>
              </ul>
            </div>

            <div class="ai-chat-section">
              <div class="ai-chat-card">
                <div class="ai-chat-header">
                  <div class="ai-chat-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>
                    AI Sheets Mode
                  </div>
                </div>

                <div class="ai-chat-messages" ref="chatMessages">
                  <div v-if="!messages.length && !loading" class="ai-chat-empty">
                    <p>Ask anything, create anything</p>
                  </div>
                  <div v-for="(msg, i) in messages" :key="i" :class="['ai-msg', msg.role]">
                    <div class="ai-msg-content">{{ msg.text }}</div>
                  </div>
                  <div v-if="loading" class="ai-msg agent">
                    <div class="ai-msg-content"><span class="loading-dots"><span>.</span><span>.</span><span>.</span></span></div>
                  </div>
                </div>

                <div class="ai-chat-input-area">
                  <textarea
                    v-model="chatText"
                    placeholder="Ask anything, create anything"
                    rows="2"
                    @keydown="onChatKeydown"
                  ></textarea>
                  <div class="ai-input-controls">
                    <div class="ai-input-left">
                      <button class="ai-ctrl-btn upload-btn" @click="importFile" title="Upload CSV">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </button>
                      <div v-if="sheetData" class="ai-file-badge" title="Click to view file info">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <span>{{ sheetData.rows?.length || 0 }} rows</span>
                      </div>
                      <select class="ai-model-select" v-model="selectedModel">
                        <option value="standard">Standard</option>
                        <option value="deep">Deep Research</option>
                      </select>
                    </div>
                  <div class="ai-input-right">
                  </div>
                </div>
              </div>
              </div>
            </div>

            <div class="ai-panel-footer">
              <div class="ai-file-info" v-if="sheetData">
                <span class="ai-file-name">{{ sheetData.title || 'Untitled' }}</span>
                <span class="ai-file-rows">{{ sheetData.rows?.length || 0 }} rows</span>
              </div>
            </div>
          </aside>

          <!-- Spreadsheet Workspace -->
          <main class="spreadsheet-workspace">
            <!-- File Controls Bar -->
            <div class="file-bar" v-if="sheetData">
              <div class="fb-left">
                <span class="fb-file-btn open-files" @click="importFile">Open Files</span>
                <div class="export-wrap" ref="exportWrap">
                  <span class="fb-file-btn export-btn" @click="exportOpen = !exportOpen">Export ▾</span>
                  <Transition name="menu">
                    <div class="export-menu" v-if="exportOpen">
                      <button class="em-item" @click="doExport('csv')">CSV</button>
                      <button class="em-item" @click="doExport('json')">JSON</button>
                      <button class="em-item" @click="doExport('xlsx')">XLSX</button>
                      <button class="em-item" @click="doExport('html')">HTML</button>
                    </div>
                  </Transition>
                </div>
              </div>
              <div class="fb-right">
                <span class="fb-file-btn" @click="toggleFullscreen" title="Fullscreen">⛶ Fullscreen</span>
              </div>
            </div>

            <!-- Ribbon Toolbar -->
            <RibbonToolbar v-if="sheetData" @action="handleToolbarAction" />

            <!-- Formula Bar -->
            <div class="formula-bar" v-if="sheetData">
              <div class="fb-name-box" @click="focusCellName">A1</div>
              <div class="fb-formula">
                <button class="fb-fx-btn" @click="cancelEdit" title="Cancel">✕</button>
                <button class="fb-fx-btn" @click="confirmEdit" title="Confirm">✓</button>
                <button class="fb-fx-btn" @click="insertFunction" title="Insert Function">fx</button>
                <input class="fb-input" v-model="formulaText" placeholder="Enter value or formula" @keydown.enter="confirmEdit" />
              </div>
            </div>

            <!-- Grid Area -->
            <div class="grid-area">
              <div v-if="loading && !sheetData" class="generating-overlay">
                <div class="gen-bg">
                  <div class="gen-bg-orb orb-1"></div>
                  <div class="gen-bg-orb orb-2"></div>
                </div>
                <div class="gen-content">
                  <div class="gen-icon-wrap">
                    <div class="gen-icon-ring"></div>
                    <div class="gen-icon-ring gen-icon-ring-2"></div>
                    <div class="gen-icon">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/><line x1="3" y1="15" x2="12" y2="15"/><line x1="15" y1="21" x2="15" y2="9"/></svg>
                    </div>
                  </div>
                  <h3 class="gen-title">Generating Your Spreadsheet</h3>
                  <div class="gen-status">{{ genStatus }}</div>
                  <div class="gen-progress">
                    <div class="gen-progress-bar">
                      <div class="gen-progress-fill" :style="{ width: genProgress + '%' }"></div>
                    </div>
                    <div class="gen-progress-label">{{ genProgress }}%</div>
                  </div>
                  <p class="gen-hint">This usually takes a few seconds</p>
                </div>
              </div>
              <div v-if="loading && sheetData" class="loading-bar"><div class="loading-bar-inner"></div></div>
              <div v-if="!sheetData && !loading" class="grid-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                <span>Your spreadsheet will appear here</span>
              </div>
              <div v-if="sheetData" class="grid-container">
                <DataTable
                  ref="dataTable"
                  :columns="sheetData.columns"
                  :rows="sheetData.rows"
                  :formulas="sheetData.formulas || []"
                  :formatting="sheetData.formatting || {}"
                  @data-change="onDataChange"
                />
              </div>
            </div>

            <!-- Sheet Bar -->
            <div class="sheet-bar" v-if="sheetData">
              <div class="sb-left">
                <button class="sb-nav" @click="prevSheet" title="Previous sheet">◀</button>
                <span class="sb-tab active" @click="renameSheet">Sheet1</span>
                <button class="sb-nav" @click="nextSheet" title="Next sheet">▶</button>
                <button class="sb-add" @click="addSheet" title="Add sheet">+</button>
              </div>
              <div class="sb-status">Ready</div>
              <div class="sb-zoom">
                <button class="sb-zoom-btn" @click="zoomOut">−</button>
                <input type="range" min="50" max="200" :value="zoomLevel" @input="setZoom($event.target.value)" class="sb-zoom-slider" />
                <span class="sb-zoom-pct">{{ zoomLevel }}%</span>
                <button class="sb-zoom-btn" @click="zoomIn">+</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import api, { excelAPI } from './services/api.js'
import { authState } from './store/auth.js'
import ExcelLanding from './components/ExcelLanding.vue'
import DataTable from './components/DataTable.vue'
import RibbonToolbar from './components/RibbonToolbar.vue'
import LoginModal from '@shared/LoginModal.vue'
import { exportCSV, exportJSON, exportXLSX, exportHTML } from './services/exporter.js'

export default {
  name: 'App',
  components: { ExcelLanding, DataTable, RibbonToolbar, LoginModal },
  data() {
    return {
      prompt: '',
      workspaceActive: false,
      formatType: 'auto',
      sheetData: null,
      loading: false,
      chatText: '',
      messages: [],
      conversationId: '',
      toast: { text: '', visible: false, color: '#a78bfa' }, toastTimer: null,
      userMenuOpen: false, showLoginModal: false, pendingAction: null, spreadsheetId: null,
      exportOpen: false, menuOpen: false, formulaText: '', zoomLevel: 100, selectedModel: 'standard',
      genStatus: 'Analyzing your request...',
      genProgress: 0,
      genTimer: null,
      genStatuses: [
        'Analyzing your request...',
        'Researching data sources...',
        'Generating spreadsheet data...',
        'Structuring columns and rows...',
        'Applying formatting...',
        'Building charts and visuals...',
        'Finalizing your spreadsheet...',
      ],
    }
  },
  computed: {
    isAuthenticated() { return authState.isAuthenticated },
    authState() { return authState },
    userInitial() { return (authState.user?.name || 'U')[0].toUpperCase() },
    usagePercent() {
      const max = authState.usageLimit.generated || 1
      return Math.min((authState.usage.generated / max) * 100, 100)
    },
    recentPrompts() {
      try { return JSON.parse(localStorage.getItem('excelagent_prompts') || '[]') }
      catch { return [] }
    },
    isStandaloneRoute() {
      return ['Welcome', 'Pricing', 'Settings', 'Dashboard', 'AuthCallback', 'Login', 'Signup'].includes(this.$route?.name)
    },
    isAppRoute() { return this.$route?.name === 'App' },
  },
  methods: {
    genId() {
      if (crypto.randomUUID) return crypto.randomUUID()
      const bytes = crypto.getRandomValues(new Uint8Array(16))
      bytes[6] = (bytes[6] & 0x0f) | 0x40
      bytes[8] = (bytes[8] & 0x3f) | 0x80
      return [...bytes].map((b, i) => {
        const hex = b.toString(16).padStart(2, '0')
        return [4, 6, 8, 10].includes(i) ? `-${hex}` : hex
      }).join('').slice(1)
    },
    toastMsg(text, color = '#a78bfa') {
      this.toast.text = text; this.toast.color = color; this.toast.visible = true
      clearTimeout(this.toastTimer)
      this.toastTimer = setTimeout(() => { this.toast.visible = false }, 2800)
    },
    startGeneratingAnimation() {
      this.genProgress = 0
      this.genStatus = 'Analyzing your request...'
      let step = 0
      clearInterval(this.genTimer)
      this.genTimer = setInterval(() => {
        step++
        if (step < this.genStatuses.length) {
          this.genStatus = this.genStatuses[step]
        }
        const target = Math.min(step * 14, 92)
        if (this.genProgress < target) {
          this.genProgress = target
        }
      }, 900)
    },
    stopGeneratingAnimation() {
      clearInterval(this.genTimer)
      this.genProgress = 100
      this.genStatus = 'Done!'
    },
    onLoggedIn(data) {
      authState.login(data.token, data.user, data.user?.subscription ? data.user : null)
      this.showLoginModal = false
      this.$nextTick(() => {
        const action = this.pendingAction
        this.pendingAction = null
        if (action === 'doLandingSend') { this.doLandingSend() }
        else if (action === 'sendChat') { this.sendChat() }
      })
    },
    async doLandingSend() {
      if (!this.prompt.trim() || this.loading) return
      if (!this.isAuthenticated) {
        this.pendingAction = 'doLandingSend'
        this.showLoginModal = true
        return
      }
      if (authState.isOverLimit) {
        this.toastMsg('You\'ve hit your monthly limit.', '#ff9f0a')
        this.$router.push({ name: 'Pricing' })
        return
      }
      this.messages = [{ role: 'user', text: this.prompt }]
      this.workspaceActive = true; this.loading = true
      this.startGeneratingAnimation()
      this.conversationId = this.genId()
      this.sheetData = null
      try {
        const a = excelAPI()
        const res = await a.generate(this.prompt, null, this.formatType, this.conversationId)
        let raw = res.data.reply || res.data.data?.outputs?.text || res.data.data?.outputs?.result || res.data.data?.outputs?.output
        if (!raw) throw new Error('No output')
        raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0])
          this.sheetData = data
          this.messages.push({ role: 'agent', text: `Generated "${data.title}" with ${data.rows?.length || 0} rows!` })
          this.toastMsg(`Spreadsheet with ${data.rows?.length || 0} rows generated!`)
          this.savePromptHistory(this.prompt)
          this.saveSpreadsheet()
        } else throw new Error('Invalid JSON')
      } catch (e) {
        this.messages.push({ role: 'agent', text: 'Generation failed. Please try again.' })
        this.toastMsg('Generation failed', '#ff453a')
      } finally { this.stopGeneratingAnimation(); this.loading = false }
    },
    async sendChat() {
      if (!this.chatText.trim() || this.loading) return
      if (!this.isAuthenticated) {
        this.pendingAction = 'sendChat'
        this.showLoginModal = true
        return
      }
      const text = this.chatText
      this.messages.push({ role: 'user', text }); this.chatText = ''
      this.loading = true
      this.startGeneratingAnimation()

      if (!this.sheetData) {
        this.prompt = text
        this.workspaceActive = true
        this.conversationId = this.genId()
        try {
          const a = excelAPI()
          const res = await a.generate(text, null, this.formatType, this.conversationId)
          let raw = res.data.reply || res.data.data?.outputs?.text || res.data.data?.outputs?.result || res.data.data?.outputs?.output
          if (!raw) throw new Error('No output')
          raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
          const jm = raw.match(/\{[\s\S]*\}/)
          if (jm) {
            this.sheetData = JSON.parse(jm[0])
            this.messages.push({ role: 'agent', text: `Generated "${this.sheetData.title}" with ${this.sheetData.rows?.length || 0} rows!` })
            this.toastMsg(`Spreadsheet with ${this.sheetData.rows?.length || 0} rows generated!`)
            this.saveSpreadsheet()
          } else throw new Error('Invalid JSON')
        } catch { this.messages.push({ role: 'agent', text: 'Generation failed.' }) }
        finally { this.stopGeneratingAnimation(); this.loading = false }
        return
      }

      try {
        const a = excelAPI()
        const res = await a.refine(text, JSON.stringify(this.sheetData), this.conversationId)
        let raw = res.data.reply || res.data.data?.outputs?.text || res.data.data?.outputs?.result || res.data.data?.outputs?.output
        if (!raw) throw new Error('No response')
        raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
        const jm = raw.match(/\{[\s\S]*\}/)
        if (jm) {
          this.sheetData = JSON.parse(jm[0])
          this.messages.push({ role: 'agent', text: 'Updated! Check out the changes.' })
          this.saveSpreadsheet()
        } else this.messages.push({ role: 'agent', text: raw })
      } catch { this.messages.push({ role: 'agent', text: 'Refinement failed.' }) }
      finally { this.stopGeneratingAnimation(); this.loading = false }
    },
    onChatKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.sendChat()
      }
    },
    goToLanding() {
      this.workspaceActive = false; this.loading = false; this.sheetData = null
      this.messages = []; this.prompt = ''
    },
    onDataChange(updatedCells) {
      if (!this.sheetData) return
      const rows = this.sheetData.rows.map(row => {
        if (updatedCells[row.id]) return { ...row, cells: { ...row.cells, ...updatedCells[row.id] } }
        return row
      })
      this.sheetData = { ...this.sheetData, rows }
      this.saveSpreadsheet()
    },
    handleToolbarAction(action) {
      const dt = this.$refs.dataTable
      if (!dt) return
      const hot = dt.getHot()
      if (!hot) return
      const sel = dt.getSelection()

      if (!sel) {
        if (!['paste', 'copy', 'cut', 'sortAsc', 'filter', 'fontFamily', 'fontSize', 'numberFormat'].includes(typeof action === 'string' ? action : action.type)) {
          this.toastMsg('Click a cell first', '#ff9f0a')
          return
        }
        if (['fontFamily', 'fontSize', 'numberFormat'].includes(typeof action === 'string' ? action : action.type)) {
          this.toastMsg('Select a cell first', '#ff9f0a')
          return
        }
      }

      const applyToCells = (prop, value, toggle) => {
        if (!sel) return
        for (const [r1, c1, r2, c2] of sel) {
          for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
              const td = hot.getCell(r, c)
              if (!td) continue
              const current = hot.getCellMeta(r, c)
              if (toggle) {
                const isActive = current[prop] === value || td.style[prop] === value
                const newVal = isActive ? '' : value
                hot.setCellMeta(r, c, prop, newVal)
                td.style[prop] = newVal
              } else {
                hot.setCellMeta(r, c, prop, value)
                td.style[prop] = value
              }
            }
          }
        }
      }

      switch (typeof action === 'string' ? action : action.type) {
        case 'bold': applyToCells('fontWeight', 'bold', true); break
        case 'italic': applyToCells('fontStyle', 'italic', true); break
        case 'underline': applyToCells('textDecoration', 'underline', true); break
        case 'alignLeft': applyToCells('textAlign', 'left', false); break
        case 'alignCenter': applyToCells('textAlign', 'center', false); break
        case 'alignRight': applyToCells('textAlign', 'right', false); break
        case 'fontFamily': applyToCells('fontFamily', action.value, false); break
        case 'fontSize': applyToCells('fontSize', action.value + 'px', false); break
        case 'numberFormat': this.applyNumberFormat(hot, action.value); break
        case 'insertRowAbove': dt.insertRow('above'); break
        case 'deleteRow': dt.deleteRow(); break
        case 'autoSum': dt.autoSum(); break
        case 'sortAsc': {
          const col = sel[0][1]
          hot.getPlugin('columnSorting').sort({ column: col, sortOrder: 'asc' })
          break
        }
        case 'filter': this.toastMsg('Filter — coming soon', '#ff9f0a'); break
        case 'copy': {
          const selectedData = hot.getData(sel[0][0], sel[0][1], sel[sel.length-1][2], sel[sel.length-1][3])
          const csv = selectedData.map(r => r.join('\t')).join('\n')
          navigator.clipboard?.writeText(csv).catch(() => {})
          break
        }
        case 'cut': {
          const cutData = hot.getData(sel[0][0], sel[0][1], sel[sel.length-1][2], sel[sel.length-1][3])
          const csv = cutData.map(r => r.join('\t')).join('\n')
          navigator.clipboard?.writeText(csv).catch(() => {})
          for (const [r1, c1, r2, c2] of sel) {
            for (let r = r1; r <= r2; r++) {
              for (let c = c1; c <= c2; c++) { hot.setDataAtCell(r, c, '') }
            }
          }
          break
        }
        case 'paste': {
          navigator.clipboard?.readText().then(text => {
            if (!text) return
            const rows = text.split('\n').filter(r => r)
            const [r1, c1] = sel[0]
            rows.forEach((row, ri) => {
              const cols = row.split('\t')
              cols.forEach((val, ci) => { hot.setDataAtCell(r1 + ri, c1 + ci, val) })
            })
          }).catch(() => {
            this.toastMsg('Paste requires clipboard permission', '#ff9f0a')
          })
          break
        }
      }
    },
    applyNumberFormat(hot, format) {
      const dt = this.$refs.dataTable
      const sel = dt ? dt.getSelection() : hot.getSelected()
      if (!sel) return
      for (const [r1, c1, r2, c2] of sel) {
        for (let r = r1; r <= r2; r++) {
          for (let c = c1; c <= c2; c++) {
            const td = hot.getCell(r, c)
            if (!td) continue
            const val = hot.getDataAtCell(r, c)
            if (format === 'Currency') {
              hot.setDataAtCell(r, c, typeof val === 'number' ? '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2 }) : val)
            } else if (format === 'Percentage') {
              hot.setDataAtCell(r, c, val + '%')
            } else if (format === 'Number') {
              hot.setDataAtCell(r, c, typeof val === 'number' ? val.toLocaleString('en-US', { minimumFractionDigits: 2 }) : val)
            }
          }
        }
      }
    },
    doExport(format) {
      this.exportOpen = false
      if (!this.sheetData) return
      const title = (this.sheetData.title || 'spreadsheet').replace(/\s+/g, '_').toLowerCase()
      switch (format) {
        case 'csv': exportCSV(this.sheetData, `${title}.csv`); break
        case 'json': exportJSON(this.sheetData, `${title}.json`); break
        case 'xlsx': exportXLSX(this.sheetData, `${title}.xlsx`); break
        case 'html': exportHTML(this.sheetData, `${title}.html`); break
      }
      this.toastMsg(`Exported as ${format.toUpperCase()}`)
    },
    importFile() {
      this.$refs.fileInput?.click()
    },
    async onFileImport(e) {
      const file = e.target.files?.[0]
      if (!file) return
      const isXLSX = file.name.endsWith('.xlsx')
      try {
        const reader = new FileReader()
        const result = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          if (isXLSX) {
            reader.readAsArrayBuffer(file)
          } else {
            reader.readAsText(file)
          }
        })
        const mod = await import('./services/importer.js')
        const data = isXLSX ? mod.parseXLSX(result) : (file.name.endsWith('.csv') || file.name.endsWith('.tsv') || file.name.endsWith('.txt') ? mod.parseCSV(result) : null)
        if (data) {
          this.sheetData = data
          this.workspaceActive = true
          this.conversationId = this.genId()
          this.messages.push({ role: 'user', text: `Uploaded ${file.name}` })
          this.messages.push({ role: 'agent', text: `Imported **${file.name}** with **${data.rows?.length || 0} rows** and **${data.columns?.length || 0} columns**. You can now ask me to sort, filter, edit, or analyze this data.` })
          this.toastMsg(`Imported ${data.rows?.length || 0} rows from ${file.name}`)
        } else {
          this.toastMsg('Could not parse file. Try CSV format.', '#ff9f0a')
        }
      } catch (err) {
        console.error('Import error:', err)
        this.toastMsg('Failed to import file.', '#ff453a')
      }
      e.target.value = ''
    },
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },
    focusCellName() {
      this.toastMsg('Cell: A1 — click a cell to select', '#888')
    },
    cancelEdit() {
      const hot = this.$refs.dataTable?.getHot()
      if (hot) hot.getActiveEditor()?.discardEditor()
    },
    confirmEdit() {
      const dt = this.$refs.dataTable
      const hot = dt?.getHot()
      if (hot && this.formulaText) {
        const sel = dt?.getSelection()
        if (sel) {
          hot.setDataAtCell(sel[0][0], sel[0][1], this.formulaText)
          this.formulaText = ''
        }
      }
    },
    insertFunction() {
      this.toastMsg('Select a cell and type =SUM, =AVERAGE, =COUNT, =MIN, or =MAX', '#34d399')
    },
    prevSheet() { this.toastMsg('Sheet 1 of 1', '#888') },
    nextSheet() { this.toastMsg('Sheet 1 of 1', '#888') },
    addSheet() { this.toastMsg('Multi-sheet support coming soon', '#ff9f0a') },
    renameSheet() { this.toastMsg('Double-click sheet tab to rename', '#888') },
    zoomIn() {
      this.zoomLevel = Math.min(200, this.zoomLevel + 10)
      this.applyZoom()
    },
    zoomOut() {
      this.zoomLevel = Math.max(50, this.zoomLevel - 10)
      this.applyZoom()
    },
    setZoom(val) {
      this.zoomLevel = Number(val)
      this.applyZoom()
    },
    applyZoom() {
      const hot = this.$refs.dataTable?.getHot()
      if (hot) hot.render()
    },
    savePromptHistory(prompt) {
      try {
        const data = JSON.parse(localStorage.getItem('excelagent_prompts') || '[]')
        data.unshift(prompt)
        if (data.length > 20) data.length = 20
        localStorage.setItem('excelagent_prompts', JSON.stringify(data))
      } catch {}
    },
    saveSpreadsheet() {
      if (!this.sheetData) return
      try {
        const data = JSON.parse(localStorage.getItem('excelagent_spreadsheets') || '[]')
        const existing = data.findIndex(d => d.id === this.spreadsheetId)
        const entry = {
          id: this.spreadsheetId || this.genId(),
          title: this.sheetData.title || this.prompt?.slice(0, 50) || 'Untitled',
          date: new Date().toLocaleDateString(),
          prompt: this.prompt,
          sheetData: this.sheetData,
        }
        this.spreadsheetId = entry.id
        if (existing >= 0) data[existing] = entry
        else data.unshift(entry)
        localStorage.setItem('excelagent_spreadsheets', JSON.stringify(data))
      } catch {}
    },
    useHistoryPrompt(p) { this.prompt = p },
    clearHistory() { localStorage.removeItem('excelagent_prompts') },
    checkTokenOnFocus() {
      if (!authState.isAuthenticated) return
      const stored = localStorage.getItem('excelagent_auth')
      if (!stored) { authState.logout(); this.goToLanding(); this.$router.push({ name: 'Welcome' }); return }
      api.get('/api/auth/me').catch(() => {
        if (!localStorage.getItem('excelagent_auth')) { authState.logout(); this.goToLanding(); this.$router.push({ name: 'Welcome' }) }
      })
    },
    handleLogout() { this.userMenuOpen = false; authState.logout(); this.goToLanding(); this.$router.push({ name: 'Welcome' }) },
    checkSpreadsheet() {
      const sid = this.$route.query.spreadsheet
      if (!sid) return
      try {
        const data = JSON.parse(localStorage.getItem('excelagent_spreadsheets') || '[]')
        const doc = data.find(d => d.id === sid)
        if (!doc || !doc.sheetData) return
        this.spreadsheetId = doc.id; this.sheetData = doc.sheetData; this.prompt = doc.prompt || ''
        if (this.sheetData) this.workspaceActive = true
      } catch {}
    },
  },
  mounted() {
    this.checkSpreadsheet()
    this.checkTokenOnFocus()
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') this.checkTokenOnFocus() })
    document.addEventListener('click', (e) => {
      if (this.userMenuOpen && !this.$refs.userMenu?.contains(e.target) && !this.$refs.wsUserMenu?.contains(e.target)) this.userMenuOpen = false
      if (this.exportOpen && !this.$refs.exportWrap?.contains(e.target)) this.exportOpen = false
      if (this.menuOpen && !e.target.closest('.tn-btn, .tn-dropdown')) this.menuOpen = false
    })
  },
}
</script>

<style>
:root {
  --bg: #1a1a1a;
  --surface: #242424;
  --card: #2d2d2d;
  --elevated: #323232;
  --border: rgba(255,255,255,0.08);
  --border-light: rgba(255,255,255,0.12);
  --text: #f5f5f5;
  --text-muted: #c8c8c8;
  --text-dim: #9a9a9a;
  --accent: #21a366;
  --accent-hover: #1ed760;
  --accent-glow: rgba(33,163,102,0.10);
  --green: #1ed760;
  --red: #ef4444;
  --ribbon-bg: #f3f3f3;
  --radius: 20px;
  --radius-sm: 8px;
  --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-display: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'SFMono-Regular', ui-monospace, 'JetBrains Mono', 'Cascadia Code', monospace;
  --nav-h: 44px;
  --filebar-h: 34px;
  --ribbon-h: 76px;
  --formulabar-h: 32px;
  --sheetbar-h: 28px;
}
/* Base reset is in style.css */

.toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(16px); padding: 10px 22px; border-radius: 999px; color: #fff; font-size: 13px; font-weight: 500; z-index: 9999; opacity: 0; transition: all 0.35s cubic-bezier(0.16,1,0.3,1); pointer-events: none; backdrop-filter: blur(12px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); background: var(--elevated); border: 1px solid var(--border); }
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ─── Landing ─── */
.landing { height: 100vh; overflow-y: auto; display: flex; flex-direction: column; position: relative; }

.lp-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.lp-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
  animation: float 12s ease-in-out infinite;
}
.lp-bg-orb.orb-1 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(33,163,102,0.2), transparent 70%);
  top: -80px; right: -80px;
}
.lp-bg-orb.orb-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(30,215,96,0.12), transparent 70%);
  bottom: 10%; left: -80px;
  animation-delay: -5s;
}
.lp-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
  background-size: 60px 60px;
}
.lp-header { display: flex; align-items: center; padding: 14px 28px; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(26,26,26,0.9); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 10; }
.lp-logo { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; font-size: 17px; color: var(--text); }
.lp-logo svg { color: var(--accent); }
.lp-nav { display: flex; align-items: center; gap: 20px; margin-left: 28px; }
.lp-header-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }
.lp-h-link { font-size: 13px; color: var(--text-muted); text-decoration: none; transition: color 0.15s; position: relative; }
.lp-h-link::after { content: ''; position: absolute; inset: auto 0 0 0; height: 1px; background: var(--accent); transform: scaleX(0); transition: transform 0.2s; }
.lp-h-link:hover { color: var(--accent); }
.lp-h-link:hover::after { transform: scaleX(1); }
.lp-h-btn { padding: 7px 18px; border-radius: 999px; background: #21a366; color: #fff; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
.lp-h-btn:hover { background: #1ed760; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(33,163,102,0.3); }

/* ─── Top Nav ─── */
.top-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 14px; background: #202020; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; height: var(--nav-h); position: relative; }
.tn-left, .tn-right { display: flex; align-items: center; gap: 2px; }
.tn-center { position: absolute; left: 50%; transform: translateX(-50%); }
.tn-title { font-family: var(--font-display); font-weight: 700; font-size: 15px; letter-spacing: -0.2px; color: #ffffff; }
.tn-btn { background: none; border: none; color: #ffffff; cursor: pointer; padding: 6px 8px; border-radius: 6px; display: flex; align-items: center; transition: all 0.15s; }
.tn-btn:hover { color: var(--accent); background: rgba(255,255,255,0.05); }
.tn-btn svg { width: 18px; height: 18px; }
.tn-dropdown { position: absolute; top: 100%; left: 0; margin-top: 2px; background: #2d2d2d; border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-sm); box-shadow: 0 8px 32px rgba(0,0,0,0.5); min-width: 180px; z-index: 200; padding: 4px; }
.tn-dd-item { padding: 8px 14px; font-size: 12px; color: #f5f5f5; cursor: pointer; border-radius: 4px; }
.tn-dd-item:hover { background: rgba(255,255,255,0.04); color: #21a366; }
.tn-dd-divider { height: 1px; background: var(--border); margin: 4px 0; }

/* ─── Workspace ─── */
.full-workspace { height: 100vh; display: flex; flex-direction: column; background: var(--bg); }
.ws-body { display: flex; flex: 1; overflow: hidden; }

/* ─── AI Panel ─── */
.ai-panel { width: 40%; min-width: 320px; max-width: 480px; border-right: 1px solid var(--border); background: #1a1a1a; display: flex; flex-direction: column; flex-shrink: 0; overflow: hidden; }
.ai-hero { padding: 20px 24px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
.ai-hero-title { font-family: var(--font-display); font-size: clamp(18px, 2.5vw, 26px); font-weight: 700; line-height: 1.15; margin-bottom: 14px; letter-spacing: -0.5px; color: #f5f5f5; }
.ai-hero-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.ai-hero-list li { font-size: 13px; color: #e0e0e0; line-height: 1.4; display: flex; gap: 10px; }
.ai-bullet { color: #ffffff; flex-shrink: 0; font-size: 10px; margin-top: 7px; }

.ai-chat-section { flex: 1; display: flex; flex-direction: column; min-height: 0; padding: 16px 16px 16px; }
.ai-chat-card { flex: 1; display: flex; flex-direction: column; min-height: 0; background: #2d2d2d; border-radius: 20px; overflow: hidden; }
.ai-chat-header { display: flex; align-items: center; padding: 10px 16px; background: #f0e8e8; flex-shrink: 0; }
.ai-chat-label { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #5a1e35; text-transform: uppercase; letter-spacing: 0.5px; }
.ai-chat-label svg { color: #5a1e35; width: 15px; height: 15px; }

.ai-chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; background: #2d2d2d; }
.ai-chat-empty { display: flex; align-items: center; justify-content: center; padding: 32px 16px; text-align: center; color: #9a9a9a; font-size: 14px; font-weight: 500; }
.ai-msg { display: flex; }
.ai-msg.user { justify-content: flex-end; }
.ai-msg-content { padding: 10px 14px; border-radius: 10px; font-size: 13px; line-height: 1.6; max-width: 100%; word-break: break-word; font-weight: 450; }
.ai-msg.user .ai-msg-content { background: var(--accent); color: #fff; }
.ai-msg.agent .ai-msg-content { background: rgba(255,255,255,0.08); color: #e0e0e0; }

.ai-chat-input-area { background: #323232; padding: 12px 14px; }
.ai-chat-input-area textarea { width: 100%; border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-sm); padding: 12px 14px; font-size: 14px; font-family: var(--font); resize: none; outline: none; background: #2d2d2d; color: #e8e8e8; transition: border-color 0.2s; }
.ai-chat-input-area textarea:focus { border-color: rgba(255,255,255,0.12); }
.ai-chat-input-area textarea::placeholder { color: #9a9a9a; font-size: 14px; }
.ai-input-controls { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.ai-input-left, .ai-input-right { display: flex; align-items: center; gap: 6px; }
.ai-ctrl-btn { width: 32px; height: 32px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: #cfcfcf; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.15s; font-family: var(--font); }
.ai-ctrl-btn:hover { border-color: rgba(255,255,255,0.15); color: #ffffff; background: rgba(255,255,255,0.04); }
.ai-model-select { padding: 5px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); background: #2d2d2d; color: #e0e0e0; font-size: 11px; font-family: var(--font); outline: none; cursor: pointer; }
.ai-model-select option { background: #1a1a1a; color: #e0e0e0; }
.upload-btn { width: 32px; height: 32px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: #cfcfcf; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.upload-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(33,163,102,0.08); }
.ai-file-badge { display: flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 5px; background: rgba(33,163,102,0.1); border: 1px solid rgba(33,163,102,0.2); color: var(--accent); font-size: 11px; font-weight: 500; white-space: nowrap; }

.ai-panel-footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 8px 14px; background: #1a1a1a; }
.ai-file-info { display: flex; justify-content: space-between; font-size: 11px; color: #9a9a9a; }

/* ─── Spreadsheet Workspace ─── */
.spreadsheet-workspace { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #242424; min-width: 0; }

.file-bar { display: flex; justify-content: space-between; align-items: center; padding: 0 12px; background: #242424; border-bottom: 1px solid var(--border); flex-shrink: 0; height: var(--filebar-h); }
.fb-left, .fb-right { display: flex; align-items: center; gap: 8px; }
.fb-file-btn { font-size: 11px; color: var(--text-muted); cursor: pointer; padding: 3px 8px; border-radius: 4px; transition: all 0.15s; }
.fb-file-btn:hover { background: rgba(255,255,255,0.04); color: var(--accent); }
.fb-file-btn.open-files { color: #1ed760; font-weight: 600; }
.fb-file-btn.open-files:hover { color: #22e06a; }
.fb-file-btn.export-btn { color: #000; background: #fff; font-weight: 500; padding: 3px 12px; }
.fb-file-btn.export-btn:hover { background: #f0f0f0; color: #000; }
.export-wrap { position: relative; }
.export-menu { position: absolute; top: 100%; left: 0; margin-top: 4px; background: #2d2d2d; border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-sm); box-shadow: 0 8px 24px rgba(0,0,0,0.4); min-width: 120px; z-index: 100; padding: 4px; }
.em-item { display: block; width: 100%; padding: 6px 12px; border: none; background: none; font-size: 11px; text-align: left; cursor: pointer; border-radius: 4px; color: #f5f5f5; transition: background 0.1s; font-family: var(--font); }
.em-item:hover { background: rgba(255,255,255,0.04); }

/* Formula Bar */
.formula-bar { display: flex; align-items: center; gap: 0; background: #f8f8f8; border-bottom: 1px solid #d0d0d0; flex-shrink: 0; height: var(--formulabar-h); }
.fb-name-box { width: 64px; padding: 0 10px; font-size: 11px; font-weight: 600; color: #303030; font-family: 'SF Mono', 'JetBrains Mono', monospace; border-right: 1px solid #d0d0d0; background: #ffffff; display: flex; align-items: center; height: 100%; flex-shrink: 0; }
.fb-formula { flex: 1; display: flex; align-items: center; gap: 1px; padding: 0 6px; height: 100%; min-width: 0; background: #ffffff; }
.fb-fx-btn { width: 24px; height: 22px; border: 1px solid transparent; background: transparent; color: #555; cursor: pointer; border-radius: 3px; font-size: 10px; font-family: var(--font); display: flex; align-items: center; justify-content: center; }
.fb-fx-btn:hover { background: rgba(0,0,0,0.04); color: #21a366; }
.fb-input { flex: 1; border: none; background: transparent; color: #222; font-size: 12px; font-family: 'SF Mono', 'Courier New', monospace; outline: none; height: 100%; padding: 0 8px; }

/* Grid */
.grid-area { flex: 1; overflow: hidden; position: relative; display: flex; flex-direction: column; background: #ffffff; }
.grid-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #9a9a9a; font-size: 13px; background: #ffffff; }
.grid-container { flex: 1; overflow: hidden; }
.loading-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 10; overflow: hidden; background: rgba(255,255,255,0.04); }
.loading-bar-inner { height: 100%; background: linear-gradient(90deg, transparent, var(--accent), transparent); animation: loadBar 1.5s ease-in-out infinite; width: 40%; }

/* ─── Generating Overlay ─── */
.generating-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #242424;
  overflow: hidden;
  animation: fadeIn 0.3s ease-out;
}
.gen-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.gen-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.25;
  animation: float 10s ease-in-out infinite;
}
.gen-bg-orb.orb-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(33,163,102,0.3), transparent 70%);
  top: 10%; right: 5%;
}
.gen-bg-orb.orb-2 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(30,215,96,0.2), transparent 70%);
  bottom: 10%; left: 5%;
  animation-delay: -5s;
}
.gen-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeInUp 0.5s ease-out;
}
.gen-icon-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.gen-icon-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #21a366;
  border-right-color: rgba(33,163,102,0.3);
  animation: spin 1.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}
.gen-icon-ring-2 {
  inset: 8px;
  border-top-color: rgba(30,215,96,0.5);
  border-right-color: transparent;
  border-bottom-color: #21a366;
  animation-direction: reverse;
  animation-duration: 2.4s;
}
.gen-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(33,163,102,0.15), rgba(33,163,102,0.04));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #21a366;
  z-index: 1;
  animation: genPulse 2s ease-in-out infinite;
}
@keyframes genPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(33,163,102,0.2); }
  50% { box-shadow: 0 0 0 12px rgba(33,163,102,0); }
}
.gen-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}
.gen-status {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 20px;
  min-height: 20px;
  transition: opacity 0.2s;
  animation: fadeIn 0.3s ease-out;
}
.gen-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 240px;
}
.gen-progress-bar {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
}
.gen-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #21a366, #1ed760);
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.gen-progress-label {
  font-size: 11px;
  color: #21a366;
  font-weight: 600;
  font-family: 'SF Mono', monospace;
  min-width: 32px;
  text-align: right;
}
.gen-hint {
  font-size: 11px;
  color: var(--text-dim);
  margin-top: 16px;
}

/* Sheet Bar */
.sheet-bar { display: flex; align-items: center; justify-content: space-between; padding: 0 10px; background: #222222; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; height: var(--sheetbar-h); }
.sb-left { display: flex; align-items: center; gap: 2px; }
.sb-nav { background: none; border: none; color: #9a9a9a; cursor: pointer; padding: 0 6px; font-size: 10px; height: 100%; display: flex; align-items: center; }
.sb-nav:hover { color: #ffffff; }
.sb-tab { padding: 2px 12px; border-radius: 3px 3px 0 0; font-size: 11px; color: #9a9a9a; background: transparent; border: 1px solid rgba(255,255,255,0.06); border-bottom: none; cursor: pointer; height: 22px; display: flex; align-items: center; }
.sb-tab.active { background: #ffffff; color: #21a366; border-color: #21a366; }
.sb-add { width: 22px; height: 22px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.06); background: transparent; color: #9a9a9a; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.sb-add:hover { border-color: #ffffff; color: #ffffff; }
.sb-status { font-size: 11px; color: #9a9a9a; }
.sb-zoom { display: flex; align-items: center; gap: 6px; }
.sb-zoom-btn { background: none; border: none; color: #9a9a9a; cursor: pointer; font-size: 14px; padding: 0 4px; height: 100%; display: flex; align-items: center; }
.sb-zoom-btn:hover { color: #ffffff; }
.sb-zoom-slider { width: 64px; height: 2px; appearance: none; background: rgba(255,255,255,0.15); border-radius: 999px; outline: none; }
.sb-zoom-slider::-webkit-slider-thumb { appearance: none; width: 10px; height: 10px; border-radius: 50%; background: #ffffff; cursor: pointer; }
.sb-zoom-pct { font-size: 10px; color: #9a9a9a; min-width: 30px; text-align: center; font-family: 'SF Mono', monospace; }

.user-menu { position: relative; }
.user-trigger { display: flex; align-items: center; gap: 6px; padding: 4px 8px 4px 4px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08); background: transparent; cursor: pointer; transition: all 0.15s; font-family: var(--font); }
.user-trigger:hover { border-color: #ffffff; background: rgba(255,255,255,0.03); }
.ws-user-trigger { padding: 3px; border-color: transparent; }
.ws-user-trigger:hover { border-color: #ffffff; }
.user-avatar { width: 24px; height: 24px; border-radius: 50%; background: #21a366; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.user-name { font-size: 12px; color: #f5f5f5; font-weight: 500; }
.user-plan { font-size: 9px; color: #9a9a9a; text-transform: uppercase; letter-spacing: 0.3px; background: rgba(255,255,255,0.04); padding: 1px 6px; border-radius: 4px; }
.user-dropdown { position: absolute; top: 100%; right: 0; margin-top: 6px; background: #2d2d2d; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.4); min-width: 220px; z-index: 100; padding: 4px; }
.ud-user { padding: 10px 12px 6px; }
.ud-name { display: block; font-size: 13px; font-weight: 600; color: #f5f5f5; }
.ud-email { display: block; font-size: 11px; color: #9a9a9a; margin-top: 1px; }
.ud-usage { padding: 8px 12px 6px; }
.ud-u-label { font-size: 10px; color: #9a9a9a; margin-bottom: 4px; }
.ud-u-bar { height: 4px; background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden; margin-bottom: 3px; }
.ud-u-fill { height: 100%; border-radius: 999px; background: #21a366; transition: width 0.3s; }
.ud-u-text { font-size: 10px; color: #c8c8c8; }
.ud-item { display: flex; align-items: center; width: 100%; padding: 8px 12px; border: none; background: none; font-size: 12px; text-align: left; cursor: pointer; border-radius: 6px; color: #f5f5f5; text-decoration: none; transition: background 0.15s; font-family: var(--font); }
.ud-item:hover { background: rgba(255,255,255,0.04); }
.ud-logout { color: #ef4444; }
.ud-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 3px 0; }

/* loading-dots keys in style.css */

.menu-enter-active { animation: fadeInUp 0.2s cubic-bezier(0.16,1,0.3,1); }
.menu-leave-active { animation: fadeIn 0.15s reverse; }
</style>
