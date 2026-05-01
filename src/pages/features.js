import Image from 'next/image'
import Link from 'next/link'
import { Check, ArrowRight, Download } from 'lucide-react'
import Layout from '../components/Layout'
import { MODULES, COMING_HOME } from '../data/siteData'

export default function Features() {
  return (
    <Layout title="Features" description="All 6 ShiftBuddys modules in detail — Shift Hub, Family Sync, Money Manager, Wellbeing, Fort Mac Life, and Crew Network.">

      {/* ── HEADER ────────────────────────────────────────── */}
      <section className="pt-32 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-800/60 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="section-label mb-5">Complete feature breakdown</div>
          <h1 className="font-display text-7xl sm:text-8xl text-white mb-5">
            Every feature.<br /><span className="text-gradient">Every detail.</span>
          </h1>
          <p className="font-body text-white/60 text-lg max-w-2xl mx-auto">
            ShiftBuddys is built around 6 modules that together cover the complete life of a rotation worker. Here&apos;s exactly what each one does.
          </p>
        </div>
      </section>

      {/* ── MODULES ───────────────────────────────────────── */}
      {MODULES.map((mod, index) => (
        <section
          key={mod.id}
          id={mod.id}
          className={`py-24 ${index % 2 === 1 ? 'bg-navy-900/50' : ''}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>

              {/* Photo */}
              <div className={`relative rounded-3xl overflow-hidden ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="relative h-80 lg:h-[520px]">
                  <Image src={mod.photo} alt={mod.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />
                  {/* Module badge */}
                  <div className="absolute bottom-6 left-6 glass rounded-2xl px-5 py-3 border border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mod.emoji}</span>
                      <div>
                        <p className="font-heading font-bold text-white text-sm">{mod.title}</p>
                        <p className="font-body text-white/50 text-xs">{mod.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: mod.color + '20', border: `1px solid ${mod.color}40` }}>
                    {mod.emoji}
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-sm uppercase tracking-wider" style={{ color: mod.color }}>Module {String(index + 1).padStart(2, '0')}</p>
                    <h2 className="font-display text-4xl text-white leading-none">{mod.title}</h2>
                  </div>
                </div>
                <p className="font-body text-white/60 text-lg leading-relaxed mb-8">{mod.description}</p>

                <ul className="space-y-3 mb-8">
                  {mod.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: mod.color + '30', border: `1px solid ${mod.color}50` }}>
                        <Check size={11} style={{ color: mod.color }} />
                      </div>
                      <span className="font-body text-white/70 text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── COMING HOME CALLOUT ───────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-orange-900/20 via-navy-800 to-navy-900 border-y border-orange-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="section-label mb-6">Signature Feature</div>
          <h2 className="font-display text-7xl text-white mb-4">Coming Home Mode</h2>
          <p className="font-body text-white/60 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            {COMING_HOME.description}
          </p>
          <Link href="/contact" className="btn-primary">
            Join the waitlist <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── DOWNLOAD CTA ──────────────────────────────────── */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-6xl text-white mb-4">Ready to start your countdown?</h2>
          <p className="font-body text-white/50 mb-8">Download ShiftBuddys free. Set up in 60 seconds.</p>
          <Link href="/#download" className="btn-primary text-base">
            <Download size={18} /> Download Free
          </Link>
        </div>
      </section>

    </Layout>
  )
}
