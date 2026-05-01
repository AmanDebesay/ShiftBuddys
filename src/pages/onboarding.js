import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ChevronRight, Check, Calendar, Home } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const ROTATIONS = [
  { value: '14/7',  label: '14 on / 7 off',  desc: 'Two weeks in, one week home' },
  { value: '21/7',  label: '21 on / 7 off',  desc: 'Three weeks in, one week home' },
  { value: '7/7',   label: '7 on / 7 off',   desc: 'One week on, one week off' },
  { value: '28/14', label: '28 on / 14 off', desc: 'Four weeks in, two weeks home' },
  { value: 'custom', label: 'Custom rotation', desc: 'I work a different schedule' },
]

export default function Onboarding() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [step, setStep] = useState(1)
  const [rotation, setRotation] = useState('')
  const [customRotation, setCustomRotation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  const rotationValue = rotation === 'custom' ? customRotation : rotation

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: user.user_metadata?.name || '',
      rotation_pattern: rotationValue,
      rotation_start_date: startDate,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    })
    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      router.push('/dashboard')
    }
  }

  if (loading || !user) return null

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-bold transition-all duration-300 ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40' : 'bg-white/10 text-white/30'
              }`}>
                {i < step ? <Check size={14} /> : i}
              </div>
              {i < 3 && <div className={`w-10 h-0.5 transition-all duration-500 ${i < step ? 'bg-green-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 — rotation pattern */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-orange-400" />
              </div>
              <h1 className="font-heading font-bold text-white text-3xl mb-2">What&apos;s your rotation?</h1>
              <p className="font-body text-white/50 text-sm">This powers your personal shift calendar and countdown</p>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {ROTATIONS.map(r => (
                <button key={r.value} onClick={() => setRotation(r.value)}
                  className={`glass rounded-2xl p-4 border text-left transition-all flex items-center gap-4 ${
                    rotation === r.value ? 'border-orange-500/60 bg-orange-500/10' : 'border-white/8 hover:border-white/20'
                  }`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    rotation === r.value ? 'border-orange-500 bg-orange-500' : 'border-white/30'
                  }`}>
                    {rotation === r.value && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-white text-sm">{r.label}</p>
                    <p className="font-body text-white/40 text-xs">{r.desc}</p>
                  </div>
                </button>
              ))}
              {rotation === 'custom' && (
                <input type="text" placeholder="e.g. 10/4 or 21/14"
                  value={customRotation} onChange={e => setCustomRotation(e.target.value)}
                  className="input-field" />
              )}
            </div>

            <button onClick={() => setStep(2)}
              disabled={!rotation || (rotation === 'custom' && !customRotation)}
              className="btn-primary justify-center w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2 — rotation start date */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto mb-4">
                <Home size={24} className="text-orange-400" />
              </div>
              <h1 className="font-heading font-bold text-white text-3xl mb-2">When did your shift start?</h1>
              <p className="font-body text-white/50 text-sm">The first day you arrived at site this rotation</p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/8 mb-6">
              <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-3">Rotation Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                max={today}
                className="input-field"
                style={{ colorScheme: 'dark' }} />
              <p className="font-body text-white/30 text-xs mt-3">
                Currently at home? Enter the date your most recent on-shift started.
              </p>
            </div>

            {error && <p className="font-body text-red-400 text-sm text-center mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1 justify-center">Back</button>
              <button onClick={() => setStep(3)} disabled={!startDate}
                className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — confirm */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-green-400" />
              </div>
              <h1 className="font-heading font-bold text-white text-3xl mb-2">You&apos;re all set!</h1>
              <p className="font-body text-white/50 text-sm">Your shift calendar is ready</p>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/8 mb-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-heading text-white/50 text-sm">Rotation</span>
                <span className="font-heading font-semibold text-white">{rotationValue}</span>
              </div>
              <div className="h-px bg-white/8" />
              <div className="flex justify-between items-center">
                <span className="font-heading text-white/50 text-sm">Shift started</span>
                <span className="font-heading font-semibold text-white">
                  {new Date(startDate + 'T12:00:00').toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {error && <p className="font-body text-red-400 text-sm text-center mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline flex-1 justify-center">Back</button>
              <button onClick={handleSave} disabled={saving}
                className="btn-primary flex-1 justify-center disabled:opacity-60">
                {saving ? 'Saving...' : (<>Go to Dashboard <ChevronRight size={16} /></>)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
