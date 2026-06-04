const USERS_KEY = 'excelagent_users'
const SESSION_KEY = 'excelagent_auth'

function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const defaults = [
  { id: 'admin-001', name: 'Admin', email: 'admin@excelagent.com', password: 'admin123', role: 'admin' },
  { id: 'demo-001', name: 'Demo User', email: 'demo@excelagent.com', password: 'demo123', role: 'user' },
]

if (!localStorage.getItem(USERS_KEY)) {
  saveUsers(defaults)
}

async function fetchRealToken(name, email) {
  const backendUrl = import.meta.env.VITE_EXCEL_BACKEND_URL || 'http://localhost:8004'
  try {
    const res = await fetch(backendUrl + '/api/auth/dev-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
    const data = await res.json()
    if (data.token) return data.token
  } catch {}
  return null
}

function createSession(user, realToken) {
  const { password, ...safe } = user
  const session = {
    token: realToken || 'mock-token-' + Date.now() + '-' + Math.random().toString(36).slice(2),
    user: safe,
    subscription: { plan: 'free' },
    usage: { generated: 0, exported: 0, periodStart: new Date().toISOString().slice(0, 7) },
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export const mockAuth = {
  async login(email, password) {
    const users = getUsers()
    const user = users.find(u => u.email === email.toLowerCase().trim())
    if (!user) return { ok: false, error: 'No account found with this email' }
    if (user.password !== password) return { ok: false, error: 'Incorrect password' }
    const token = await fetchRealToken(user.name, user.email)
    return { ok: true, ...createSession(user, token) }
  },

  async register(name, email, password) {
    const users = getUsers()
    const emailLower = email.toLowerCase().trim()
    if (users.find(u => u.email === emailLower)) {
      return { ok: false, error: 'An account with this email already exists' }
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters' }
    }
    const newUser = {
      id: 'user-' + Date.now(),
      name: name.trim() || 'User',
      email: emailLower,
      password,
      role: 'user',
    }
    users.push(newUser)
    saveUsers(users)
    const token = await fetchRealToken(newUser.name, newUser.email)
    return { ok: true, ...createSession(newUser, token) }
  },

  getDefaultAdmin() {
    return { email: 'admin@excelagent.com', password: 'admin123' }
  },
}
