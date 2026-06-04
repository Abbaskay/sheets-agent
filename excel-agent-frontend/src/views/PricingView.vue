<template>
  <div class="pricing-page">
    <div class="pricing-bg">
      <div class="pricing-bg-orb orb-1"></div>
      <div class="pricing-bg-orb orb-2"></div>
      <div class="pricing-bg-grid"></div>
    </div>

    <header class="pricing-header">
      <router-link :to="{ name: 'Welcome' }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back
      </router-link>
      <div class="pricing-logo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        <span>ExcelAgent</span>
      </div>
    </header>

    <main class="pricing-main">
      <div class="pricing-head">
        <div class="pricing-badge">Pricing</div>
        <h1>Simple, transparent pricing</h1>
        <p class="pricing-sub">Choose the plan that fits your needs. Upgrade anytime.</p>
      </div>

      <div class="pricing-grid">
        <div v-for="(plan, i) in plans" :key="i" :class="['pricing-card', { featured: plan.featured }]">
          <div class="pricing-badge-popular" v-if="plan.featured">Most Popular</div>
          <div class="pricing-card-top">
            <h2>{{ plan.name }}</h2>
            <div class="pricing-amount-wrap">
              <span class="pricing-currency">$</span>
              <span class="pricing-amount">{{ plan.price }}</span>
            </div>
            <p class="pricing-period">{{ plan.period }}</p>
          </div>

          <ul class="pricing-features">
            <li v-for="(feat, fi) in plan.features" :key="fi">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {{ feat }}
            </li>
          </ul>

          <button :class="['pricing-btn', { primary: plan.featured }]" :disabled="plan.disabled">
            {{ plan.cta }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'PricingView',
  data() {
    return {
      plans: [
        {
          name: 'Free',
          price: '0',
          period: 'forever',
          featured: false,
          disabled: true,
          cta: 'Current Plan',
          features: [
            '5 spreadsheets per month',
            'CSV export',
            'Basic AI generation',
            'Community support',
          ],
        },
        {
          name: 'Pro',
          price: '19',
          period: 'per month',
          featured: true,
          disabled: true,
          cta: 'Coming Soon',
          features: [
            '100 spreadsheets per month',
            'CSV, JSON, XLSX export',
            'Advanced AI generation',
            'Chart generation',
            'Formula support',
            'Priority support',
          ],
        },
        {
          name: 'Business',
          price: '49',
          period: 'per month',
          featured: false,
          disabled: true,
          cta: 'Coming Soon',
          features: [
            'Unlimited spreadsheets',
            'All export formats',
            'Priority AI processing',
            'Web research',
            'Team collaboration',
            'Dedicated support',
          ],
        },
      ],
    }
  },
}
</script>

<style scoped>
.pricing-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ─── Background ─── */
.pricing-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.pricing-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
  animation: float 15s ease-in-out infinite;
}
.pricing-bg-orb.orb-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(5,150,105,0.2), transparent 70%);
  top: -100px; right: -80px;
}
.pricing-bg-orb.orb-2 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%);
  bottom: -80px; left: -80px;
  animation-delay: -6s;
}
.pricing-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* ─── Header ─── */
.pricing-header {
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
.pricing-header a {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 13px;
}
.pricing-header a:hover { color: var(--accent); }
.pricing-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  margin-left: auto;
}

/* ─── Main ─── */
.pricing-main {
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 50px 24px;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* ─── Head ─── */
.pricing-head {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeInUp 0.5s ease-out;
}
.pricing-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 999px;
  background: rgba(5,150,105,0.08);
  border: 1px solid rgba(5,150,105,0.2);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 12px;
}
.pricing-head h1 {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: -0.8px;
}
.pricing-sub {
  color: var(--text-muted);
  font-size: 14px;
}

/* ─── Grid ─── */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  animation: fadeInUp 0.5s ease-out 0.1s both;
}

/* ─── Card ─── */
.pricing-card {
  background: rgba(22,22,42,0.5);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px 24px;
  position: relative;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}
.pricing-card:hover {
  border-color: rgba(255,255,255,0.12);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}
.pricing-card.featured {
  border-color: rgba(5,150,105,0.4);
  background: rgba(22,22,42,0.7);
  box-shadow: 0 0 40px rgba(5,150,105,0.06);
  animation: glowPulse 4s ease-in-out infinite;
}
.pricing-card.featured:hover {
  border-color: rgba(5,150,105,0.6);
}
.pricing-badge-popular {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.2px;
}

.pricing-card-top {
  margin-bottom: 20px;
}
.pricing-card h2 {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}
.pricing-amount-wrap {
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.pricing-currency {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-muted);
}
.pricing-amount {
  font-family: var(--font-display);
  font-size: 38px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1;
}
.pricing-period {
  font-size: 12px;
  color: var(--text-dim);
  margin-top: 4px;
}

/* ─── Features ─── */
.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  flex: 1;
}
.pricing-features li {
  font-size: 12px;
  color: var(--text-muted);
  padding: 5px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.pricing-features li svg {
  flex-shrink: 0;
}

/* ─── Button ─── */
.pricing-btn {
  width: 100%;
  padding: 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.03);
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font);
}
.pricing-btn.primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.pricing-btn.primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(5,150,105,0.3);
}
.pricing-btn:not(.primary):hover {
  border-color: var(--accent);
  color: var(--accent);
}
.pricing-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .pricing-grid { grid-template-columns: 1fr; max-width: 360px; margin: 0 auto; }
  .pricing-main { padding: 30px 16px; }
}
</style>
