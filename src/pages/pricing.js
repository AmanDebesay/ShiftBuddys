import Link from 'next/link'
import { Check, ArrowRight, Shield, Download } from 'lucide-react'
import Layout from '../components/Layout'
import { PRICING, FAQ } from '../data/siteData'

function PlanCard({ plan }) {
  return (
    <div className={`relative glass rounded-3xl p-8 border flex flex-col ${
      plan.highlight
        ? 'border-orange-500/50 shadow-2xl shadow-orange-500/20'
        : 'border-white/8'
    }`}>
      {plan.highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-orange-500 text-white text-xs font-heading font-bold px-5 py-1.5 rounded-full shadow-lg">
            MOST POPULAR
          </div>
        </div>
      )}
      <div className="mb-6">
        <h3 className="font-heading font-bold text-white text-xl mb-1">{plan.tier}</h3>
        <p className="font-body text-white/50 text-sm">{plan.description}</p>
      </div>
      <div className="mb-6">
        <div className="flex items-end gap-2">
          <span className="font-display text-6xl text-white leading-none">{plan.price}</span>
          <span className="font-body text-white/50 text-sm mb-2">{plan.period}</span>
        </div>
        {plan.annual && (
          <p className="font-body text-orange-400 text-sm mt-1">{plan.annual}</p>
        )}
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              plan.highlight ? 'bg-orange-500/20 border border-orange-500/40' : 'bg-white/10 border border-white/20'
            }`}>
              <Check size={11} className={plan.highlight ? 'text-orange-400' : 'text-white/60'} />
            </div>
            <span className="font-body text-white/70 text-sm">{f}</span>
          </li>
        ))}
      </ul>
      <Link href={plan.href} className={plan.highlight ? 'btn-primary justify-center' : 'btn-secondary justify-center'}>
        {plan.cta}
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}

export default function Pricing() {
  return (
    <Layout title="Pricing" description="ShiftBuddys pricing — Free tier and Premium at $7.99/month. Enterprise plans for oilsands operators.">

      {/* Header */}
      <section className="pt-32 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="section-label mb-5">Simple, honest pricing</div>
          <h1 className="font-display text-7xl sm:text-8xl text-white mb-5">
            Free to start.<br /><span className="text-gradient">Worth every penny.</span>
          </h1>
          <p className="font-body text-white/60 text-lg">
            Download free and use the core features forever. Upgrade when you&apos;re ready.
          </p>
        </div>
      </section>

      {/* Individual plans */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {PRICING.individual.map(plan => <PlanCard key={plan.tier} plan={plan} />)}
          </div>
          <div className="flex items-center justify-center gap-2 mt-8 text-white/40 text-sm font-body">
            <Shield size={14} />
            <span>No credit card required for the free tier. Cancel anytime on Premium.</span>
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-24 bg-navy-900/50 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-label mb-5">For Suncor, CNRL, Syncrude & contractors</div>
              <h2 className="font-display text-6xl text-white mb-4">{PRICING.enterprise.title}</h2>
              <p className="font-body text-white/60 text-lg leading-relaxed mb-8">{PRICING.enterprise.description}</p>
              <ul className="space-y-3 mb-8">
                {PRICING.enterprise.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={11} className="text-orange-400" />
                    </div>
                    <span className="font-body text-white/70 text-sm">{b}</span>
                  </li>
                ))}
              </ul>
              <Link href={PRICING.enterprise.href} className="btn-primary">
                {PRICING.enterprise.cta} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="glass rounded-3xl p-8 border border-white/8">
              <h3 className="font-heading font-bold text-white mb-6">Per employee/month</h3>
              <div className="space-y-4">
                {PRICING.enterprise.tiers.map((t, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                    <div>
                      <p className="font-heading font-medium text-white text-sm">{t.size}</p>
                      <p className="font-body text-white/40 text-xs">{t.annual}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-3xl text-orange-400">{t.price}</span>
                      <span className="font-body text-white/40 text-xs">/mo</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="glass-light rounded-xl p-4 border border-orange-400/20">
                  <p className="font-heading font-semibold text-orange-400 text-sm mb-1">Free 90-Day Pilot</p>
                  <p className="font-body text-white/60 text-xs">Start with 200 workers at zero cost. No commitment required.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-5xl text-white">Pricing questions</h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQ.slice(0, 4).map((item, i) => (
              <details key={i} className="group glass rounded-xl border border-white/8 overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-heading font-medium text-white text-sm hover:text-orange-400 transition-colors">
                  {item.q}
                  <ArrowRight size={16} className="text-white/40 group-open:rotate-90 transition-transform flex-shrink-0 ml-3" />
                </summary>
                <div className="px-6 pb-5 font-body text-white/60 text-sm leading-relaxed border-t border-white/8 pt-4">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-6xl text-white mb-4">Start free today.</h2>
          <p className="font-body text-white/50 mb-8">No credit card. No commitment. Just your countdown.</p>
          <Link href="/#download" className="btn-primary text-base">
            <Download size={18} /> Download ShiftBuddys Free
          </Link>
        </div>
      </section>

    </Layout>
  )
}
