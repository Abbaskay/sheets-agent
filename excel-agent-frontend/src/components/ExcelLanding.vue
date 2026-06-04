<template>
  <div class="excel-landing">
    <div class="lp-content">
      <div class="lp-hero">
        <div class="lp-badge">AI-Powered Spreadsheet Studio</div>
        <h1>
          <span class="lh-line1">Describe your <span class="lh-accent">spreadsheet</span></span>
        </h1>
        <p>Tell AI what data you need — budgets, inventories, comparisons, timelines, and more.</p>
      </div>

      <div class="lp-prompt-wrap">
        <div class="lp-prompt-inner">
          <textarea
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            @keydown="onKeydown"
            placeholder='e.g. "Build a Q4 budget for a 50-person marketing team" or "Compare pricing of top 8 project management tools"'
            rows="4"
          ></textarea>
        </div>

        <div class="lp-upload-row">
          <button class="lp-upload-btn" @click="$emit('upload')" title="Upload CSV or Excel file">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload CSV
          </button>
        </div>

        <div class="lp-controls">
          <div class="lp-control-group">
            <label>Format</label>
            <div class="lp-chips">
              <button
                v-for="fmt in formats"
                :key="fmt.value"
                :class="['lp-chip', { active: formatType === fmt.value }]"
                @click="$emit('update:format-type', fmt.value)"
              >
                {{ fmt.label }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="recentPrompts.length" class="lp-history">
          <div class="lp-h-label">
            Recent prompts
            <button @click="$emit('clear-history')" class="lp-h-clear">Clear</button>
          </div>
          <div class="lp-h-items">
            <button v-for="(p, i) in recentPrompts.slice(0, 5)" :key="i" class="lp-h-item" @click="$emit('use-history', p)">
              {{ p.slice(0, 60) }}{{ p.length > 60 ? '…' : '' }}
            </button>
          </div>
        </div>

        <button @click="$emit('send')" class="lp-generate-btn" :disabled="!modelValue.trim() || loading">
          <svg v-if="loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          {{ loading ? 'Generating...' : 'Generate Spreadsheet' }}
        </button>
      </div>

      <div class="lp-templates">
        <div class="lp-templates-header">
          <h2>Quick templates</h2>
          <span class="lp-templates-count">{{ templates.length }} templates</span>
        </div>
        <div class="lp-t-grid">
          <button v-for="(tpl, i) in templates" :key="tpl.label" class="lp-t-card" @click="useTemplate(tpl)" :style="{ animationDelay: `${i * 0.04}s` }">
            <div class="lp-t-icon" v-html="tpl.icon"></div>
            <div class="lp-t-label">{{ tpl.label }}</div>
            <div class="lp-t-desc">{{ tpl.desc }}</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExcelLanding',
  props: {
    modelValue: String,
    formatType: { type: String, default: 'auto' },
    loading: Boolean,
    recentPrompts: { type: Array, default: () => [] },
  },
  emits: ['update:modelValue', 'update:format-type', 'send', 'upload', 'use-history', 'clear-history'],
  data() {
    return {
      formats: [
        { value: 'auto', label: 'Auto' },
        { value: 'table', label: 'Table' },
        { value: 'financial', label: 'Financial' },
        { value: 'timeline', label: 'Timeline' },
        { value: 'inventory', label: 'Inventory' },
        { value: 'comparison', label: 'Comparison' },
      ],
      templates: [
        { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>', label: 'Department Budget', desc: 'Q4 budget with categories, budgeted vs actual, variance', prompt: 'Create a Q4 department budget spreadsheet for a marketing team with 6 departments: Social Media, Content, SEO, Paid Ads, Events, and Tools. Include columns for Budgeted Amount, Actual Spent, Variance, and Status. Use realistic amounts between $5,000 and $50,000. Add a formula for total in each column and a bar chart comparing Budgeted vs Actual.', type: 'financial' },
        { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>', label: 'Pricing Comparison', desc: 'SaaS competitor pricing across plans and features', prompt: 'Compare pricing of the top 8 project management tools including Asana, Monday.com, ClickUp, Trello, Notion, Wrike, Jira, and Basecamp. Include columns for Product, Free Plan, Pro Price, Business Price, Seats Included, and Key Features. Add a formula showing average price and a bar chart comparing Pro prices.', type: 'comparison' },
        { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>', label: 'Project Timeline', desc: 'Phased project plan with dates, owners, and status', prompt: 'Create a product launch timeline spreadsheet with 10 tasks across 4 phases: Planning, Development, Testing, and Launch. Include columns for Phase, Task, Owner, Start Date, End Date, Duration (days), Status, and Priority. Use realistic sequential dates starting from next month. Add a pie chart showing status distribution.', type: 'timeline' },
        { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>', label: 'Inventory Register', desc: 'Stock tracker with quantities, values, and reorder alerts', prompt: 'Create an inventory register for an electronics warehouse with 12 items. Include columns for Item Name, SKU, Category, Quantity in Stock, Unit Price, Total Value, Reorder Level, and Status. Calculate total value as Quantity × Unit Price. Mark items below reorder level. Add a bar chart showing stock levels by item. Use realistic electronics items like laptops, monitors, keyboards, etc.', type: 'inventory' },
        { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>', label: 'Expense Report', desc: 'Monthly expenses by category with totals', prompt: 'Create a monthly expense report for a small business with 8 expense categories: Office Supplies, Software Subscriptions, Travel, Meals & Entertainment, Utilities, Rent, Marketing, and Salaries. Include columns for Category, Budgeted, Actual, Difference, and Notes. Add formulas for totals and conditional formatting showing negative differences in red. Use realistic monthly amounts.', type: 'financial' },
        { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', label: 'Content Calendar', desc: 'Weekly content schedule with topics and deadlines', prompt: 'Create a content calendar for a SaaS blog for the next month. Include columns for Week, Publish Date, Topic, Content Type (blog/video/infographic), Author, Status, and Notes. Use 3-4 pieces of content per week with realistic topics about AI, productivity, and technology. Mark some as In Progress, Planned, or Published.', type: 'table' },
      ],
    }
  },
  methods: {
    onKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.$emit('send')
      }
    },
    useTemplate(tpl) {
      this.$emit('update:modelValue', tpl.prompt)
      this.$emit('update:format-type', tpl.type)
      this.$nextTick(() => this.$emit('send'))
    },
  },
}
</script>

<style scoped>
.excel-landing {
  flex: 1;
  overflow-y: auto;
}
.lp-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 32px 60px;
}

/* ─── Hero ─── */
.lp-hero {
  text-align: center;
  margin-bottom: 24px;
  animation: fadeInUp 0.5s ease-out;
}
.lp-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(33,163,102,0.08);
  border: 1px solid rgba(33,163,102,0.15);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-bottom: 14px;
  animation: fadeInUp 0.4s ease-out 0.05s both;
}
.lp-hero h1 {
  font-family: var(--font-display);
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1.1;
  margin-bottom: 10px;
}
.lh-line1 {
  display: block;
  animation: fadeInUp 0.5s ease-out 0.1s both;
}
.lh-accent {
  font-style: italic;
  color: var(--accent);
  font-size: 1.15em;
  font-weight: 700;
  animation: accentPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
}
.lp-hero p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 520px;
  margin: 0 auto;
  animation: fadeInUp 0.5s ease-out 0.25s both;
}

/* ─── Prompt ─── */
.lp-prompt-wrap {
  max-width: 800px;
  margin: 0 auto 24px;
  background: rgba(22,22,42,0.5);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  animation: fadeInUp 0.5s ease-out 0.05s both;
  transition: border-color 0.2s;
}
.lp-prompt-wrap:focus-within {
  border-color: rgba(33,163,102,0.3);
}
.lp-prompt-inner textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: 14px;
  font-family: var(--font);
  resize: vertical;
  outline: none;
  background: rgba(255,255,255,0.03);
  color: var(--text);
  min-height: 90px;
  transition: all 0.2s;
}
.lp-prompt-inner textarea:focus {
  border-color: rgba(33,163,102,0.3);
  background: rgba(255,255,255,0.05);
  box-shadow: 0 0 0 3px rgba(33,163,102,0.06);
}
.lp-prompt-inner textarea::placeholder {
  color: var(--text-dim);
  font-size: 13px;
}

