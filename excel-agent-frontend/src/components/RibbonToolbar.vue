<template>
  <div class="ribbon">
    <div class="ribbon-tabs">
      <button v-for="tab in tabs" :key="tab.key" :class="['tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">
        {{ tab.label }}
      </button>
    </div>

    <div class="ribbon-content">
      <template v-if="activeTab === 'home'">
        <div class="group">
          <div class="group-label">Clipboard</div>
          <div class="group-items">
            <button class="ri-btn" title="Paste" @click="$emit('action', 'paste')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg><span class="ri-lbl">Paste</span></button>
            <button class="ri-btn" title="Cut" @click="$emit('action', 'cut')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg><span class="ri-lbl">Cut</span></button>
            <button class="ri-btn" title="Copy" @click="$emit('action', 'copy')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span class="ri-lbl">Copy</span></button>
            <button class="ri-btn" title="Format Painter"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="2" width="16" height="6" rx="1"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="16" x2="16" y2="16"/><line x1="10" y1="16" x2="10" y2="22"/><line x1="14" y1="16" x2="14" y2="22"/></svg><span class="ri-lbl">Painter</span></button>
          </div>
        </div>

        <div class="divider"></div>

        <div class="group">
          <div class="group-label">Font</div>
          <div class="group-items group-wrap">
            <select class="ri-sel" v-model="fontFamily" @change="$emit('action', { type: 'fontFamily', value: fontFamily })" title="Font">
              <option>Calibri</option><option>Arial</option><option>Times New Roman</option><option>Courier New</option><option>Verdana</option>
            </select>
            <select class="ri-sel ri-size" v-model="fontSize" @change="$emit('action', { type: 'fontSize', value: fontSize })" title="Font Size">
              <option>8</option><option>9</option><option>10</option><option>11</option><option>12</option><option>14</option><option>16</option><option>18</option><option>20</option><option>24</option><option>28</option><option>36</option>
            </select>
            <button class="ri-icon" title="Bold" @click="$emit('action', 'bold')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg></button>
            <button class="ri-icon" title="Italic" @click="$emit('action', 'italic')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg></button>
            <button class="ri-icon" title="Underline" @click="$emit('action', 'underline')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg></button>
          </div>
        </div>

        <div class="divider"></div>

        <div class="group">
          <div class="group-label">Alignment</div>
          <div class="group-items">
            <button class="ri-icon" title="Align Left" @click="$emit('action', 'alignLeft')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg></button>
            <button class="ri-icon" title="Center" @click="$emit('action', 'alignCenter')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="18" y1="14" x2="6" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg></button>
            <button class="ri-icon" title="Align Right" @click="$emit('action', 'alignRight')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="7" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg></button>
            <button class="ri-icon" title="Wrap Text" @click="$emit('action', 'wrapText')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M3 12h15a3 3 0 0 1 0 6h-4"/><path d="M16 16l-2 2 2 2"/></svg></button>
          </div>
        </div>

        <div class="divider"></div>

        <div class="group">
          <div class="group-label">Number</div>
          <div class="group-items">
            <select class="ri-sel" v-model="numberFormat" @change="$emit('action', { type: 'numberFormat', value: numberFormat })" title="Number Format" style="width:72px">
              <option>General</option><option>Number</option><option>Currency</option><option>Date</option><option>Percentage</option>
            </select>
            <button class="ri-icon" title="Percent Style" style="font-size:12px;font-weight:700" @click="$emit('action', 'percentStyle')">%</button>
          </div>
        </div>

        <div class="divider"></div>

        <div class="group">
          <div class="group-label">Cells</div>
          <div class="group-items">
            <button class="ri-btn" title="Insert Cells" @click="$emit('action', 'insertRowAbove')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14"/><path d="M5 12h14"/></svg><span class="ri-lbl">Insert</span></button>
            <button class="ri-btn" title="Delete Cells" @click="$emit('action', 'deleteRow')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg><span class="ri-lbl">Delete</span></button>
          </div>
        </div>

        <div class="divider"></div>

        <div class="group">
          <div class="group-label">Editing</div>
          <div class="group-items">
            <button class="ri-btn" style="min-width:50px" @click="$emit('action', 'autoSum')">Σ <span class="ri-lbl">Sum</span></button>
            <button class="ri-btn" @click="$emit('action', 'sortAsc')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 5h10"/><path d="M11 9h7"/><path d="M11 13h4"/></svg><span class="ri-lbl">Sort</span></button>
            <button class="ri-btn" @click="$emit('action', 'filter')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg><span class="ri-lbl">Filter</span></button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RibbonToolbar',
  emits: ['action'],
  data() {
    return {
      activeTab: 'home',
      fontFamily: 'Calibri',
      fontSize: '11',
      numberFormat: 'General',
      tabs: [
        { key: 'home', label: 'HOME' },
        { key: 'insert', label: 'INSERT' },
        { key: 'pagelayout', label: 'PAGE LAYOUT' },
        { key: 'formulas', label: 'FORMULAS' },
        { key: 'data', label: 'DATA' },
        { key: 'view', label: 'VIEW' },
        { key: 'settings', label: 'SETTINGS' },
      ],
    }
  },
}
</script>

