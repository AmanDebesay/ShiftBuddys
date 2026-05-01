import Image from 'next/image'
import Link from 'next/link'
import { Heart, Shield, MapPin, Users, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout'
import { ABOUT } from '../data/siteData'

const ICON_MAP = { Heart, Shield, MapPin, Users }

export default function About() {
  return (
    <Layout title="About" description="ShiftBuddys was born in Fort McMurray. Built by locals, for the oilsands community.">

      {/* Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={ABOUT.photo} alt="Fort McMurray" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/90 to-navy-900" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="section-label mb-5">Our story</div>
          <h1 className="font-display text-7xl sm:text-9xl text-white mb-5">
            {ABOUT.headline}
          </h1>
          <p className="font-body text-white/60 text-lg">
            Not built in a boardroom. Built in Fort McMurray.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {ABOUT.story.map((para, i) => (
              <p key={i} className={`font-body text-xl leading-relaxed ${i === 0 ? 'text-white' : 'text-white/60'}`}>
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-navy-900/50 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-6xl text-white">What we stand for.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ABOUT.values.map(value => {
              const Icon = ICON_MAP[value.icon] || Heart
              return (
                <div key={value.title} className="glass rounded-2xl p-7 border border-white/8 text-center card-hover">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto mb-5">
                    <Icon size={22} className="text-orange-400" />
                  </div>
                  <h3 className="font-heading font-bold text-white text-lg mb-3">{value.title}</h3>
                  <p className="font-body text-white/50 text-sm leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-6xl text-white mb-12">The team.</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {ABOUT.team.map(member => (
              <div key={member.name} className="glass rounded-2xl p-8 border border-white/8 w-72 text-center">
                <div className="w-20 h-20 rounded-full border-2 border-orange-500/40 overflow-hidden mx-auto mb-5">
                  {member.photo
                    ? <Image src={member.photo} alt={member.name} width={80} height={80} className="w-full h-full object-cover" />
                    : <span className="font-display text-3xl text-orange-400 flex items-center justify-center h-full">{member.name[0]}</span>
                  }
                </div>
                <h3 className="font-heading font-bold text-white text-lg mb-1">{member.name}</h3>
                <p className="font-body text-orange-400 text-sm mb-3">{member.role}</p>
                <p className="font-body text-white/50 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-navy-800 to-navy-900 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-6xl text-white mb-4">Want to be part of this?</h2>
          <p className="font-body text-white/50 mb-8">Join the waitlist or reach out to discuss partnerships.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary">Join the Waitlist <ArrowRight size={16} /></Link>
            <Link href="/employers" className="btn-secondary">For Employers</Link>
          </div>
        </div>
      </section>

    </Layout>
  )
}
