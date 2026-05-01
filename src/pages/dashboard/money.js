import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  ArrowLeft, DollarSign, TrendingUp, Target, Save,
  Plus, Pencil, Trash2, X, Check,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

// ── 2026 Canada / Alberta tax constants ──────────────────────────────────────
const CPP_RATE            = 0.0595
const CPP_BASIC_EXEMPTION = 3500
const CPP_MAX_ANNUAL      = 3867.50
const EI_RATE             = 0.0166
const EI_MAX_ANNUAL       = 1049.12

function calcFederalTax(income) {
  const tiers = [
    [57375,             0.15],
    [57375,             0.205],
    [43769,             0.26],
    [61481,             0.29],
    [Infinity,          0.33],
  ]
  let tax = 0, rem = income
  for (const [cap, rate] of tiers) {
    const chunk = Math.min(rem, cap)
    tax += chunk * rate
    rem -= chunk
    if (rem <= 0) break
  }
  return Math.max(tax - 16129 * 0.15, 0)  // basic personal amount credit
}

function calcAlbertaTax(income) {
  const tiers = [
    [148269,            0.10],
    [29653,             0.12],
    [59308,             0.13],
    [118615,            0.14],
    [Infinity,          0.15],
  ]
  let tax = 0, rem = income
  for (const [cap, rate] of tiers) {
    const chunk = Math.min(rem, cap)
    tax += chunk * rate
    rem -= chunk
    if (rem <= 0) break
  }
  return Math.max(tax - 21003 * 0.10, 0)  // AB basic personal amount credit
}

const FREQ_OPTIONS = [
  { value: 52, label: 'Weekly' },
  { value: 26, label: 'Biweekly' },
  { value: 24, label: 'Semi-monthly' },
  { value: 12, label: 'Monthly' },
]

function fmtC(n, decimals = 2) {
  return Number(n || 0).toLocaleString('en-CA', {
    style: 'currency', currency: 'CAD',
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  })
}
function genId() { return Math.random().toString(36).slice(2, 10) }