/* ─── Upload Row ─── */
.lp-upload-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.lp-upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px dashed var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font);
}
.lp-upload-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(33,163,102,0.04);
  border-style: solid;
}

/* ─── Controls ─── */
.lp-controls {
  display: flex;
  gap: 16px;
  margin-top: 14px;
  align-items: flex-start;
}
.lp-control-group {
  flex: 1;
}
.lp-control-group label {
  display: block;
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  font-weight: 600;
}
.lp-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.lp-chip {
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font);
}
.lp-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(33,163,102,0.04);
}
.lp-chip.active {
  background: rgba(33,163,102,0.12);
  border-color: var(--accent);
  color: var(--accent);
}

/* ─── History ─── */
.lp-history {
  margin-top: 14px;
  animation: fadeInUp 0.3s ease-out;
}
.lp-h-label {
  font-size: 11px;
  color: var(--text-dim);
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  font-weight: 500;
}
.lp-h-clear {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 11px;
  text-decoration: underline;
  font-family: var(--font);
}
.lp-h-clear:hover { color: var(--accent); }
.lp-h-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lp-h-item {
  text-align: left;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: rgba(255,255,255,0.02);
  color: var(--text-muted);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font);
}
.lp-h-item:hover {
  background: rgba(33,163,102,0.06);
  color: var(--accent);
  border-color: rgba(33,163,102,0.15);
}

/* ─── Generate Button ─── */
.lp-generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  margin-top: 16px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font);
}
.lp-generate-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(33,163,102,0.3);
}
.lp-generate-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ─── Templates ─── */
.lp-templates {
  margin-top: 36px;
  animation: fadeInUp 0.5s ease-out 0.1s both;
}
.lp-templates-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}
.lp-templates-header h2 {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
}
.lp-templates-count {
  font-size: 11px;
  color: var(--text-dim);
}
.lp-t-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.lp-t-card {
  text-align: left;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(22,22,42,0.4);
  cursor: pointer;
  transition: all 0.25s;
  font-family: var(--font);
  animation: fadeInUp 0.4s ease-out both;
}
.lp-t-card:hover {
  border-color: rgba(33,163,102,0.3);
  background: rgba(22,22,42,0.7);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.lp-t-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, rgba(33,163,102,0.12), rgba(33,163,102,0.04));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  color: var(--accent);
  transition: transform 0.25s;
}
.lp-t-card:hover .lp-t-icon {
  transform: scale(1.1) rotate(-3deg);
}
.lp-t-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 3px;
}
.lp-t-desc {
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.4;
}

/* ─── Animations ─── */
@keyframes accentPop {
  0% { opacity: 0; transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

/* ─── Responsive ─── */
@media (max-width: 900px) {
  .lp-t-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 600px) {
  .lp-t-grid { grid-template-columns: repeat(2, 1fr); }
  .lp-content { padding: 24px 16px 40px; }
  .lp-prompt-wrap { margin-left: 0; margin-right: 0; }
}
@media (max-width: 400px) {
  .lp-t-grid { grid-template-columns: 1fr; }
}
</style>