<style scoped>
.ribbon {
  background: #f3f3f3;
  border-bottom: 1px solid #d0d0d0;
  flex-shrink: 0;
  user-select: none;
  height: var(--ribbon-h);
  display: flex;
  flex-direction: column;
}
.ribbon-tabs {
  display: flex;
  gap: 0;
  padding: 0 6px;
  background: #f3f3f3;
  flex-shrink: 0;
  height: 24px;
  border-bottom: 1px solid #d0d0d0;
}
.tab {
  padding: 3px 12px;
  font-size: 11px;
  font-weight: 500;
  color: #555;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: var(--font);
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  letter-spacing: 0.3px;
}
.tab:hover { color: #222; background: rgba(0,0,0,0.03); }
.tab.active { color: #222; border-bottom-color: #21a366; font-weight: 600; }

.ribbon-content {
  display: flex;
  align-items: stretch;
  gap: 0;
  padding: 2px 6px;
  flex: 1;
  overflow-x: auto;
  min-height: 0;
  background: #f3f3f3;
}
.group {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  gap: 2px;
}
.group-label {
  font-size: 8px;
  color: #888;
  text-align: center;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-weight: 500;
  flex-shrink: 0;
}
.group-items {
  display: flex;
  align-items: center;
  gap: 1px;
}
.group-wrap {
  flex-wrap: wrap;
  max-width: 300px;
}
.divider {
  width: 1px;
  align-self: stretch;
  background: #d0d0d0;
  margin: 2px 2px;
  flex-shrink: 0;
}
.ri-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 2px 5px;
  border: none;
  background: transparent;
  color: #444;
  cursor: pointer;
  border-radius: 4px;
  font-size: 9px;
  font-family: var(--font);
  min-width: 32px;
  transition: all 0.1s;
}
.ri-btn:hover { background: rgba(0,0,0,0.05); color: #222; }
.ri-btn:active { background: rgba(0,0,0,0.08); }
.ri-btn svg { width: 13px; height: 13px; }
.ri-lbl { font-size: 8px; line-height: 1; }
.ri-icon {
  width: 24px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #444;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.1s;
}
.ri-icon:hover { background: rgba(0,0,0,0.05); color: #222; }
.ri-icon:active { background: rgba(0,0,0,0.08); }
.ri-icon svg { width: 13px; height: 13px; }
.ri-sel {
  padding: 1px 4px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background: #fff;
  color: #333;
  font-size: 10px;
  font-family: var(--font);
  outline: none;
  cursor: pointer;
  max-width: 78px;
  height: 20px;
}
.ri-sel:hover { border-color: #999; }
.ri-sel:focus { border-color: #21a366; }
.ri-size { max-width: 42px; }
</style>
