import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Download, Play, Star, ChevronRight, Check, Shield, Zap } from 'lucide-react'
import Layout from '../components/Layout'
import CountdownWidget from '../components/CountdownWidget'
import { HERO, MODULES, COMING_HOME, TESTIMONIALS, FAQ, DOWNLOAD, SITE } from '../data/siteData'

// ─── Stat card ───────────────────────────────────────────────
function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-display text-5xl text-orange-400 leading-none mb-1">{value}</div>
      <div className="font-body text-white/50 text-sm">{label}</div>
    </div>
  )
}

// ─── Module card (home preview) ──────────────────────────────
function ModuleCard({ mod, index }) {
  return (
    <div
      className="glass rounded-2xl overflow-hidden card-hover border border-white/8 group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-44 overflow-hidden">
        <Image src={mod.photo} alt={mod.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent" />
        <div className="absolute top-4 left-4 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: mod.color + '30', border: `1px solid ${mod.color}60` }}>
          {mod.emoji}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-heading font-bold text-white text-lg mb-1">{mod.title}</h3>
        <p className="font-body text-white/50 text-sm leading-relaxed mb-4">{mod.subtitle}</p>
        <Link href={`/features#${mod.id}`} className="inline-flex items-center gap-1.5 text-orange-400 text-sm font-heading font-medium hover:gap-3 transition-all">
          Learn more <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

// ─── Testimonial ─────────────────────────────────────────────
function Testimonial({ t }) {
  return (
    <div className="glass rounded-2xl p-6 border border-white/8 flex flex-col gap-4">
      <div className="flex gap-1">
        {Array(t.rating).fill(0).map((_, i) => (
          <Star key={i} size={14} className="text-orange-400 fill-orange-400" />
        ))}
      </div>
      <p className="font-body text-white/80 text-sm leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
        <div className="w-10 h-10 rounded-full bg-navy-500/60 flex items-center justify-center text-orange-400 font-heading font-bold text-sm">
          {t.name[0]}
        </div>
        <div>
          <p className="font-heading font-semibold text-white text-sm">{t.name}</p>
          <p className="font-body text-white/40 text-xs">{t.role} · {t.rotation}</p>
        </div>
      </div>
    </div>
  )
}

// ─── FAQ Item ────────────────────────────────────────────────
function FAQItem({ q, a, index }) {
  return (
    <details className="group glass rounded-xl border border-white/8 overflow-hidden">
      <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-heading font-medium text-white text-sm hover:text-orange-400 transition-colors">
        {q}
        <ChevronRight size={18} className="text-white/40 group-open:rotate-90 transition-transform flex-shrink-0 ml-3" />
      </summary>
      <div className="px-6 pb-5 font-body text-white/60 text-sm leading-relaxed border-t border-white/8 pt-4">
        {a}
      </div>
    </details>
  )
}

// ─── Page ────────────────────────────────────────────────────
export default function Home() {
  return (
    <Layout>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Background photo */}
        <div className="absolute inset-0 z-0">
          <Image
            src={HERO.photo}
            alt="Oilsands worker"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-navy-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />
        </div>

        {/* Noise texture */}
        <div className="absolute inset-0 z-0 opacity-30"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — copy */}
            <div>
              <div className="section-label mb-6 animate-fade-up">{HERO.eyebrow}</div>
              <h1 className="font-display text-[80px] sm:text-[100px] lg:text-[110px] leading-[0.9] text-white mb-6 animate-fade-up animate-delay-100">
                {HERO.headline.split('\n').map((line, i) => (
                  <span key={i} className={i === 1 ? 'text-gradient block' : 'block'}>{line}</span>
                ))}
              </h1>
              <p className="font-body text-white/70 text-lg leading-relaxed mb-8 max-w-lg animate-fade-up animate-delay-200">
                {HERO.subheadline}
              </p>
              <div className="flex flex-wrap gap-4 mb-12 animate-fade-up animate-delay-300">
                <Link href="#download" className="btn-primary text-base px-8 py-4">
                  <Download size={18} />
                  {HERO.cta_primary.label}
                </Link>
                <Link href="#how-it-works" className="btn-secondary text-base px-8 py-4">
                  <Play size={16} className="fill-white" />
                  {HERO.cta_secondary.label}
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-white/10 animate-fade-up animate-delay-400">
                {HERO.stats.map(s => <StatCard key={s.label} {...s} />)}
              </div>
            </div>

            {/* Right — countdown widget */}
            <div className="hidden lg:block animate-fade-up animate-delay-300">
              <div className="relative max-w-sm ml-auto">
                <div className="absolute -inset-4 bg-orange-500/10 rounded-3xl blur-2xl" />
                <CountdownWidget targetDays={9} />
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-2 border border-orange-400/30 animate-float">
                  <p className="font-heading font-semibold text-orange-400 text-xs">Family notified ✓</p>
                </div>
                <div className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-2 border border-green-400/30 animate-float" style={{ animationDelay: '2s' }}>
                  <p className="font-heading font-semibold text-green-400 text-xs">Shift swap confirmed ✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM STRIP ─────────────────────────────────── */}
      <section className="bg-navy-800/60 border-y border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-center md:text-left">
            <p className="font-body text-white/40 text-sm">The only app built for rotation workers that covers:</p>
            {['Schedule & countdown', 'Family connection', 'Financial wellness', 'Mental health', 'Crew network', 'Fort Mac life'].map(item => (
              <div key={item} className="flex items-center gap-2 text-white/70 text-sm font-heading">
                <Check size={14} className="text-orange-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-label mb-4">How it works</div>
            <h2 className="font-display text-6xl sm:text-7xl text-white mb-4">
              Up and running in <span className="text-gradient">60 seconds</span>
            </h2>
            <p className="font-body text-white/50 text-lg max-w-xl mx-auto">
              No complicated setup. Your shift calendar generates automatically.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Set Your Rotation', desc: 'Choose your pattern — 14/7, 21/7, 7/7, or custom. Your full year generates instantly.' },
              { step: '02', title: 'Invite Your Family', desc: 'Send a link via SMS or WhatsApp. They get the free companion app and your schedule appears on their calendar.' },
              { step: '03', title: 'Watch it Count Down', desc: 'Your "Home in X days" countdown starts immediately. Check it every morning. Your crew is already waiting.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative glass rounded-2xl p-8 border border-white/8 text-center">
                <div className="font-display text-8xl text-orange-500/15 absolute top-4 right-6 leading-none select-none">{step}</div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto mb-5">
                  <span className="font-heading font-bold text-orange-400 text-lg">{step}</span>
                </div>
                <h3 className="font-heading font-bold text-white text-xl mb-3">{title}</h3>
                <p className="font-body text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────── */}
      <section className="py-24 bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-label mb-4">6 complete modules</div>
            <h2 className="font-display text-6xl sm:text-7xl text-white mb-4">
              Everything you need.<br /><span className="text-gradient">Nothing you don't.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((mod, i) => <ModuleCard key={mod.id} mod={mod} index={i} />)}
          </div>
          <div className="text-center mt-10">
            <Link href="/features" className="btn-outline">
              See all features in detail <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMING HOME MODE ──────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={COMING_HOME.photo} alt="Coming home" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/95 to-navy-900/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="section-label mb-6">{COMING_HOME.label}</div>
            <h2 className="font-display text-6xl sm:text-7xl text-white mb-4">
              {COMING_HOME.title}
            </h2>
            <p className="font-heading text-orange-400 font-medium mb-4">{COMING_HOME.subtitle}</p>
            <p className="font-body text-white/60 text-lg leading-relaxed mb-10">{COMING_HOME.description}</p>
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              <div className="glass rounded-2xl p-6 border border-orange-400/20">
                <p className="font-heading font-semibold text-orange-400 text-sm mb-4 uppercase tracking-wider">For the Worker</p>
                <ul className="space-y-3">
                  {COMING_HOME.worker_prompts.map((p, i) => (
                    <li key={i} className="font-body text-white/70 text-sm italic leading-relaxed">{p}</li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-2xl p-6 border border-blue-400/20">
                <p className="font-heading font-semibold text-blue-400 text-sm mb-4 uppercase tracking-wider">For the Partner</p>
                <ul className="space-y-3">
                  {COMING_HOME.partner_prompts.map((p, i) => (
                    <li key={i} className="font-body text-white/70 text-sm italic leading-relaxed">{p}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Link href="/features#family-sync" className="btn-primary">
              Learn about Coming Home Mode <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="py-24 bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-label mb-4">What workers say</div>
            <h2 className="font-display text-6xl sm:text-7xl text-white">
              From the patch.<br /><span className="text-gradient">Not the brochure.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map(t => <Testimonial key={t.name} t={t} />)}
          </div>
        </div>
      </section>

      {/* ── EMPLOYER STRIP ────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-navy-800 to-navy-700 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <div className="section-label mb-3">For Suncor, CNRL, Syncrude & contractors</div>
              <h3 className="font-display text-4xl sm:text-5xl text-white">
                Free 90-day enterprise pilot.<br />Zero commitment.
              </h3>
            </div>
            <div className="flex-shrink-0">
              <Link href="/employers" className="btn-primary text-base">
                Book a Pilot <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-label mb-4">FAQ</div>
            <h2 className="font-display text-6xl sm:text-7xl text-white">
              Questions answered.
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQ.map((item, i) => <FAQItem key={i} {...item} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── DOWNLOAD CTA ──────────────────────────────────── */}
      <section id="download" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-navy-800 to-navy-900" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="section-label mb-6">{DOWNLOAD.note}</div>
          <h2 className="font-display text-7xl sm:text-8xl text-white mb-4">
            {DOWNLOAD.headline}
          </h2>
          <p className="font-body text-white/60 text-lg mb-10">{DOWNLOAD.subheadline}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={SITE.appStore}
              className="btn-primary text-base px-10 py-4 justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Download on App Store
            </a>
            <a href={SITE.playStore}
              className="btn-secondary text-base px-10 py-4 justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M3,20.5v-17c0-0.83,0.94-1.3,1.6-0.8l15,8.5c0.6,0.34,0.6,1.26,0,1.6l-15,8.5C3.94,21.8,3,21.33,3,20.5z"/></svg>
              Get it on Google Play
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-white/30 text-xs font-body">
            <div className="flex items-center gap-1.5"><Shield size={12} /><span>Free to download</span></div>
            <div className="flex items-center gap-1.5"><Zap size={12} /><span>Set up in 60 seconds</span></div>
            <div className="flex items-center gap-1.5"><Check size={12} /><span>iOS &amp; Android</span></div>
          </div>
        </div>
      </section>

    </Layout>
  )
}