// ── Component ─────────────────────────────────────────────────────────────────
export default function MoneyManager() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState('paycheck')

  // Pay inputs
  const [hourlyRate,    setHourlyRate]    = useState('')
  const [regularHours,  setRegularHours]  = useState('80')
  const [otHours,       setOtHours]       = useState('0')
  const [otMultiplier,  setOtMultiplier]  = useState('1.5')
  const [payFreq,       setPayFreq]       = useState(26)

  // Savings
  const [savingsGoal,     setSavingsGoal]     = useState('')
  const [savingsCurrent,  setSavingsCurrent]  = useState('')

  // Custom deductions  [{id, name, type:'amount'|'percent', value}]
  const [customDeductions, setCustomDeductions] = useState([])

  // Add / edit form
  const [showForm,   setShowForm]   = useState(false)
  const [editId,     setEditId]     = useState(null)
  const [formName,   setFormName]   = useState('')
  const [formType,   setFormType]   = useState('amount')
  const [formValue,  setFormValue]  = useState('')

  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        if (!data) return
        setProfile(data)
        if (data.hourly_rate)     setHourlyRate(String(data.hourly_rate))
        if (data.savings_goal)    setSavingsGoal(String(data.savings_goal))
        if (data.savings_current) setSavingsCurrent(String(data.savings_current))
        const cfg = data.money_config || {}
        if (cfg.regular_hours  != null) setRegularHours(String(cfg.regular_hours))
        if (cfg.ot_hours       != null) setOtHours(String(cfg.ot_hours))
        if (cfg.ot_multiplier  != null) setOtMultiplier(String(cfg.ot_multiplier))
        if (cfg.pay_frequency  != null) setPayFreq(Number(cfg.pay_frequency))
        if (cfg.custom_deductions)      setCustomDeductions(cfg.custom_deductions)
      })
  }, [user])

  // ── Calculations ─────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const rate = parseFloat(hourlyRate)
    const regH = parseFloat(regularHours) || 0
    const otH  = parseFloat(otHours) || 0
    const otM  = parseFloat(otMultiplier) || 1.5
    if (!rate || rate <= 0) return null

    const grossRegular  = rate * regH
    const grossOT       = rate * otH * otM
    const grossPeriod   = grossRegular + grossOT
    const annualGross   = grossPeriod * payFreq

    const annualCPP  = Math.min(Math.max(annualGross - CPP_BASIC_EXEMPTION, 0) * CPP_RATE, CPP_MAX_ANNUAL)
    const annualEI   = Math.min(annualGross * EI_RATE, EI_MAX_ANNUAL)
    const annualFed  = calcFederalTax(annualGross)
    const annualAB   = calcAlbertaTax(annualGross)

    const cppPeriod  = annualCPP / payFreq
    const eiPeriod   = annualEI  / payFreq
    const fedPeriod  = annualFed / payFreq
    const abPeriod   = annualAB  / payFreq
    const stdPeriod  = cppPeriod + eiPeriod + fedPeriod + abPeriod

    const customTotal = customDeductions.reduce((sum, d) => {
      const v = parseFloat(d.value) || 0
      return sum + (d.type === 'percent' ? grossPeriod * v / 100 : v)
    }, 0)

    const totalDeductions = stdPeriod + customTotal
    const netPeriod  = grossPeriod - totalDeductions
    const netAnnual  = netPeriod * payFreq

    return {
      grossRegular, grossOT, grossPeriod, annualGross,
      cppPeriod, eiPeriod, fedPeriod, abPeriod, stdPeriod,
      annualCPP, annualEI, annualFed, annualAB,
      customTotal, totalDeductions, netPeriod, netAnnual,
    }
  }, [hourlyRate, regularHours, otHours, otMultiplier, payFreq, customDeductions])

  const customBreakdown = useMemo(() => {
    if (!calc) return []
    return customDeductions.map(d => {
      const v = parseFloat(d.value) || 0
      return { ...d, amount: d.type === 'percent' ? calc.grossPeriod * v / 100 : v }
    })
  }, [calc, customDeductions])

  const goalPct = useMemo(() => {
    const cur  = parseFloat(savingsCurrent)
    const goal = parseFloat(savingsGoal)
    if (!cur || !goal || goal <= 0) return null
    return Math.min((cur / goal) * 100, 100)
  }, [savingsCurrent, savingsGoal])

  // ── Persist ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').update({
      hourly_rate:     parseFloat(hourlyRate) || null,
      savings_goal:    parseFloat(savingsGoal) || null,
      savings_current: parseFloat(savingsCurrent) || null,
      money_config: {
        regular_hours:     parseFloat(regularHours) || 0,
        ot_hours:          parseFloat(otHours) || 0,
        ot_multiplier:     parseFloat(otMultiplier) || 1.5,
        pay_frequency:     payFreq,
        custom_deductions: customDeductions,
      },
    }).eq('id', user.id)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  // ── Deduction CRUD ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditId(null); setFormName(''); setFormType('amount'); setFormValue(''); setShowForm(true)
  }
  const openEdit = (d) => {
    setEditId(d.id); setFormName(d.name); setFormType(d.type); setFormValue(String(d.value)); setShowForm(true)
  }
  const saveDeduction = () => {
    if (!formName.trim() || !formValue) return
    const item = { id: editId || genId(), name: formName.trim(), type: formType, value: parseFloat(formValue) }
    setCustomDeductions(prev => editId ? prev.map(d => d.id === editId ? item : d) : [...prev, item])
    setShowForm(false)
    setSaved(false)
  }
  const deleteDeduction = (id) => { setCustomDeductions(prev => prev.filter(d => d.id !== id)); setSaved(false) }

  if (loading || !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const freqLabel = FREQ_OPTIONS.find(f => f.value === payFreq)?.label || 'Biweekly'

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
          <p className="font-body text-white/35 text-sm mt-0.5">Paycheck calculator · Alberta tax estimates · Savings goals</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/8">
          {[['paycheck', 'Paycheck'], ['projections', 'Projections'], ['savings', 'Savings']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-lg font-heading font-semibold text-sm transition-all ${
                tab === key
                  ? 'bg-orange-500/25 text-orange-300 border border-orange-400/30'
                  : 'text-white/35 hover:text-white/60'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── PAYCHECK ─────────────────────────────────────────────────────────── */}
        {tab === 'paycheck' && (
          <div className="space-y-4">

            {/* Pay setup */}
            <div className="glass rounded-2xl p-5 border border-white/8 space-y-4">
              <p className="font-heading font-semibold text-white text-sm">Pay Setup</p>

              <div>
                <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">Hourly Rate (CAD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 font-semibold">$</span>
                  <input type="number" min="0" step="0.25" placeholder="44.28"
                    value={hourlyRate}
                    onChange={e => { setHourlyRate(e.target.value); setSaved(false) }}
                    className="input-field pl-7 w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">Regular Hours</label>
                  <input type="number" min="0" step="0.5" placeholder="80"
                    value={regularHours}
                    onChange={e => { setRegularHours(e.target.value); setSaved(false) }}
                    className="input-field w-full" />
                </div>
                <div>
                  <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">OT Hours</label>
                  <input type="number" min="0" step="0.5" placeholder="0"
                    value={otHours}
                    onChange={e => { setOtHours(e.target.value); setSaved(false) }}
                    className="input-field w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">OT Rate</label>
                  <div className="flex gap-1">
                    {['1.0', '1.5', '2.0'].map(m => (
                      <button key={m} onClick={() => { setOtMultiplier(m); setSaved(false) }}
                        className={`flex-1 py-2 rounded-lg text-xs font-heading font-semibold border transition-all ${
                          otMultiplier === m
                            ? 'bg-orange-500/20 text-orange-300 border-orange-400/30'
                            : 'bg-white/5 text-white/30 border-white/8 hover:bg-white/10'
                        }`}>{m}x</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">Pay Frequency</label>
                  <select value={payFreq} onChange={e => { setPayFreq(Number(e.target.value)); setSaved(false) }}
                    className="input-field w-full text-sm">
                    {FREQ_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {calc ? (
              <>
                {/* Earnings */}
                <div className="glass rounded-2xl p-5 border border-green-500/20">
                  <p className="font-heading text-white/30 text-xs uppercase tracking-wider mb-3">Earnings · {freqLabel}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-body text-white/55 text-sm">
                        Regular ({regularHours}h × {fmtC(parseFloat(hourlyRate))})
                      </span>
                      <span className="font-heading font-semibold text-white text-sm">{fmtC(calc.grossRegular)}</span>
                    </div>
                    {parseFloat(otHours) > 0 && (
                      <div className="flex justify-between">
                        <span className="font-body text-white/55 text-sm">
                          Overtime ({otHours}h × {fmtC(parseFloat(hourlyRate))} × {otMultiplier}x)
                        </span>
                        <span className="font-heading font-semibold text-orange-300 text-sm">{fmtC(calc.grossOT)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2.5 border-t border-white/8 mt-1">
                      <span className="font-heading font-bold text-white text-sm">Gross Pay</span>
                      <span className="font-heading font-bold text-white text-sm">{fmtC(calc.grossPeriod)}</span>
                    </div>
                  </div>
                </div>

                {/* Standard deductions */}
                <div className="glass rounded-2xl p-5 border border-red-500/15">
                  <p className="font-heading text-white/30 text-xs uppercase tracking-wider mb-3">
                    Standard Deductions · Auto-Calculated
                  </p>
                  <div className="space-y-2">
                    {[
                      { name: `CPP (${(CPP_RATE * 100).toFixed(2)}%)`,          val: calc.cppPeriod },
                      { name: `EI (${(EI_RATE * 100).toFixed(2)}%)`,            val: calc.eiPeriod  },
                      { name: 'Federal Income Tax',                              val: calc.fedPeriod },
                      { name: 'Alberta Provincial Tax',                          val: calc.abPeriod  },
                    ].map(({ name, val }) => (
                      <div key={name} className="flex justify-between">
                        <span className="font-body text-white/55 text-sm">{name}</span>
                        <span className="font-heading font-semibold text-red-300 text-sm">− {fmtC(val)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2.5 border-t border-white/8 mt-1">
                      <span className="font-heading font-semibold text-white/60 text-sm">Total Standard</span>
                      <span className="font-heading font-bold text-red-300 text-sm">− {fmtC(calc.stdPeriod)}</span>
                    </div>
                  </div>
                </div>

                {/* Custom deductions */}
                <div className="glass rounded-2xl p-5 border border-white/8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-heading text-white/30 text-xs uppercase tracking-wider">Custom Deductions</p>
                    <button onClick={openAdd}
                      className="flex items-center gap-1 text-xs font-heading font-semibold text-orange-300 hover:text-orange-200 transition-colors">
                      <Plus size={12} /> Add
                    </button>
                  </div>

                  {customBreakdown.length === 0 && !showForm && (
                    <p className="font-body text-white/20 text-sm text-center py-3">
                      Add items like pension, LTD, union dues, AD&amp;D, WCB top-ups...
                    </p>
                  )}

                  {customBreakdown.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {customBreakdown.map(d => (
                        <div key={d.id} className="flex items-center gap-2">
                          <div className="flex-1 flex justify-between">
                            <span className="font-body text-white/55 text-sm">
                              {d.name}
                              <span className="text-white/25 ml-1 text-xs">
                                ({d.type === 'percent' ? `${d.value}%` : fmtC(d.value)})
                              </span>
                            </span>
                            <span className="font-heading font-semibold text-red-300 text-sm">− {fmtC(d.amount)}</span>
                          </div>
                          <button onClick={() => openEdit(d)} className="p-1 text-white/20 hover:text-white/60 transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteDeduction(d.id)} className="p-1 text-white/20 hover:text-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2.5 border-t border-white/8 mt-1">
                        <span className="font-heading font-semibold text-white/60 text-sm">Total Custom</span>
                        <span className="font-heading font-bold text-red-300 text-sm">− {fmtC(calc.customTotal)}</span>
                      </div>
                    </div>
                  )}

                  {/* Inline add/edit form */}
                  {showForm && (
                    <div className="mt-3 pt-4 border-t border-white/10 space-y-3">
                      <p className="font-heading font-semibold text-white/60 text-sm">{editId ? 'Edit' : 'New'} Deduction</p>
                      <input type="text" placeholder="Name (e.g. PENS, LTD, Union Dues)"
                        value={formName} onChange={e => setFormName(e.target.value)}
                        className="input-field w-full text-sm" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex gap-1">
                          {[['amount', '$ Fixed'], ['percent', '% Gross']].map(([v, l]) => (
                            <button key={v} onClick={() => setFormType(v)}
                              className={`flex-1 py-2 rounded-lg text-xs font-heading font-semibold border transition-all ${
                                formType === v
                                  ? 'bg-orange-500/20 text-orange-300 border-orange-400/30'
                                  : 'bg-white/5 text-white/30 border-white/8'
                              }`}>{l}</button>
                          ))}
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs font-semibold">
                            {formType === 'percent' ? '%' : '$'}
                          </span>
                          <input type="number" min="0" step="0.01" placeholder="0.00"
                            value={formValue} onChange={e => setFormValue(e.target.value)}
                            className="input-field pl-7 w-full text-sm" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveDeduction}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-400/30 font-heading font-semibold text-sm hover:bg-orange-500/30 transition-colors">
                          <Check size={13} /> {editId ? 'Update' : 'Add'}
                        </button>
                        <button onClick={() => setShowForm(false)}
                          className="px-4 py-2 rounded-lg bg-white/5 text-white/35 border border-white/8 font-heading text-sm hover:bg-white/10 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Net take-home */}
                <div className="rounded-3xl p-6 border border-green-400/30 bg-green-500/8">
                  <p className="font-heading text-white/40 text-xs uppercase tracking-wider mb-3">Net Take-Home · {freqLabel}</p>
                  <p className="font-display text-5xl text-white leading-none">{fmtC(calc.netPeriod)}</p>
                  <p className="font-body text-white/30 text-sm mt-2">
                    after all deductions · {fmtC(calc.totalDeductions)} withheld this period
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/8 grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-body text-white/25 text-xs">Annual Gross</p>
                      <p className="font-heading font-bold text-white text-lg">{fmtC(calc.annualGross, 0)}</p>
                    </div>
                    <div>
                      <p className="font-body text-white/25 text-xs">Annual Net</p>
                      <p className="font-heading font-bold text-green-300 text-lg">{fmtC(calc.netAnnual, 0)}</p>
                    </div>
                  </div>
                </div>

                <button onClick={handleSave} disabled={saving}
                  className="btn-primary justify-center w-full gap-2 disabled:opacity-40">
                  <Save size={15} />
                  {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Configuration'}
                </button>
              </>
            ) : (
              <div className="glass rounded-2xl p-8 border border-white/8 text-center">
                <DollarSign size={28} className="text-white/20 mx-auto mb-3" />
                <p className="font-heading font-semibold text-white/40 text-sm">
                  Enter your hourly rate above to see your paycheck breakdown.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── PROJECTIONS ──────────────────────────────────────────────────────── */}
        {tab === 'projections' && (
          <div className="space-y-4">
            {calc ? (
              <>
                <div className="space-y-2.5">
                  <p className="font-heading text-white/30 text-xs uppercase tracking-wider">Income Projections</p>
                  {[
                    { label: `Per Period (${freqLabel})`, gross: calc.grossPeriod,    net: calc.netPeriod },
                    { label: 'Monthly (avg)',              gross: calc.annualGross/12, net: calc.netAnnual/12 },
                    { label: 'Annual (1 Year)',            gross: calc.annualGross,    net: calc.netAnnual },
                    { label: '3 Years',                   gross: calc.annualGross*3,  net: calc.netAnnual*3 },
                    { label: '5 Years',                   gross: calc.annualGross*5,  net: calc.netAnnual*5 },
                  ].map(({ label, gross, net }) => (
                    <div key={label} className="glass rounded-xl px-5 py-4 border border-white/8">
                      <p className="font-heading font-semibold text-white/40 text-xs mb-2">{label}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="font-body text-white/20 text-xs">Gross</p>
                          <p className="font-heading font-bold text-white text-base">{fmtC(gross, 0)}</p>
                        </div>
                        <div>
                          <p className="font-body text-white/20 text-xs">Net (after all deductions)</p>
                          <p className="font-heading font-bold text-green-300 text-base">{fmtC(net, 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Annual deduction breakdown */}
                <div className="glass rounded-2xl p-5 border border-white/8">
                  <p className="font-heading text-white/30 text-xs uppercase tracking-wider mb-3">
                    Annual Deduction Breakdown
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { name: 'CPP',                val: calc.annualCPP },
                      { name: 'EI',                 val: calc.annualEI  },
                      { name: 'Federal Income Tax', val: calc.annualFed },
                      { name: 'Alberta Tax',        val: calc.annualAB  },
                      ...customBreakdown.map(d => ({ name: d.name, val: d.amount * payFreq })),
                    ].map(({ name, val }) => (
                      <div key={name} className="flex justify-between">
                        <span className="font-body text-white/45 text-sm">{name}</span>
                        <span className="font-heading font-semibold text-red-300 text-sm">{fmtC(val, 0)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2.5 border-t border-white/8 mt-1">
                      <span className="font-heading font-semibold text-white/60 text-sm">Total Annual Deductions</span>
                      <span className="font-heading font-bold text-red-300 text-sm">{fmtC(calc.totalDeductions * payFreq, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-heading font-semibold text-white/60 text-sm">Effective Tax Rate</span>
                      <span className="font-heading font-bold text-white/60 text-sm">
                        {((calc.totalDeductions * payFreq / calc.annualGross) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* RRSP nudge */}
                <div className="glass rounded-2xl p-5 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={15} className="text-yellow-400" />
                    <p className="font-heading font-semibold text-yellow-300 text-sm">2026 RRSP Contribution Room</p>
                  </div>
                  <p className="font-body text-white/45 text-sm leading-relaxed">
                    18% of last year's earned income (max $32,490). At your rate, estimate:{' '}
                    <span className="text-yellow-300 font-semibold">
                      {fmtC(Math.min(calc.annualGross * 0.18, 32490), 0)}
                    </span>.
                    RRSP contributions reduce your taxable income dollar-for-dollar.
                  </p>
                </div>

                <p className="font-body text-white/20 text-xs text-center leading-relaxed px-2">
                  Estimates use 2026 Canada federal and Alberta provincial tax rates. Consult an accountant for your return. Assumes same pay every period.
                </p>
              </>
            ) : (
              <div className="glass rounded-2xl p-8 border border-white/8 text-center">
                <TrendingUp size={28} className="text-white/20 mx-auto mb-3" />
                <p className="font-heading font-semibold text-white/40 text-sm">
                  Set up your pay in the Paycheck tab first.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── SAVINGS ──────────────────────────────────────────────────────────── */}
        {tab === 'savings' && (
          <div className="space-y-4">
            <div className="glass rounded-3xl p-6 border border-white/8 space-y-5">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-green-400" />
                <p className="font-heading font-semibold text-white text-sm">Savings Goal</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">Goal ($)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 font-semibold text-sm">$</span>
                    <input type="number" min="0" placeholder="50000"
                      value={savingsGoal}
                      onChange={e => { setSavingsGoal(e.target.value); setSaved(false) }}
                      className="input-field pl-7 w-full" />
                  </div>
                </div>
                <div>
                  <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">Saved So Far ($)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 font-semibold text-sm">$</span>
                    <input type="number" min="0" placeholder="8500"
                      value={savingsCurrent}
                      onChange={e => { setSavingsCurrent(e.target.value); setSaved(false) }}
                      className="input-field pl-7 w-full" />
                  </div>
                </div>
              </div>

              {goalPct !== null && (
                <div>
                  <div className="flex justify-between text-xs font-heading text-white/35 mb-2">
                    <span>{fmtC(parseFloat(savingsCurrent), 0)} saved</span>
                    <span>{goalPct.toFixed(1)}% of {fmtC(parseFloat(savingsGoal), 0)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700"
                      style={{ width: `${Math.min(Math.max(goalPct, 2), 100)}%` }} />
                  </div>
                  {goalPct >= 100 ? (
                    <p className="font-heading font-semibold text-green-300 text-sm text-center mt-3">Goal reached!</p>
                  ) : (
                    <p className="font-body text-white/25 text-xs text-center mt-2">
                      {fmtC(parseFloat(savingsGoal) - parseFloat(savingsCurrent), 0)} remaining
                      {calc ? ` · ~${Math.ceil((parseFloat(savingsGoal) - parseFloat(savingsCurrent)) / (calc.netPeriod * 0.3))} pay periods at 30% save rate` : ''}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Savings rate calculator */}
            {calc && (
              <div className="glass rounded-2xl p-5 border border-white/8">
                <p className="font-heading text-white/30 text-xs uppercase tracking-wider mb-3">If You Saved...</p>
                {[
                  { pct: 20, label: '20% of net' },
                  { pct: 25, label: '25% of net' },
                  { pct: 30, label: '30% of net' },
                ].map(({ pct, label }) => (
                  <div key={pct} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                    <span className="font-body text-white/50 text-sm">{label} per period</span>
                    <div className="text-right">
                      <p className="font-heading font-semibold text-green-300 text-sm">{fmtC(calc.netPeriod * pct / 100, 0)}</p>
                      <p className="font-body text-white/25 text-xs">{fmtC(calc.netAnnual * pct / 100, 0)} / year</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleSave} disabled={saving}
              className="btn-primary justify-center w-full gap-2 disabled:opacity-40">
              <Save size={15} />
              {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Goal'}
            </button>
          </div>
        )}

        <div className="h-4" />
      </main>
    </div>
  )
}
