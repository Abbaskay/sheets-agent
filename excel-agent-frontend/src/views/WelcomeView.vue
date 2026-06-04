<template>
  <div class="welcome">
    <!-- Animated background -->
    <div class="wl-bg">
      <div class="wl-bg-orb orb-1"></div>
      <div class="wl-bg-orb orb-2"></div>
      <div class="wl-bg-orb orb-3"></div>
      <div class="wl-bg-grid"></div>
    </div>

    <header class="wl-header">
      <div class="wl-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <span>ExcelAgent</span>
      </div>
      <nav class="wl-nav">
        <router-link :to="{ name: 'Dashboard' }" class="wl-nav-link">My Spreadsheets</router-link>
        <router-link :to="{ name: 'Pricing' }" class="wl-nav-link">Pricing</router-link>
      </nav>
      <div class="wl-header-right">
        <router-link :to="{ name: 'Login' }" class="wl-link">Sign in</router-link>
        <router-link :to="{ name: 'Signup' }" class="wl-btn">Get Started</router-link>
      </div>
    </header>

    <main class="wl-main">
      <!-- Hero -->
      <section class="wl-hero">
        <div class="wl-badge">
          <span class="wl-badge-dot"></span>
          AI-Powered Spreadsheet Studio
        </div>
        <h1 class="wl-heading">
          Create intelligent<br/>
          <span class="wl-heading-accent">spreadsheets</span>
          <br/>in seconds.
        </h1>
        <p class="wl-sub">Describe your data in plain English — AI generates a fully formatted spreadsheet with formulas, charts, and insights. Edit, refine, and export in any format.</p>
        <div class="wl-actions">
          <router-link :to="{ name: 'Signup' }" class="wl-primary">
            Get Started Free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </router-link>
          <router-link :to="{ name: 'Login' }" class="wl-secondary">Sign In</router-link>
        </div>
        <div class="wl-demo-cred">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>Demo account: <strong>admin@excelagent.com</strong> / <strong>admin123</strong></span>
        </div>
      </section>

      <!-- Features -->
      <section class="wl-features">
        <div class="wl-feature" v-for="(f, i) in features" :key="i" :style="{ animationDelay: `${i * 0.1}s` }">
          <div class="wlf-icon" v-html="f.icon"></div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </section>

      <!-- Stats -->
      <section class="wl-stats">
        <div class="wl-stat" v-for="(s, i) in stats" :key="i">
          <span class="wl-stat-num">{{ s.num }}</span>
          <span class="wl-stat-label">{{ s.label }}</span>
        </div>
      </section>
    </main>

    <footer class="wl-footer">
      <p>ExcelAgent &mdash; AI-powered spreadsheet studio</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'WelcomeView',
  data() {
    return {
      features: [
        { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>', title: 'AI-Powered Generation', desc: 'Describe any spreadsheet in plain English — budgets, inventories, timelines — and get structured data instantly.' },
        { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', title: 'Rich Data Table', desc: 'Editable cells, sortable columns, formulas, charts, and conditional formatting — everything from a modern spreadsheet.' },
        { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', title: 'Chat to Refine', desc: 'Edit cells, add rows, change formats, or ask AI to modify data — all through natural language chat.' },
        { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>', title: 'Export Any Format', desc: 'Download as CSV, JSON, or XLSX — ready to share, present, or integrate into your workflow.' },
      ],
      stats: [
        { num: '10K+', label: 'Sheets Generated' },
        { num: '98%', label: 'User Satisfaction' },
        { num: '50+', label: 'Template Types' },
        { num: '5★', label: 'User Rating' },
      ],
    }
  },
}
</script>

<style scoped>
.welcome {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  position: relative;
  overflow-x: hidden;
}

/* ─── Animated Background ─── */
.wl-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.wl-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
  animation: float 12s ease-in-out infinite;
}
.orb-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(5,150,105,0.3), transparent 70%);
  top: -100px; right: -100px;
  animation-delay: 0s;
}
.orb-2 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(16,185,129,0.2), transparent 70%);
  bottom: 10%; left: -80px;
  animation-delay: -4s;
}
.orb-3 {
  width: 250px; height: 250px;
  background: radial-gradient(circle, rgba(5,150,105,0.15), transparent 70%);
  top: 40%; right: 20%;
  animation-delay: -8s;
}
.wl-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* ─── Header ─── */
.wl-header {
  display: flex;
  align-items: center;
  padding: 16px 32px;
  border-bottom: 1px solid var(--border);
  background: rgba(10, 10, 18, 0.85);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 10;
  animation: fadeInDown 0.5s ease-out;
}
.wl-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 17px;
  color: var(--text);
}
.wl-logo svg { width: 20px; height: 20px; }
.wl-nav { display: flex; align-items: center; gap: 20px; margin-left: 32px; }
.wl-nav-link {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
  position: relative;
}
.wl-nav-link::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 1px;
  background: var(--accent);
  transform: scaleX(0);
  transition: transform 0.2s;
}
.wl-nav-link:hover { color: var(--accent); }
.wl-nav-link:hover::after { transform: scaleX(1); }
.wl-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
.wl-link {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s;
}
.wl-link:hover { color: var(--accent); }
.wl-btn {
  padding: 7px 20px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}
