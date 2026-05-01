import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Mail, MapPin, Send, Check, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout'
import { SITE } from '../data/siteData'

const ROTATION_OPTIONS = ['14 on / 7 off', '21 on / 7 off', '7 on / 7 off', '28 on / 14 off', 'Custom / Other']
const JOB_OPTIONS = ['Heavy Equipment Operator', 'Process Operator', 'Pipefitter / Welder', 'Electrician / Instrumentation', 'Millwright / Mechanic', 'Labourer / General', 'Driver / Logistics', 'Camp Worker', 'Partner / Family', 'Other']

function WorkerForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', job: '', rotation: '', customRotation: '', company: '', employer: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const res = await fetch('https://formspree.io/f/xbdwjppk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, _subject: 'New Worker Waitlist — ShiftBuddys', formType: 'worker' }),
      })
      if (res.ok) {
        setSent(true)
      } else {
        setError('Something went wrong. Please email us at hello@shiftbuddys.ca')
      }
    } catch {
      setError('Network error. Please try again or email us at hello@shiftbuddys.ca')
    }
    setSending(false)
  }

  if (sent) return (
    <div className="glass rounded-3xl p-10 border border-green-500/30 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-5">
        <Check size={28} className="text-green-400" />
      </div>
      <h3 className="font-heading font-bold text-white text-2xl mb-2">You&apos;re on the list!</h3>
      <p className="font-body text-white/60">We&apos;ll be in touch as soon as ShiftBuddys launches in Fort McMurray. Watch your inbox.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 border border-white/8 flex flex-col gap-5">
      <h3 className="font-heading font-bold text-white text-xl">Join the Worker Waitlist</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Full Name *</label>
          <input required type="text" placeholder="Marcus Thompson" value={form.name} onChange={e => set('name', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Email *</label>
          <input required type="email" placeholder="marcus@email.com" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Phone (optional)</label>
          <input type="tel" placeholder="780-555-0100" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Job Title *</label>
          <select required value={form.job} onChange={e => set('job', e.target.value)} className="input-field">
            <option value="">Select your role</option>
            {JOB_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Your Rotation *</label>
          <select required value={form.rotation} onChange={e => set('rotation', e.target.value)} className="input-field">
            <option value="">Select your rotation</option>
            {ROTATION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {form.rotation === 'Custom / Other' && (
            <input
              type="text"
              required
              placeholder="e.g. 10 on / 4 off, 21 on / 14 off..."
              value={form.customRotation}
              onChange={e => set('customRotation', e.target.value)}
              className="input-field mt-2"
            />
          )}
        </div>
        <div>
          <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Employer / Contractor</label>
          <input type="text" placeholder="Suncor, CNRL, Contractor name..." value={form.company} onChange={e => set('company', e.target.value)} className="input-field" />
        </div>
      </div>
      <div>
        <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Anything else? (optional)</label>
        <textarea rows={3} placeholder="What feature are you most excited about? Any feedback on what we're building?" value={form.message} onChange={e => set('message', e.target.value)} className="input-field resize-none" />
      </div>
      {error && <p className="font-body text-red-400 text-sm text-center">{error}</p>}
      <button type="submit" disabled={sending} className="btn-primary justify-center mt-2">
        {sending ? 'Sending...' : (<><Send size={16} /> Join the Waitlist</>)}
      </button>
      <p className="font-body text-white/30 text-xs text-center">Your data stays private. We will never share or sell your information.</p>
    </form>
  )
}

function EmployerForm() {
  const [form, setForm] = useState({ name: '', title: '', company: '', email: '', phone: '', employees: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const res = await fetch('https://formspree.io/f/xbdwjppk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, _subject: 'New Employer Pilot Request — ShiftBuddys', formType: 'employer' }),
      })
      if (res.ok) {
        setSent(true)
      } else {
        setError('Something went wrong. Please email us at hello@shiftbuddys.ca')
      }
    } catch {
      setError('Network error. Please try again or email us at hello@shiftbuddys.ca')
    }
    setSending(false)
  }

  if (sent) return (
    <div className="glass rounded-3xl p-10 border border-green-500/30 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-5">
        <Check size={28} className="text-green-400" />
      </div>
      <h3 className="font-heading font-bold text-white text-2xl mb-2">Message received!</h3>
      <p className="font-body text-white/60">We&apos;ll be in touch within 24 hours to discuss your pilot proposal.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 border border-orange-500/20 flex flex-col gap-5">
      <h3 className="font-heading font-bold text-white text-xl">Book a Free 90-Day Pilot</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Your Name *</label>
          <input required type="text" placeholder="Sarah Johnson" value={form.name} onChange={e => set('name', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Job Title *</label>
          <input required type="text" placeholder="VP Human Resources" value={form.title} onChange={e => set('title', e.target.value)} className="input-field" />
        </div>
      </div>
      <div>
        <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Company Name *</label>
        <input required type="text" placeholder="Suncor Energy, CNRL, your contractor name..." value={form.company} onChange={e => set('company', e.target.value)} className="input-field" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Work Email *</label>
          <input required type="email" placeholder="sarah@company.com" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Phone Number</label>
          <input type="tel" placeholder="780-555-0100" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" />
        </div>
      </div>
      <div>
        <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Number of Rotation Employees *</label>
        <select required value={form.employees} onChange={e => set('employees', e.target.value)} className="input-field">
          <option value="">Select range</option>
          <option value="under-200">Under 200</option>
          <option value="200-500">200 – 500</option>
          <option value="500-2000">500 – 2,000</option>
          <option value="2000-10000">2,000 – 10,000</option>
          <option value="10000+">10,000+</option>
        </select>
      </div>
      <div>
        <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Tell us about your biggest worker wellness challenge</label>
        <textarea rows={4} placeholder="We're seeing high turnover, low EAP utilization, mental health concerns..." value={form.message} onChange={e => set('message', e.target.value)} className="input-field resize-none" />
      </div>
      {error && <p className="font-body text-red-400 text-sm text-center">{error}</p>}
      <button type="submit" disabled={sending} className="btn-primary justify-center mt-2">
        {sending ? 'Sending...' : (<><Send size={16} /> Request Free Pilot</>)}
      </button>
      <p className="font-body text-white/30 text-xs text-center">We&apos;ll respond within 24 hours. Zero cost. Zero commitment.</p>
    </form>
  )
}

export default function Contact() {
  const router = useRouter()
  const isEmployer = router.query.type === 'employer'
  const [tab, setTab] = useState(isEmployer ? 'employer' : 'worker')

  return (
    <Layout title="Contact & Waitlist" description="Join the ShiftBuddys waitlist or book a free enterprise pilot for your oilsands workforce.">

      {/* Header */}
      <section className="pt-32 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="section-label mb-5">Get in touch</div>
          <h1 className="font-display text-7xl sm:text-8xl text-white mb-5">
            Let&apos;s talk.
          </h1>
          <p className="font-body text-white/60 text-lg">
            Whether you&apos;re a worker ready to join the waitlist or a company ready to pilot — we want to hear from you.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">

            {/* Left — contact info */}
            <div className="lg:col-span-1">
              <div className="glass rounded-3xl p-8 border border-white/8 mb-6">
                <h3 className="font-heading font-bold text-white text-lg mb-6">Contact Info</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                      <Mail size={18} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="font-heading font-medium text-white text-sm mb-0.5">Email</p>
                      <a href={`mailto:${SITE.email}`} className="font-body text-white/50 text-sm hover:text-orange-400 transition-colors">{SITE.email}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="font-heading font-medium text-white text-sm mb-0.5">Based in</p>
                      <p className="font-body text-white/50 text-sm">Fort McMurray, Alberta, Canada</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="glass rounded-3xl p-8 border border-orange-500/20">
                <p className="font-heading font-semibold text-orange-400 text-sm uppercase tracking-wider mb-3">For Employers</p>
                <p className="font-body text-white/60 text-sm leading-relaxed mb-5">
                  Ready to offer ShiftBuddys to your workforce? Our 90-day pilot is free, zero-commitment, and takes one internal email to launch.
                </p>
                <Link href="/employers" className="btn-outline text-sm">
                  Learn about the pilot <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right — forms */}
            <div className="lg:col-span-2">
              {/* Tab switcher */}
              <div className="flex gap-2 mb-6 glass rounded-xl p-1.5 border border-white/8 w-fit">
                {[
                  { id: 'worker', label: '🧑‍🏭 I\'m a worker / family' },
                  { id: 'employer', label: '🏢 I\'m an employer' },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-heading font-medium transition-all ${
                      tab === t.id ? 'bg-orange-500 text-white shadow-lg' : 'text-white/60 hover:text-white'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === 'worker' ? <WorkerForm /> : <EmployerForm />}
            </div>
          </div>
        </div>
      </section>

    </Layout>
  )
}
