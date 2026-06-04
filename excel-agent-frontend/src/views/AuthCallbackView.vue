<template>
  <div class="callback-page">
    <p>Authenticating...</p>
  </div>
</template>

<script>
function safeRedirect(url) {
  if (!url || typeof url !== 'string') return '/app'
  return url.startsWith('/') && !url.startsWith('//') ? url : '/app'
}

import { authState } from '../store/auth.js'

export default {
  name: 'AuthCallbackView',
  mounted() {
    const token = this.$route.query.token
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        authState.login(token, {
          name: payload.name || payload.sub || 'User',
          email: payload.email || '',
        })
      } catch {
        authState.login(token, { name: 'User', email: '' })
      }
      this.$router.push(safeRedirect(this.$route.query.redirect))
    } else if (this.$route.query.code) {
      window.location.href = '/login'
    } else {
      this.$router.push('/')
    }
  },
}
</script>

<style scoped>
.callback-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); color: var(--text-muted); font-size: 14px; }
</style>