.wl-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(5,150,105,0.3);
}

/* ─── Main ─── */
.wl-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 24px 30px;
  position: relative;
  z-index: 1;
}

/* ─── Hero ─── */
.wl-hero {
  text-align: center;
  max-width: 700px;
  margin-bottom: 50px;
  animation: fadeInUp 0.6s ease-out;
}
.wl-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 16px;
  border-radius: 999px;
  background: rgba(5,150,105,0.08);
  border: 1px solid rgba(5,150,105,0.2);
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 20px;
  animation: fadeInUp 0.6s ease-out 0.1s both;
}
.wl-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
}
.wl-heading {
  font-family: var(--font-display);
  font-size: clamp(36px, 5vw, 60px);
  font-weight: 800;
  letter-spacing: -2px;
  line-height: 1.08;
  margin-bottom: 20px;
  animation: fadeInUp 0.6s ease-out 0.15s both;
}
.wl-heading-accent {
  background: linear-gradient(135deg, #34d399, #059669, #047857);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.wl-sub {
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.7;
  margin-bottom: 32px;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}
.wl-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  animation: fadeInUp 0.6s ease-out 0.25s both;
}
.wl-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s;
  animation: glowPulse 3s ease-in-out infinite;
}
.wl-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(5,150,105,0.35);
}
.wl-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}
.wl-secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(5,150,105,0.05);
}
.wl-demo-cred {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 18px;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-dim);
  cursor: default;
  animation: fadeInUp 0.6s ease-out 0.3s both;
}
.wl-demo-cred svg { color: var(--accent); flex-shrink: 0; }
.wl-demo-cred strong { color: var(--accent); }

/* ─── Features ─── */
.wl-features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 800px;
  width: 100%;
  margin-bottom: 40px;
}
.wl-feature {
  background: rgba(22, 22, 42, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px 20px;
  text-align: center;
  transition: all 0.3s;
  animation: fadeInUp 0.5s ease-out both;
}
.wl-feature:hover {
  border-color: rgba(5,150,105,0.3);
  background: rgba(22, 22, 42, 0.8);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.2), 0 0 30px rgba(5,150,105,0.05);
}
.wlf-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(5,150,105,0.15), rgba(5,150,105,0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: var(--accent);
  transition: transform 0.3s;
}
.wl-feature:hover .wlf-icon {
  transform: scale(1.1);
}
.wl-feature h3 {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: -0.2px;
}
.wl-feature p {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
}

/* ─── Stats ─── */
.wl-stats {
  display: flex;
  gap: 40px;
  max-width: 600px;
  width: 100%;
  justify-content: center;
  padding: 24px;
  border-radius: var(--radius);
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  animation: fadeInUp 0.6s ease-out 0.4s both;
}
.wl-stat {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.wl-stat-num {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #34d399, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.wl-stat-label {
  font-size: 11px;
  color: var(--text-dim);
}

/* ─── Footer ─── */
.wl-footer {
  text-align: center;
  padding: 24px;
  font-size: 11px;
  color: var(--text-dim);
  border-top: 1px solid var(--border);
  position: relative;
  z-index: 1;
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .wl-header { padding: 14px 16px; }
  .wl-nav { display: none; }
  .wl-features { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .wl-stats { gap: 24px; flex-wrap: wrap; }
}
@media (max-width: 480px) {
  .wl-features { grid-template-columns: 1fr; }
  .wl-actions { flex-direction: column; align-items: center; }
  .wl-hero { margin-bottom: 32px; }
}
</style>
