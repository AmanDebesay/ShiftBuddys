import Link from 'next/link'
import { Check, Shield, Zap, Star } from 'lucide-react'
import Layout from '../components/Layout'
import CountdownWidget from '../components/CountdownWidget'
import { SITE, TESTIMONIALS } from '../data/siteData'

export default function Download() {
  return (
    <Layout title="Download" description="Download ShiftBuddys free on iOS and Android. The app built for oilsands rotation workers.">

      {/* Hero */}
      <section className="pt-32 pb-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-navy-800 to-navy-900" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="section-label mb-5">Available on iOS &amp; Android</div>
          <h1 className="font-display text-7xl sm:text-9xl text-white mb-5">
            Download<br /><span className="text-gradient">Free.</span>
          </h1>
          <p className="font-body text-white/60 text-xl mb-10">Set up in 60 seconds. Your countdown starts immediately.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href={SITE.appStore} className="btn-primary text-base px-10 py-5 justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Download on App Store
            </a>
            <a href={SITE.playStore} className="btn-secondary text-base px-10 py-5 justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M3,20.5v-17c0-0.83,0.94-1.3,1.6-0.8l15,8.5c0.6,0.34,0.6,1.26,0,1.6l-15,8.5C3.94,21.8,3,21.33,3,20.5z"/></svg>
              Get it on Google Play
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 text-white/30 text-sm font-body">
            <div className="flex items-center gap-2"><Shield size={14} /><span>Free forever tier</span></div>
            <div className="flex items-center gap-2"><Zap size={14} /><span>60-second setup</span></div>
            <div className="flex items-center gap-2"><Check size={14} /><span>No credit card</span></div>
          </div>
        </div>
      </section>

      {/* Live countdown demo */}
      <section className="py-16 bg-navy-900/50 border-y border-white/5">
        <div className="max-w-sm mx-auto px-4 text-center">
          <p className="font-heading text-white/60 text-sm uppercase tracking-widest mb-6">This is what you&apos;ll see every morning</p>
          <CountdownWidget targetDays={9} />
        </div>
      </section>

      {/* What's included */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-6xl text-white mb-12">What&apos;s free. Forever.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left mb-12">
            {[
              'Shift calendar & rotation setup',
              '"Home in X days" live countdown',
              'Family sync for 2 members',
              'Safe arrival pings',
              'Basic mood check-in',
              'Fort Mac Life events feed',
              'Weather widget (Fort McMurray)',
              'Alberta Emergency Alerts',
              'Crew chat (read-only)',
              'Newcomer guide',
              'Local news feed',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-white/8">
                <Check size={16} className="text-orange-400 flex-shrink-0" />
                <span className="font-body text-white/70 text-sm">{f}</span>
              </div>
            ))}
          </div>
          <p className="font-body text-white/40 text-sm">
            Premium features available at $7.99/month or $59.99/year.{' '}
            <Link href="/pricing" className="text-orange-400 hover:text-orange-300">See full pricing →</Link>
          </p>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 bg-navy-900/50 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex gap-1">{Array(5).fill(0).map((_, i) => <Star key={i} size={20} className="text-orange-400 fill-orange-400" />)}</div>
            <span className="font-heading font-bold text-white text-2xl">5.0</span>
            <span className="font-body text-white/40 text-sm">from beta users</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {TESTIMONIALS.slice(0, 2).map(t => (
              <div key={t.name} className="glass rounded-2xl p-6 border border-white/8">
                <div className="flex gap-1 mb-3">{Array(t.rating).fill(0).map((_, i) => <Star key={i} size={12} className="text-orange-400 fill-orange-400" />)}</div>
                <p className="font-body text-white/70 text-sm leading-relaxed italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="font-heading font-semibold text-white text-sm">{t.name} <span className="font-normal text-white/40">— {t.role}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </Layout>
  )
}
