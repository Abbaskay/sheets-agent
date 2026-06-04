import { createAuthStore } from '@shared/auth.js'

export const authState = createAuthStore('excelagent_auth', { withBilling: true })
