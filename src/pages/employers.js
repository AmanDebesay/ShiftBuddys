import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, TrendingDown, Shield, Award, BarChart2, Lock, Zap, Check } from 'lucide-react'
import Layout from '../components/Layout'
import { EMPLOYER, PRICING } from '../data/siteData'

const ICON_MAP = { TrendingDown, Shield, Award, BarChart2, Lock, Zap }

export default function Employers() {
  return (
    <Layout title="For Employers" description="ShiftBuddys enterprise — purpose-built employee wellness for oilsands operators. Free 90-day pilot for Suncor, CNRL, Syncrude, and contractors.">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={EMPLOYER.photo} alt="Oilsands employer" fill className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900 to-navy-900/70" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="section-label mb-6">For HSE, HR & People Leaders</div>
          <h1 className="font-display text-6xl sm:text-8xl text-white mb-6 whitespace-pre-line">
            {EMPLOYER.headline.split('\n').map((line, i) => (
              <span key={i} className={i === 1 ? 'text-gradient block' : 'block'}>{line}</span>
            ))}
          </h1>
          <p className="font-body text-white/60 text-lg max-w-3xl mx-auto mb-10">{EMPLOYER.subheadline}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact?type=employer" className="btn-primary text-base">
              Book Free Pilot <ArrowRight size={18} />
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-base">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="py-16 bg-navy-800/60 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {EMPLOYER.stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-5xl sm:text-6xl text-orange-400 mb-2">{stat.value}</div>
                <div className="font-body text-white/50 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ───────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-label mb-4">The business case</div>
            <h2 className="font-display text-6xl sm:text-7xl text-white">
              Six reasons to say yes.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {EMPLOYER.why.map(item => {
              const Icon = ICON_MAP[item.icon] || Shield
              return (
                <div key={item.title} className="glass rounded-2xl p-7 border border-white/8 card-hover">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mb-5">
                    <Icon size={22} className="text-orange-400" />
                  </div>
                  <h3 className="font-heading font-bold text-white text-lg mb-3">{item.title}</h3>
                  <p className="font-body text-white/55 text-sm leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PRIVACY GUARANTEE ─────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-navy-800/80 to-navy-900 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto mb-6">
            <Lock size={28} className="text-orange-400" />
          </div>
          <h2 className="font-display text-5xl sm:text-6xl text-white mb-4">The Privacy Guarantee</h2>
          <p className="font-body text-white/60 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            <strong className="text-white">Individual worker data is never visible to employers.</strong> Full stop. Workers see this guarantee on their home screen every day. This is what drives adoption — and it&apos;s a legal commitment, not just a promise.
          </p>
          <div className="grid sm:grid-cols-3 gap-5 text-left">
            {[
              { title: 'What you see', items: ['Team mood trends (anonymized)', 'Sleep pattern aggregates', 'Crew engagement metrics', 'Certification compliance rates'] },
              { title: 'What you never see', items: ['Individual mood scores', 'Personal journal entries', 'Health tracker data', 'Private messages or chat'] },
              { title: 'What workers see', items: ['Their own data — always', '"Employer cannot see this" badge', 'Data export option', 'Full delete control'] },
            ].map(section => (
              <div key={section.title} className="glass rounded-2xl p-5 border border-white/8">
                <p className="font-heading font-semibold text-orange-400 text-sm uppercase tracking-wider mb-4">{section.title}</p>
                <ul className="space-y-2">
                  {section.items.map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />
                      <span className="font-body text-white/60 text-xs leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-label mb-5">Enterprise pricing</div>
              <h2 className="font-display text-6xl text-white mb-4">Straightforward. Scalable.</h2>
              <p className="font-body text-white/60 leading-relaxed mb-8">Per employee per month. Volume discounts at every tier. And your first 90 days are completely free.</p>
              <div className="glass rounded-2xl border border-white/8 overflow-hidden">
                {PRICING.enterprise.tiers.map((t, i) => (
                  <div key={i} className={`flex items-center justify-between px-6 py-5 ${i < PRICING.enterprise.tiers.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <div>
                      <p className="font-heading font-medium text-white text-sm">{t.size}</p>
                      <p className="font-body text-white/40 text-xs">{t.annual}</p>
                    </div>
                    <span className="font-display text-4xl text-orange-400">{t.price}<span className="font-body text-white/40 text-sm">/mo</span></span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-3xl p-8 border border-orange-500/30 shadow-2xl shadow-orange-500/10">
              <div className="flex items-center gap-3 mb-2">
                <Zap size={20} className="text-orange-400" />
                <h3 className="font-heading font-bold text-white text-lg">Free 90-Day Pilot</h3>
              </div>
              <p className="font-body text-white/60 text-sm mb-6">Start with 200 of your workers. We handle onboarding. You get a full anonymized wellness report at the end. Zero cost. Zero commitment.</p>
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
              <Link href="/contact?type=employer" className="btn-primary w-full justify-center">
                Book Your Free Pilot <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO TO CALL ───────────────────────────────────── */}
      <section className="py-20 bg-navy-900/50 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-5xl text-white mb-4">Who should reach out?</h2>
          <p className="font-body text-white/50 mb-10">The right people inside your organization to start this conversation:</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['VP / Director of Human Resources', 'Health, Safety & Environment (HSE) Manager', 'Employee Relations Manager', 'Chief People Officer'].map(role => (
              <div key={role} className="glass rounded-xl p-5 border border-white/8">
                <p className="font-heading font-medium text-white text-sm">{role}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/contact?type=employer" className="btn-primary text-base">
              Start the conversation <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  )
}
