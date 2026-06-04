<template>
  <div class="settings-page">
    <div class="settings-bg">
      <div class="settings-bg-orb orb-1"></div>
      <div class="settings-bg-orb orb-2"></div>
    </div>

    <header class="settings-header">
      <router-link :to="{ name: 'App' }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back
      </router-link>
      <div class="settings-logo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <span>ExcelAgent</span>
      </div>
    </header>

    <main class="settings-main">
      <h1>Settings</h1>

      <section class="settings-section">
        <div class="settings-section-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <h2>Profile</h2>
        </div>
        <div class="settings-card">
          <div class="settings-field">
            <label>Name</label>
            <input v-model="name" placeholder="Your name" />
          </div>
          <div class="settings-field">
            <label>Email</label>
            <input v-model="email" placeholder="your@email.com" />
          </div>
        </div>
      </section>

      <section class="settings-section">
        <div class="settings-section-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          <h2>Billing &amp; Plan</h2>
        </div>
        <div class="settings-card">
          <div class="settings-plan">
            <div>
              <span class="settings-plan-label">Current plan</span>
              <span class="settings-plan-name">{{ plan }}</span>
            </div>
            <router-link :to="{ name: 'Pricing' }" class="settings-upgrade">Upgrade</router-link>
          </div>
          <div class="settings-usage">
            <div class="settings-usage-header">
              <span>Spreadsheets used</span>
              <span class="settings-usage-num">{{ usage.generated }} / {{ usageLimit.generated }}</span>
            </div>
            <div class="settings-usage-bar">
              <div class="settings-usage-fill" :style="{ width: usagePercent + '%' }"></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { authState } from '../store/auth.js'

export default {
  name: 'SettingsView',
  computed: {
    plan() { return authState.plan },
    usage() { return authState.usage },
    usageLimit() { return authState.usageLimit },
    usagePercent() {
      const max = authState.usageLimit.generated || 1
      return Math.min((authState.usage.generated / max) * 100, 100)
    },
  },
  data() {
    return {
      name: authState.user?.name || '',
      email: authState.user?.email || '',
    }
  },
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.settings-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.settings-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.12;
  animation: float 15s ease-in-out infinite;
}
.settings-bg-orb.orb-1 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(5,150,105,0.2), transparent 70%);
  top: -60px; right: -60px;
}
.settings-bg-orb.orb-2 {
  width: 250px; height: 250px;
  background: radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%);
  bottom: -60px; left: -60px;
  animation-delay: -7s;
}

.settings-header {
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
.settings-header a {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 13px;
}
.settings-header a:hover { color: var(--accent); }
.settings-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  margin-left: auto;
}

.settings-main {
  flex: 1;
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 24px;
  width: 100%;
  position: relative;
  z-index: 1;
}
.settings-main h1 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
}

.settings-section {
  margin-bottom: 24px;
}
.settings-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.settings-section-header svg {
  color: var(--accent);
}
.settings-section h2 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.settings-card {
  background: rgba(22,22,42,0.5);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}

.settings-field {
  margin-bottom: 14px;
}
.settings-field:last-child {
  margin-bottom: 0;
}
.settings-field label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 5px;
  font-weight: 500;
}
.settings-field input {
  width: 100%;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.03);
  color: var(--text);
  font-size: 13px;
  font-family: var(--font);
  outline: none;
  transition: all 0.2s;
}
.settings-field input:focus {
  border-color: var(--accent);
  background: rgba(255,255,255,0.05);
  box-shadow: 0 0 0 3px rgba(5,150,105,0.06);
}

.settings-plan {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.settings-plan-label {
  display: block;
  font-size: 11px;
  color: var(--text-dim);
  margin-bottom: 1px;
}
.settings-plan-name {
  font-size: 15px;
  font-weight: 700;
  font-family: var(--font-display);
}
.settings-upgrade {
  padding: 6px 18px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}
.settings-upgrade:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5,150,105,0.3);
}

.settings-usage {}
.settings-usage-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
}
.settings-usage-num {
  font-weight: 600;
  color: var(--accent);
}
.settings-usage-bar {
  height: 6px;
  background: rgba(255,255,255,0.04);
  border-radius: 999px;
  overflow: hidden;
}
.settings-usage-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent), var(--accent-hover));
  transition: width 0.4s ease;
}
</style>
