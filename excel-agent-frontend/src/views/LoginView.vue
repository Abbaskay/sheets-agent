<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="login-bg-orb orb-1"></div>
      <div class="login-bg-orb orb-2"></div>
      <div class="login-bg-grid"></div>
    </div>

    <header class="login-header">
      <router-link :to="{ name: 'Welcome' }" class="login-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back
      </router-link>
      <router-link :to="{ name: 'Welcome' }" class="login-logo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <span>ExcelAgent</span>
      </router-link>
    </header>

    <main class="login-main">
      <div class="login-card">
        <div class="login-card-header">
          <h1>Welcome back</h1>
          <p class="login-sub">Sign in to your account</p>
        </div>

        <form @submit.prevent="doLogin">
          <div class="login-field">
            <label>Email</label>
            <div class="login-input-wrap">
              <svg class="login-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input v-model="email" type="email" placeholder="you@example.com" required />
            </div>
          </div>
          <div class="login-field">
            <label>Password</label>
            <div class="login-input-wrap">
              <svg class="login-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input v-model="password" type="password" placeholder="Enter your password" required />
            </div>
          </div>

          <p v-if="error" class="login-error">{{ error }}</p>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="loading" class="login-btn-spinner"></span>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="login-divider"><span>or continue with</span></div>

        <button @click="socialLogin('google')" class="login-social">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
          Google
        </button>

        <p class="login-signup">Don't have an account? <router-link :to="{ name: 'Signup' }">Sign up</router-link></p>
      </div>
    </main>
  </div>
</template>

<script>
import { authState } from '../store/auth.js'
import { authAPI } from '../services/api.js'
import { mockAuth } from '../services/mockAuth.js'

export default {
  name: 'LoginView',
  data() {
    return { email: '', password: '', loading: false, error: '' }
  },
  methods: {
    async doLogin() {
      this.loading = true; this.error = ''
      try {
        const res = await authAPI().login(this.email, this.password)
        const { token, user } = res.data
        authState.login(token, user)
        this.$router.push(this.$route.query.redirect || '/app')
      } catch {
        const result = await mockAuth.login(this.email, this.password)
        if (result.ok) {
          authState.login(result.token, result.user, result.subscription)
          if (result.usage) authState.updateUsage(result.usage)
          this.$router.push(this.$route.query.redirect || '/app')
        } else {
          this.error = result.error
        }
      } finally { this.loading = false }
    },
    socialLogin(provider) {
      window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/${provider}/redirect`
    },
  },
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  position: relative;
}

/* ─── Background ─── */
.login-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.login-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.2;
  animation: float 15s ease-in-out infinite;
}
.login-bg-orb.orb-1 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(5,150,105,0.25), transparent 70%);
  top: -80px; right: -80px;
}
.login-bg-orb.orb-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%);
  bottom: -60px; left: -60px;
  animation-delay: -6s;
}
.login-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* ─── Header ─── */
.login-header {
  display: flex;
  align-items: center;
  padding: 16px 32px;
  border-bottom: 1px solid var(--border);
  background: rgba(10,10,18,0.8);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 1;
}
.login-header a {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.15s;
}
.login-header a:hover { color: var(--accent); }
.login-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  margin-left: auto;
}

/* ─── Main ─── */
.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  z-index: 1;
}

/* ─── Card ─── */
.login-card {
  width: 100%;
  max-width: 380px;
  background: rgba(22, 22, 42, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 36px 32px 32px;
  animation: fadeInUp 0.5s ease-out;
}
.login-card-header {
  text-align: center;
  margin-bottom: 24px;
}
.login-card h1 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}
.login-sub {
  font-size: 13px;
  color: var(--text-muted);
}

/* ─── Fields ─── */
.login-field {
  margin-bottom: 16px;
}
.login-field label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
  font-weight: 500;
}
.login-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.login-input-icon {
  position: absolute;
  left: 12px;
  color: var(--text-dim);
  pointer-events: none;
  transition: color 0.2s;
}
.login-input-wrap:focus-within .login-input-icon {
  color: var(--accent);
}
.login-field input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.04);
  color: var(--text);
  font-size: 13px;
  font-family: var(--font);
  outline: none;
  transition: all 0.2s;
}
.login-field input:focus {
  border-color: var(--accent);
  background: rgba(255,255,255,0.06);
  box-shadow: 0 0 0 3px rgba(5,150,105,0.08);
}
.login-field input::placeholder { color: var(--text-dim); font-size: 12px; }

.login-error {
  color: var(--red);
  font-size: 12px;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.15);
}

/* ─── Button ─── */
.login-btn {
  width: 100%;
  padding: 11px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.login-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(5,150,105,0.3);
}
.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.login-btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* ─── Divider ─── */
.login-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}
.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}
.login-divider span {
  font-size: 11px;
  color: var(--text-dim);
  white-space: nowrap;
}

/* ─── Social ─── */
.login-social {
  width: 100%;
  padding: 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.02);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  font-family: var(--font);
}
.login-social:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(5,150,105,0.04);
}

/* ─── Footer ─── */
.login-signup {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 18px;
}
.login-signup a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
}
.login-signup a:hover { text-decoration: underline; }
</style>
