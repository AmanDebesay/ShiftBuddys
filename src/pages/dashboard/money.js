import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft, DollarSign, TrendingUp, Target, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function fmt(n) {
  return Number(n).toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 })
}

export default function MoneyManager() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState(null)

  const [hourlyRate, setHourlyRate] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState('10')
  const [savingsGoal, setSavingsGoal] = useState('')
  const [savingsCurrent, setSavingsCurrent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        if (!data) return
        setProfile(data)
        if (data.hourly_rate)    setHourlyRate(String(data.hourly_rate))
        if (data.hours_per_day)  setHoursPerDay(String(data.hours_per_day))
        if (data.savings_goal)   setSavingsGoal(String(data.savings_goal))
        if (data.savings_current) setSavingsCurrent(String(data.savings_current))
      })
  }, [user])

  const calc = useMemo(() => {
    const rate = parseFloat(hourlyRate)
    const hpd  = parseFloat(hoursPerDay)
    if (!rate || !hpd || !profile?.rotation_pattern) return null
    const parts = profile.rotation_pattern.split('/')
    if (parts.length !== 2) return null
    const onDays  = parseInt(parts[0])
    const offDays = parseInt(parts[1])
    const grossPerRotation = rate * hpd * onDays
    const cycleWeeks = (onDays + offDays) / 7
    const grossAnnual = (52 / cycleWeeks) * grossPerRotation
    // Simple CPP/EI/Tax estimate (Alberta, no provincial income tax bracket precision)
    const cpp = Math.min(grossAnnual * 0.0595, 3867)
    const ei  = Math.min(grossAnnual * 0.0166, 1049)
    const federalTax = grossAnnual < 57375 ? grossAnnual * 0.205
      : grossAnnual < 114750 ? 11762 + (grossAnnual - 57375) * 0.205
      : 23519 + (grossAnnual - 114750) * 0.26
    const basicPersonal = 15705 * 0.15
    const net = grossAnnual - cpp - ei - Math.max(0, federalTax - basicPersonal)
    return {
      grossPerRotation,
      grossBiweekly: (grossAnnual / 26),
      grossAnnual,
      netAnnual: net,
      netPerRotation: net * (cycleWeeks / 52) * (onDays / (onDays + offDays)) * (onDays + offDays) / 7,
      deductions: cpp + ei + Math.max(0, federalTax - basicPersonal),
    }
  }, [hourlyRate, hoursPerDay, profile])

  const goalPct = useMemo(() => {
    const cur = parseFloat(savingsCurrent)
    const goal = parseFloat(savingsGoal)
    if (!cur || !goal || goal <= 0) return null
    return Math.min((cur / goal) * 100, 100)
  }, [savingsCurrent, savingsGoal])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      hourly_rate:     hourlyRate   ? parseFloat(hourlyRate)   : null,
      hours_per_day:   hoursPerDay  ? parseFloat(hoursPerDay)  : null,
      savings_goal:    savingsGoal  ? parseFloat(savingsGoal)  : null,
      savings_current: savingsCurrent ? parseFloat(savingsCurrent) : null,
    }).eq('id', user.id)
    if (!error) setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading || !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/8 px-4 py-3.5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={16} className="text-white/60" />
          </Link>
          <img src="/images/logo.svg" alt="ShiftBuddys" className="h-8 w-auto" />
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-7 space-y-5">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Money Manager</h1>
          <p className="font-body text-white/35 text-sm mt-0.5">Paycheck tracker &middot; Savings goal &middot; Alberta estimates</p>
        </div>

        {/* Inputs */}
        <div className="glass rounded-3xl p-6 border border-white/8 space-y-5">
          <p className="font-heading font-semibold text-white text-sm">Your Rate</p>

          <div>
            <label className="font-heading text-white/40 text-xs uppercase tracking-wider block mb-2">Hourly rate (CAD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-heading font-semibold text-white/30">$</span>
              <input type="number" min="0" step="0.50" placeholder="42.50"
                value={hourlyRate} onChange={e => { setHourlyRate(e.target.value); setSaved(false) }}
                className="input-field pl-7 w-full" />
            </div>
          </div>

          <div>
            <label className="font-heading text-white/40 text-xs uppercase tracking-wider block mb-2">Hours per shift day</label>
            <div className="flex gap-2 flex-wrap">
              {['8', '10', '12', '14'].map(h => (
                <button key={h} onClick={() => { setHoursPerDay(h); setSaved(false) }}
                  className={`px-4 py-2 rounded-lg font-heading font-medium text-sm transition-all ${
                    hoursPerDay === h
                      ? 'bg-orange-500/25 text-orange-300 border border-orange-400/40'
                      : 'bg-white/5 text-white/35 border border-white/8 hover:bg-white/10'
                  }`}>{h}h</button>
              ))}
              <input type="number" min="1" max="24" placeholder="Other"
                value={!['8','10','12','14'].includes(hoursPerDay) ? hoursPerDay : ''}
                onChange={e => { setHoursPerDay(e.target.value); setSaved(false) }}
                className="input-field w-20 text-sm" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="btn-primary justify-center w-full gap-2 disabled:opacity-40">
            <Save size={15} />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Rate'}
          </button>
        </div>

        {/* Calculated breakdown */}
        {calc && (
          <div className="space-y-3">
            <p className="font-heading text-white/30 text-xs uppercase tracking-wider">Estimated Earnings</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-2xl p-4 border border-orange-500/20 text-center">
                <p className="font-body text-white/30 text-xs mb-1">Per Rotation</p>
                <p className="font-display text-3xl text-white leading-none">{fmt(calc.grossPerRotation)}</p>
                <p className="font-body text-white/20 text-xs mt-1">gross</p>
              </div>
              <div className="glass rounded-2xl p-4 border border-white/8 text-center">
                <p className="font-body text-white/30 text-xs mb-1">Annual</p>
                <p className="font-display text-3xl text-white leading-none">{fmt(calc.grossAnnual)}</p>
                <p className="font-body text-white/20 text-xs mt-1">gross</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/8">
              <p className="font-heading font-semibold text-white text-sm mb-4">Alberta Tax Estimate</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Gross annual',          val: fmt(calc.grossAnnual),   color: 'text-white' },
                  { label: 'CPP + EI + Fed. Tax',   val: `− ${fmt(calc.deductions)}`, color: 'text-red-300' },
                  { label: 'Est. net annual',        val: fmt(calc.netAnnual),    color: 'text-green-300' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex justify-between items-center">
                    <p className="font-body text-white/40 text-sm">{label}</p>
                    <p className={`font-heading font-semibold text-sm ${color}`}>{val}</p>
                  </div>
                ))}
              </div>
              <p className="font-body text-white/15 text-xs mt-4">
                Estimate only — Alberta has no provincial income tax. Consult an accountant for precise figures.
              </p>
            </div>

            {/* RRSP nudge */}
            <div className="glass rounded-2xl p-5 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={15} className="text-yellow-400" />
                <p className="font-heading font-semibold text-yellow-300 text-sm">RRSP Room</p>
              </div>
              <p className="font-body text-white/45 text-sm leading-relaxed">
                Your RRSP contribution room is 18% of last year's earned income (max $31,560 for 2024).
                At your rate that's approximately <span className="text-yellow-300 font-semibold">{fmt(calc.grossAnnual * 0.18)}</span>.
              </p>
              <p className="font-body text-white/20 text-xs mt-2">
                Contributions reduce your taxable income dollar-for-dollar.
              </p>
            </div>
          </div>
        )}

        {/* Savings goal */}
        <div className="glass rounded-3xl p-6 border border-white/8 space-y-5">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-green-400" />
            <p className="font-heading font-semibold text-white text-sm">Savings Goal</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-heading text-white/40 text-xs uppercase tracking-wider block mb-2">Goal ($)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-heading font-semibold text-white/30">$</span>
                <input type="number" min="0" placeholder="20000"
                  value={savingsGoal} onChange={e => { setSavingsGoal(e.target.value); setSaved(false) }}
                  className="input-field pl-7 w-full" />
              </div>
            </div>
            <div>
              <label className="font-heading text-white/40 text-xs uppercase tracking-wider block mb-2">Saved so far ($)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-heading font-semibold text-white/30">$</span>
                <input type="number" min="0" placeholder="8500"
                  value={savingsCurrent} onChange={e => { setSavingsCurrent(e.target.value); setSaved(false) }}
                  className="input-field pl-7 w-full" />
              </div>
            </div>
          </div>

          {goalPct !== null && (
            <div>
              <div className="flex justify-between text-xs font-heading text-white/35 mb-2">
                <span>{fmt(parseFloat(savingsCurrent))} saved</span>
                <span>{goalPct.toFixed(0)}% of {fmt(parseFloat(savingsGoal))}</span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700"
                  style={{ width: `${Math.min(Math.max(goalPct, 2), 100)}%` }}
                />
              </div>
              {goalPct >= 100 && (
                <p className="font-heading font-semibold text-green-300 text-sm text-center mt-3">🎉 Goal reached!</p>
              )}
              {goalPct < 100 && calc && (
                <p className="font-body text-white/25 text-xs text-center mt-2">
                  {fmt(parseFloat(savingsGoal) - parseFloat(savingsCurrent))} to go
                  {calc ? ` · ~${Math.ceil((parseFloat(savingsGoal) - parseFloat(savingsCurrent)) / (calc.grossPerRotation * 0.3))} rotations at 30% save rate` : ''}
                </p>
              )}
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
            className="btn-primary justify-center w-full gap-2 disabled:opacity-40">
            <Save size={15} />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Goal'}
          </button>
        </div>

        <div className="h-4" />
      </main>
    </div>
  )
}
