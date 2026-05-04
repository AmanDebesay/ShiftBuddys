import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  ArrowLeft, DollarSign, TrendingUp, Target, Save,
  Plus, Pencil, Trash2, X, Check, FileText,
  FileSpreadsheet, BarChart3, Edit3, RotateCcw,
  BookOpen, CalendarDays, Briefcase,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

// ── 2026 Canada / Alberta tax constants ──────────────────────
const CPP_RATE            = 0.0595
const CPP_BASIC_EXEMPTION = 3500
const CPP_MAX_ANNUAL      = 3867.50
const EI_RATE             = 0.0166
const EI_MAX_ANNUAL       = 1049.12

function calcFederalTax(income) {
  const tiers = [
    [57375, 0.15], [57375, 0.205], [43769, 0.26],
    [61481, 0.29], [Infinity, 0.33],
  ]
  let tax = 0, rem = income
  for (const [cap, rate] of tiers) {
    const chunk = Math.min(rem, cap)
    tax += chunk * rate
    rem -= chunk
    if (rem <= 0) break
  }
  return Math.max(tax - 16129 * 0.15, 0)
}

function calcAlbertaTax(income) {
  const tiers = [
    [148269, 0.10], [29653, 0.12], [59308, 0.13],
    [118615, 0.14], [Infinity, 0.15],
  ]
  let tax = 0, rem = income
  for (const [cap, rate] of tiers) {
    const chunk = Math.min(rem, cap)
    tax += chunk * rate
    rem -= chunk
    if (rem <= 0) break
  }
  return Math.max(tax - 21003 * 0.10, 0)
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
function fmtDate(d) {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
function todayStr() { return new Date().toISOString().slice(0, 10) }
function genId() { return Math.random().toString(36).slice(2, 10) }

// ── Income Trend Chart (pure SVG) ────────────────────────────
function IncomeChart({ records }) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-6">
        <BarChart3 size={22} className="text-white/15 mx-auto mb-2" />
        <p className="font-body text-white/20 text-xs">Save paychecks to see your income trend</p>
      </div>
    )
  }

  const monthly = {}
  records.forEach(r => {
    const m = r.pay_date.slice(0, 7)
    if (!monthly[m]) monthly[m] = { gross: 0, net: 0 }
    monthly[m].gross += Number(r.gross_period)
    monthly[m].net   += Number(r.net_period)
  })
  const months  = Object.keys(monthly).sort().slice(-12)
  const maxVal  = Math.max(...months.map(m => monthly[m].gross), 1)
  const H       = 100
  const W       = 300
  const BOTTOM  = 18
  const TOP     = 6
  const innerH  = H - BOTTOM - TOP
  const slotW   = (W - 24) / Math.max(months.length, 1)
  const barW    = Math.min(11, Math.floor(slotW / 2.6))

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
        <line x1="12" y1={TOP + innerH} x2={W - 12} y2={TOP + innerH}
          stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        {months.map((m, i) => {
          const d  = monthly[m]
          const cx = 12 + i * slotW + slotW / 2
          const gH = Math.max((d.gross / maxVal) * innerH, 2)
          const nH = Math.max((d.net   / maxVal) * innerH, 2)
          const lbl = new Date(m + '-15').toLocaleDateString('en', { month: 'short' })
          return (
            <g key={m}>
              <rect x={cx - barW - 1} y={TOP + innerH - gH} width={barW} height={gH}
                fill="rgba(232,119,34,0.55)" rx="1.5" />
              <rect x={cx + 1} y={TOP + innerH - nH} width={barW} height={nH}
                fill="rgba(74,222,128,0.55)" rx="1.5" />
              <text x={cx} y={H - 2} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)">
                {lbl}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex items-center gap-4 justify-end mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-orange-400/55" />
          <span className="font-body text-white/30 text-xs">Gross</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-green-400/55" />
          <span className="font-body text-white/30 text-xs">Net</span>
        </div>
      </div>
    </div>
  )
}

// ── Export — PDF ─────────────────────────────────────────────
async function doExportPDF(records, employeeName) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const docW = doc.internal.pageSize.getWidth()

  const addPage = () => {
    doc.setFillColor(4, 15, 26)
    doc.rect(0, 0, docW, 297, 'F')
  }
  addPage()

  // Header bar
  doc.setFillColor(9, 30, 52)
  doc.rect(0, 0, docW, 32, 'F')
  doc.setTextColor(240, 133, 26)
  doc.setFontSize(17)
  doc.setFont('helvetica', 'bold')
  doc.text('ShiftBuddys', 14, 13)
  doc.setFontSize(9)
  doc.setTextColor(170, 190, 215)
  doc.text('Paycheck Records', 14, 21)
  if (employeeName) {
    doc.setFontSize(8)
    doc.setTextColor(110, 135, 170)
    doc.text(`Employee: ${employeeName}`, 14, 28)
  }
  doc.setFontSize(7.5)
  doc.setTextColor(80, 100, 130)
  doc.text(`Generated ${new Date().toLocaleDateString('en-CA')}`, docW - 14, 28, { align: 'right' })

  let y = 40

  for (let idx = 0; idx < records.length; idx++) {
    const r = records[idx]
    if (y > 245) {
      doc.addPage()
      addPage()
      y = 20
    }

    // Period header
    doc.setFillColor(20, 52, 88)
    doc.roundedRect(14, y, docW - 28, 10, 1.5, 1.5, 'F')
    doc.setTextColor(240, 133, 26)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(`Pay Date: ${fmtDate(r.pay_date)}`, 18, y + 6.8)
    if (r.period_start && r.period_end) {
      doc.setTextColor(160, 185, 215)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Period: ${fmtDate(r.period_start)} – ${fmtDate(r.period_end)}`,
        docW - 18, y + 6.8, { align: 'right' },
      )
    }
    y += 14

    const rows = [
      [`Regular (${r.regular_hours}h × $${Number(r.hourly_rate).toFixed(2)})`, '', fmtC(r.gross_regular)],
    ]
    if (Number(r.ot_hours) > 0) {
      rows.push([`Overtime (${r.ot_hours}h × $${Number(r.hourly_rate).toFixed(2)} × ${r.ot_multiplier}x)`, '', fmtC(r.gross_ot)])
    }
    rows.push([{ content: 'GROSS PAY', styles: { fontStyle: 'bold', textColor: [210, 225, 245] } }, '',
      { content: fmtC(r.gross_period), styles: { fontStyle: 'bold', textColor: [210, 225, 245] } }])
    rows.push([`CPP (${(CPP_RATE * 100).toFixed(2)}%)`, '', `(${fmtC(r.cpp_period)})`])
    rows.push(['EI (1.66%)', '', `(${fmtC(r.ei_period)})`])
    rows.push(['Federal Income Tax', '', `(${fmtC(r.fed_period)})`])
    rows.push(['Alberta Provincial Tax', '', `(${fmtC(r.ab_period)})`]);

    (Array.isArray(r.custom_deductions) ? r.custom_deductions : []).forEach(d => {
      rows.push([d.name, d.type === 'percent' ? `${d.value}%` : '', `(${fmtC(d.amount)})`])
    })

    rows.push([
      { content: 'TOTAL DEDUCTIONS', styles: { fontStyle: 'bold', textColor: [255, 110, 110] } }, '',
      { content: `(${fmtC(r.total_deductions)})`, styles: { fontStyle: 'bold', textColor: [255, 110, 110] } },
    ])
    rows.push([
      { content: 'NET PAY', styles: { fontStyle: 'bold', textColor: [74, 222, 128], fontSize: 10 } }, '',
      { content: fmtC(r.net_period), styles: { fontStyle: 'bold', textColor: [74, 222, 128], fontSize: 10 } },
    ])
    if (r.notes) {
      rows.push([{ content: `Notes: ${r.notes}`, colSpan: 3, styles: { textColor: [110, 130, 165], fontStyle: 'italic' } }, '', ''])
    }

    autoTable(doc, {
      startY: y,
      head: [['Description', 'Rate / Detail', 'Amount (CAD)']],
      body: rows,
      theme: 'plain',
      styles: { textColor: [155, 175, 205], fontSize: 8, cellPadding: { top: 2.2, right: 3, bottom: 2.2, left: 3 }, fillColor: [4, 15, 26] },
      headStyles: { fillColor: [9, 30, 52], textColor: [240, 133, 26], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [7, 22, 40] },
      columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 42 }, 2: { cellWidth: 50, halign: 'right' } },
      margin: { left: 14, right: 14 },
    })

    y = doc.lastAutoTable.finalY + 7
  }

  doc.save(`shiftbuddys-paychecks-${todayStr()}.pdf`)
}

// ── Export — Excel ───────────────────────────────────────────
async function doExportExcel(records, employeeName) {
  const XLSX = await import('xlsx')

  const detailRows = records.map(r => {
    const customStr = (Array.isArray(r.custom_deductions) ? r.custom_deductions : [])
      .map(d => `${d.name}: ${fmtC(d.amount)}`).join('; ')
    return {
      'Pay Date':              r.pay_date,
      'Period Start':          r.period_start || '',
      'Period End':            r.period_end   || '',
      'Frequency':             FREQ_OPTIONS.find(f => f.value === Number(r.pay_frequency))?.label || '',
      'Hourly Rate':           Number(r.hourly_rate),
      'Regular Hours':         Number(r.regular_hours),
      'OT Hours':              Number(r.ot_hours),
      'OT Multiplier':         Number(r.ot_multiplier),
      'Gross Regular ($)':     Number(r.gross_regular),
      'Gross OT ($)':          Number(r.gross_ot),
      'Gross Total ($)':       Number(r.gross_period),
      'CPP ($)':               Number(r.cpp_period),
      'EI ($)':                Number(r.ei_period),
      'Federal Tax ($)':       Number(r.fed_period),
      'Alberta Tax ($)':       Number(r.ab_period),
      'Custom Deductions ($)': Number(r.custom_total),
      'Custom Details':        customStr,
      'Total Deductions ($)':  Number(r.total_deductions),
      'Net Pay ($)':           Number(r.net_period),
      'Annual Gross Est. ($)': Number(r.annual_gross),
      'Annual Net Est. ($)':   Number(r.annual_net),
      'Notes':                 r.notes || '',
    }
  })

  const ws1 = XLSX.utils.json_to_sheet(detailRows)
  ws1['!cols'] = Array(22).fill({ wch: 20 })

  // Monthly summary sheet
  const monthly = {}
  records.forEach(r => {
    const m = r.pay_date.slice(0, 7)
    if (!monthly[m]) monthly[m] = { gross: 0, net: 0, cpp: 0, ei: 0, fed: 0, ab: 0, custom: 0, count: 0 }
    monthly[m].gross  += Number(r.gross_period)
    monthly[m].net    += Number(r.net_period)
    monthly[m].cpp    += Number(r.cpp_period)
    monthly[m].ei     += Number(r.ei_period)
    monthly[m].fed    += Number(r.fed_period)
    monthly[m].ab     += Number(r.ab_period)
    monthly[m].custom += Number(r.custom_total)
    monthly[m].count  += 1
  })

  const summaryRows = Object.keys(monthly).sort().map(m => ({
    'Month':                   m,
    'Paychecks':               monthly[m].count,
    'Total Gross ($)':         monthly[m].gross,
    'Total Net ($)':           monthly[m].net,
    'Total CPP ($)':           monthly[m].cpp,
    'Total EI ($)':            monthly[m].ei,
    'Total Federal Tax ($)':   monthly[m].fed,
    'Total Alberta Tax ($)':   monthly[m].ab,
    'Total Custom Ded. ($)':   monthly[m].custom,
    'Total Deductions ($)':    monthly[m].cpp + monthly[m].ei + monthly[m].fed + monthly[m].ab + monthly[m].custom,
  }))

  const ws2 = XLSX.utils.json_to_sheet(summaryRows)
  ws2['!cols'] = Array(10).fill({ wch: 22 })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws1, 'Paychecks')
  XLSX.utils.book_append_sheet(wb, ws2, 'Monthly Summary')

  const safeName = (employeeName || 'employee').replace(/\s+/g, '_').toLowerCase()
  XLSX.writeFile(wb, `shiftbuddys_paychecks_${safeName}_${todayStr()}.xlsx`)
}

// ── Main component ───────────────────────────────────────────
export default function MoneyManager() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState('paycheck')

  // Pay setup
  const [hourlyRate,   setHourlyRate]   = useState('')
  const [regularHours, setRegularHours] = useState('80')
  const [otHours,      setOtHours]      = useState('0')
  const [otMultiplier, setOtMultiplier] = useState('1.5')
  const [payFreq,      setPayFreq]      = useState(26)

  // Standard deductions override
  const [stdMode,   setStdMode]   = useState('auto') // 'auto' | 'actual'
  const [stdActual, setStdActual] = useState({ cpp: '', ei: '', fed: '', ab: '' })
  const [editingStd, setEditingStd] = useState(false)

  // Savings
  const [savingsGoal,    setSavingsGoal]    = useState('')
  const [savingsCurrent, setSavingsCurrent] = useState('')

  // Custom deductions
  const [customDeductions, setCustomDeductions] = useState([])
  const [showForm,   setShowForm]   = useState(false)
  const [editId,     setEditId]     = useState(null)
  const [formName,   setFormName]   = useState('')
  const [formType,   setFormType]   = useState('amount')
  const [formValue,  setFormValue]  = useState('')

  // Paycheck records
  const [paycheckRecords, setPaycheckRecords] = useState([])
  const [recordFilter,    setRecordFilter]    = useState('all')
  const [showSaveForm,    setShowSaveForm]    = useState(false)
  const [savePayDate,     setSavePayDate]     = useState(todayStr)
  const [savePeriodStart, setSavePeriodStart] = useState('')
  const [savePeriodEnd,   setSavePeriodEnd]   = useState('')
  const [saveNotes,       setSaveNotes]       = useState('')
  const [savingRecord,    setSavingRecord]    = useState(false)
  const [exporting,       setExporting]       = useState(false)

  // Config save
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
        if (cfg.std_mode === 'actual' && cfg.std_actual) {
          setStdMode('actual')
          setStdActual(cfg.std_actual)
        }
      })

    // Load saved paycheck records
    supabase.from('paycheck_records')
      .select('*')
      .eq('user_id', user.id)
      .order('pay_date', { ascending: false })
      .then(({ data }) => { if (data) setPaycheckRecords(data) })
  }, [user])

  // ── Calculations ──────────────────────────────────────────
  const calc = useMemo(() => {
    const rate = parseFloat(hourlyRate)
    const regH = parseFloat(regularHours) || 0
    const otH  = parseFloat(otHours) || 0
    const otM  = parseFloat(otMultiplier) || 1.5
    if (!rate || rate <= 0) return null

    const grossRegular = rate * regH
    const grossOT      = rate * otH * otM
    const grossPeriod  = grossRegular + grossOT
    const annualGross  = grossPeriod * payFreq

    const autoCPP  = Math.min(Math.max(annualGross - CPP_BASIC_EXEMPTION, 0) * CPP_RATE, CPP_MAX_ANNUAL)
    const autoEI   = Math.min(annualGross * EI_RATE, EI_MAX_ANNUAL)
    const autoFed  = calcFederalTax(annualGross)
    const autoAB   = calcAlbertaTax(annualGross)

    const useActual = stdMode === 'actual'
    const cppPeriod = useActual && stdActual.cpp !== '' ? (parseFloat(stdActual.cpp) || 0) : (autoCPP / payFreq)
    const eiPeriod  = useActual && stdActual.ei  !== '' ? (parseFloat(stdActual.ei)  || 0) : (autoEI  / payFreq)
    const fedPeriod = useActual && stdActual.fed !== '' ? (parseFloat(stdActual.fed) || 0) : (autoFed / payFreq)
    const abPeriod  = useActual && stdActual.ab  !== '' ? (parseFloat(stdActual.ab)  || 0) : (autoAB  / payFreq)
    const stdPeriod = cppPeriod + eiPeriod + fedPeriod + abPeriod

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
      annualCPP: cppPeriod * payFreq, annualEI: eiPeriod * payFreq,
      annualFed: fedPeriod * payFreq, annualAB: abPeriod * payFreq,
      // auto values kept for placeholder hints when editing
      _autoCpp: autoCPP / payFreq, _autoEi: autoEI / payFreq,
      _autoFed: autoFed / payFreq, _autoAb: autoAB  / payFreq,
      customTotal, totalDeductions, netPeriod, netAnnual,
    }
  }, [hourlyRate, regularHours, otHours, otMultiplier, payFreq, customDeductions, stdMode, stdActual])

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

  // Filter / derived record data
  const { filteredRecords, availableFilters } = useMemo(() => {
    const years  = [...new Set(paycheckRecords.map(r => r.pay_date.slice(0, 4)))].sort().reverse()
    const months = [...new Set(paycheckRecords.map(r => r.pay_date.slice(0, 7)))].sort().reverse()
    const filters = [
      { value: 'all', label: 'All Records' },
      ...years.map(y => ({ value: y, label: y })),
      ...months.map(m => ({
        value: m,
        label: new Date(m + '-15').toLocaleDateString('en-CA', { month: 'long', year: 'numeric' }),
      })),
    ]
    const filtered = recordFilter === 'all'
      ? paycheckRecords
      : paycheckRecords.filter(r => r.pay_date.startsWith(recordFilter))
    return { filteredRecords: filtered, availableFilters: filters }
  }, [paycheckRecords, recordFilter])

  // ── Persist config ────────────────────────────────────────
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
        std_mode:          stdMode,
        std_actual:        stdMode === 'actual' ? stdActual : null,
      },
    }).eq('id', user.id)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  // ── Save paycheck record ──────────────────────────────────
  const handleSaveRecord = async () => {
    if (!user || !calc || !savePayDate) return
    setSavingRecord(true)
    const { data, error } = await supabase.from('paycheck_records').insert({
      user_id:          user.id,
      pay_date:         savePayDate,
      period_start:     savePeriodStart || null,
      period_end:       savePeriodEnd   || null,
      pay_frequency:    payFreq,
      hourly_rate:      parseFloat(hourlyRate),
      regular_hours:    parseFloat(regularHours),
      ot_hours:         parseFloat(otHours),
      ot_multiplier:    parseFloat(otMultiplier),
      gross_regular:    calc.grossRegular,
      gross_ot:         calc.grossOT,
      gross_period:     calc.grossPeriod,
      cpp_period:       calc.cppPeriod,
      ei_period:        calc.eiPeriod,
      fed_period:       calc.fedPeriod,
      ab_period:        calc.abPeriod,
      std_period:       calc.stdPeriod,
      custom_deductions: customBreakdown,
      custom_total:     calc.customTotal,
      total_deductions: calc.totalDeductions,
      net_period:       calc.netPeriod,
      annual_gross:     calc.annualGross,
      annual_net:       calc.netAnnual,
      notes:            saveNotes || null,
    }).select().single()

    if (!error && data) {
      setPaycheckRecords(prev => [data, ...prev])
      setShowSaveForm(false)
      setSaveNotes('')
      setSavePeriodStart('')
      setSavePeriodEnd('')
      setSavePayDate(todayStr())
    }
    setSavingRecord(false)
  }

  const handleDeleteRecord = async (id) => {
    await supabase.from('paycheck_records').delete().eq('id', id)
    setPaycheckRecords(prev => prev.filter(r => r.id !== id))
  }

  // ── Bulk export ───────────────────────────────────────────
  const handleExport = async (format) => {
    if (!filteredRecords.length) return
    setExporting(true)
    const name = profile?.name || user?.email?.split('@')[0] || 'employee'
    try {
      if (format === 'pdf')   await doExportPDF(filteredRecords, name)
      if (format === 'excel') await doExportExcel(filteredRecords, name)
    } finally {
      setExporting(false)
    }
  }

  const handleExportSingle = async (record, format) => {
    setExporting(true)
    const name = profile?.name || user?.email?.split('@')[0] || 'employee'
    try {
      if (format === 'pdf')   await doExportPDF([record], name)
      if (format === 'excel') await doExportExcel([record], name)
    } finally {
      setExporting(false)
    }
  }

  // ── Standard deductions editing ───────────────────────────
  const openStdEdit = () => {
    if (calc) {
      setStdActual({
        cpp: stdMode === 'actual' && stdActual.cpp !== '' ? stdActual.cpp : calc._autoCpp.toFixed(2),
        ei:  stdMode === 'actual' && stdActual.ei  !== '' ? stdActual.ei  : calc._autoEi.toFixed(2),
        fed: stdMode === 'actual' && stdActual.fed !== '' ? stdActual.fed : calc._autoFed.toFixed(2),
        ab:  stdMode === 'actual' && stdActual.ab  !== '' ? stdActual.ab  : calc._autoAb.toFixed(2),
      })
    }
    setStdMode('actual')
    setEditingStd(true)
    setSaved(false)
  }
  const applyStdEdit = () => { setEditingStd(false); setSaved(false) }
  const resetStdToAuto = () => {
    setStdMode('auto')
    setStdActual({ cpp: '', ei: '', fed: '', ab: '' })
    setEditingStd(false)
    setSaved(false)
  }

  // ── Deduction CRUD ────────────────────────────────────────
  const openAdd  = () => { setEditId(null); setFormName(''); setFormType('amount'); setFormValue(''); setShowForm(true) }
  const openEdit = (d) => { setEditId(d.id); setFormName(d.name); setFormType(d.type); setFormValue(String(d.value)); setShowForm(true) }
  const saveDeduction = () => {
    if (!formName.trim() || !formValue) return
    const item = { id: editId || genId(), name: formName.trim(), type: formType, value: parseFloat(formValue) }
    setCustomDeductions(prev => editId ? prev.map(d => d.id === editId ? item : d) : [...prev, item])
    setShowForm(false); setSaved(false)
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
          <p className="font-body text-white/35 text-sm mt-0.5">Paycheck calculator · Records · Savings goals</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/8 overflow-x-auto">
          {[['paycheck', 'Paycheck'], ['records', 'Records'], ['projections', 'Projections'], ['savings', 'Savings']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-lg font-heading font-semibold text-xs whitespace-nowrap px-2 transition-all ${
                tab === key
                  ? 'bg-orange-500/25 text-orange-300 border border-orange-400/30'
                  : 'text-white/35 hover:text-white/60'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── PAYCHECK ──────────────────────────────────────── */}
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
                    value={hourlyRate} onChange={e => { setHourlyRate(e.target.value); setSaved(false) }}
                    className="input-field pl-7 w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">Regular Hours</label>
                  <input type="number" min="0" step="0.5" placeholder="80"
                    value={regularHours} onChange={e => { setRegularHours(e.target.value); setSaved(false) }}
                    className="input-field w-full" />
                </div>
                <div>
                  <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">OT Hours</label>
                  <input type="number" min="0" step="0.5" placeholder="0"
                    value={otHours} onChange={e => { setOtHours(e.target.value); setSaved(false) }}
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
                      <span className="font-body text-white/55 text-sm">Regular ({regularHours}h × {fmtC(parseFloat(hourlyRate))})</span>
                      <span className="font-heading font-semibold text-white text-sm">{fmtC(calc.grossRegular)}</span>
                    </div>
                    {parseFloat(otHours) > 0 && (
                      <div className="flex justify-between">
                        <span className="font-body text-white/55 text-sm">Overtime ({otHours}h × {fmtC(parseFloat(hourlyRate))} × {otMultiplier}x)</span>
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
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-heading text-white/30 text-xs uppercase tracking-wider">
                      Standard Deductions
                      {stdMode === 'actual' && !editingStd && (
                        <span className="ml-2 text-yellow-400/70 normal-case tracking-normal">· Using actual amounts</span>
                      )}
                      {stdMode === 'auto' && (
                        <span className="ml-2 text-white/20 normal-case tracking-normal">· Auto-calculated</span>
                      )}
                    </p>
                    <div className="flex items-center gap-3">
                      {stdMode === 'actual' && !editingStd && (
                        <button onClick={resetStdToAuto}
                          className="flex items-center gap-1 text-white/30 hover:text-white/60 text-xs font-heading transition-colors">
                          <RotateCcw size={10} /> Reset to auto
                        </button>
                      )}
                      {!editingStd && (
                        <button onClick={openStdEdit}
                          className="flex items-center gap-1 text-orange-300/60 hover:text-orange-300 text-xs font-heading transition-colors">
                          <Edit3 size={11} /> {stdMode === 'actual' ? 'Edit' : 'Enter actual'}
                        </button>
                      )}
                    </div>
                  </div>

                  {editingStd ? (
                    <div className="space-y-3">
                      <p className="font-body text-white/30 text-xs">Enter your actual deductions from your pay stub.</p>
                      {[
                        { key: 'cpp', label: `CPP (${(CPP_RATE * 100).toFixed(2)}%)`, auto: calc._autoCpp },
                        { key: 'ei',  label: `EI (${(EI_RATE * 100).toFixed(2)}%)`,  auto: calc._autoEi  },
                        { key: 'fed', label: 'Federal Income Tax',                    auto: calc._autoFed },
                        { key: 'ab',  label: 'Alberta Provincial Tax',                auto: calc._autoAb  },
                      ].map(({ key, label, auto }) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="flex-1 font-body text-white/55 text-sm">{label}</span>
                          <div className="relative w-32">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                            <input type="number" min="0" step="0.01"
                              placeholder={auto.toFixed(2)}
                              value={stdActual[key]}
                              onChange={e => setStdActual(p => ({ ...p, [key]: e.target.value }))}
                              className="input-field pl-6 w-full text-xs py-2 text-right" />
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <button onClick={applyStdEdit}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-400/30 font-heading font-semibold text-sm hover:bg-orange-500/30 transition-colors">
                          <Check size={13} /> Apply
                        </button>
                        <button onClick={() => setEditingStd(false)}
                          className="px-4 py-2 rounded-lg bg-white/5 text-white/35 border border-white/8 font-heading text-sm hover:bg-white/10 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[
                        { name: `CPP (${(CPP_RATE * 100).toFixed(2)}%)`, val: calc.cppPeriod },
                        { name: `EI (${(EI_RATE * 100).toFixed(2)}%)`,  val: calc.eiPeriod  },
                        { name: 'Federal Income Tax',                     val: calc.fedPeriod },
                        { name: 'Alberta Provincial Tax',                 val: calc.abPeriod  },
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
                  )}
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
                              <span className="text-white/25 ml-1 text-xs">({d.type === 'percent' ? `${d.value}%` : fmtC(d.value)})</span>
                            </span>
                            <span className="font-heading font-semibold text-red-300 text-sm">− {fmtC(d.amount)}</span>
                          </div>
                          <button onClick={() => openEdit(d)} className="p-1 text-white/20 hover:text-white/60 transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => deleteDeduction(d.id)} className="p-1 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2.5 border-t border-white/8 mt-1">
                        <span className="font-heading font-semibold text-white/60 text-sm">Total Custom</span>
                        <span className="font-heading font-bold text-red-300 text-sm">− {fmtC(calc.customTotal)}</span>
                      </div>
                    </div>
                  )}

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
                                formType === v ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' : 'bg-white/5 text-white/30 border-white/8'
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

                {/* Save paycheck form */}
                <div className="glass rounded-2xl border border-white/8 overflow-hidden">
                  <button onClick={() => setShowSaveForm(p => !p)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} className="text-orange-300/70" />
                      <span className="font-heading font-semibold text-white/70 text-sm">Save This Paycheck</span>
                    </div>
                    <span className={`text-white/30 transition-transform ${showSaveForm ? 'rotate-180' : ''}`}>▾</span>
                  </button>

                  {showSaveForm && (
                    <div className="px-5 pb-5 space-y-3 border-t border-white/8 pt-4">
                      <div>
                        <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">Pay Date *</label>
                        <input type="date" value={savePayDate} onChange={e => setSavePayDate(e.target.value)}
                          className="input-field w-full text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">Period Start</label>
                          <input type="date" value={savePeriodStart} onChange={e => setSavePeriodStart(e.target.value)}
                            className="input-field w-full text-sm" />
                        </div>
                        <div>
                          <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">Period End</label>
                          <input type="date" value={savePeriodEnd} onChange={e => setSavePeriodEnd(e.target.value)}
                            className="input-field w-full text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">Notes (optional)</label>
                        <input type="text" placeholder="e.g. Includes holiday pay"
                          value={saveNotes} onChange={e => setSaveNotes(e.target.value)}
                          className="input-field w-full text-sm" />
                      </div>
                      <button onClick={handleSaveRecord} disabled={savingRecord || !savePayDate}
                        className="btn-primary justify-center w-full gap-2 disabled:opacity-40 text-sm py-3">
                        <Save size={14} />
                        {savingRecord ? 'Saving...' : 'Save Paycheck Record'}
                      </button>
                    </div>
                  )}
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

        {/* ── RECORDS ───────────────────────────────────────── */}
        {tab === 'records' && (
          <div className="space-y-4">
            {/* Income trend chart */}
            <div className="glass rounded-2xl p-5 border border-white/8">
              <p className="font-heading text-white/30 text-xs uppercase tracking-wider mb-3">Monthly Income Trend</p>
              <IncomeChart records={paycheckRecords} />
            </div>

            {/* Summary stats */}
            {paycheckRecords.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Records', value: paycheckRecords.length },
                  { label: 'Total Gross', value: fmtC(paycheckRecords.reduce((s, r) => s + Number(r.gross_period), 0), 0) },
                  { label: 'Total Net',   value: fmtC(paycheckRecords.reduce((s, r) => s + Number(r.net_period), 0), 0) },
                ].map(({ label, value }) => (
                  <div key={label} className="glass rounded-xl px-3 py-3 border border-white/8 text-center">
                    <p className="font-heading font-bold text-white text-sm">{value}</p>
                    <p className="font-body text-white/30 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filter + Export */}
            <div className="flex items-center gap-2">
              <select value={recordFilter} onChange={e => setRecordFilter(e.target.value)}
                className="input-field flex-1 text-sm">
                {availableFilters.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <button onClick={() => handleExport('pdf')} disabled={exporting || filteredRecords.length === 0}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/15 text-red-300 border border-red-400/20 text-xs font-heading font-semibold disabled:opacity-30 hover:bg-red-500/25 transition-colors whitespace-nowrap">
                <FileText size={13} /> PDF
              </button>
              <button onClick={() => handleExport('excel')} disabled={exporting || filteredRecords.length === 0}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-green-500/15 text-green-300 border border-green-400/20 text-xs font-heading font-semibold disabled:opacity-30 hover:bg-green-500/25 transition-colors whitespace-nowrap">
                <FileSpreadsheet size={13} /> Excel
              </button>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="glass rounded-2xl p-8 border border-white/8 text-center">
                <BookOpen size={24} className="text-white/15 mx-auto mb-2" />
                <p className="font-heading font-semibold text-white/30 text-sm">No saved paychecks</p>
                <p className="font-body text-white/20 text-xs mt-1">
                  Go to the Paycheck tab, calculate your pay, then save the record
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {filteredRecords.map(r => (
                    <div key={r.id} className="glass rounded-xl border border-white/8 overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-semibold text-white text-sm">{fmtDate(r.pay_date)}</p>
                          {r.period_start && r.period_end && (
                            <p className="font-body text-white/25 text-xs">{fmtDate(r.period_start)} – {fmtDate(r.period_end)}</p>
                          )}
                          {r.notes && <p className="font-body text-white/25 text-xs italic">{r.notes}</p>}
                        </div>
                        <div className="text-right mr-1">
                          <p className="font-heading font-semibold text-white text-sm">{fmtC(r.gross_period)}</p>
                          <p className="font-body text-green-300/70 text-xs">→ {fmtC(r.net_period)} net</p>
                        </div>
                        <button onClick={() => handleExportSingle(r, 'pdf')} disabled={exporting}
                          className="p-1.5 rounded-lg text-white/20 hover:text-red-300 hover:bg-red-400/10 transition-colors disabled:opacity-30"
                          title="Export as PDF">
                          <FileText size={14} />
                        </button>
                        <button onClick={() => handleExportSingle(r, 'excel')} disabled={exporting}
                          className="p-1.5 rounded-lg text-white/20 hover:text-green-300 hover:bg-green-400/10 transition-colors disabled:opacity-30"
                          title="Export as Excel">
                          <FileSpreadsheet size={14} />
                        </button>
                        <button onClick={() => handleDeleteRecord(r.id)}
                          className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {/* Deduction mini-bar */}
                      <div className="px-4 pb-3">
                        <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-white/5">
                          <div className="bg-green-400/60 rounded-l-full" style={{ width: `${(Number(r.net_period) / Number(r.gross_period)) * 100}%` }} />
                          <div className="bg-red-400/40 flex-1 rounded-r-full" />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="font-body text-white/20 text-xs">Net {((Number(r.net_period) / Number(r.gross_period)) * 100).toFixed(0)}%</span>
                          <span className="font-body text-white/20 text-xs">Deducted {fmtC(r.total_deductions)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredRecords.length > 1 && (
                  <div className="glass rounded-xl px-4 py-3 border border-white/8">
                    <p className="font-heading text-white/30 text-xs uppercase tracking-wider mb-2">
                      {recordFilter === 'all' ? 'All-time' : 'Period'} Totals
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="font-body text-white/25 text-xs">Total Gross</p>
                        <p className="font-heading font-bold text-white text-base">
                          {fmtC(filteredRecords.reduce((s, r) => s + Number(r.gross_period), 0), 0)}
                        </p>
                      </div>
                      <div>
                        <p className="font-body text-white/25 text-xs">Total Net</p>
                        <p className="font-heading font-bold text-green-300 text-base">
                          {fmtC(filteredRecords.reduce((s, r) => s + Number(r.net_period), 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── PROJECTIONS ───────────────────────────────────── */}
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

                <div className="glass rounded-2xl p-5 border border-white/8">
                  <p className="font-heading text-white/30 text-xs uppercase tracking-wider mb-3">Annual Deduction Breakdown</p>
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

                <div className="glass rounded-2xl p-5 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={15} className="text-yellow-400" />
                    <p className="font-heading font-semibold text-yellow-300 text-sm">2026 RRSP Contribution Room</p>
                  </div>
                  <p className="font-body text-white/45 text-sm leading-relaxed">
                    18% of last year&apos;s earned income (max $32,490). At your rate, estimate:{' '}
                    <span className="text-yellow-300 font-semibold">
                      {fmtC(Math.min(calc.annualGross * 0.18, 32490), 0)}
                    </span>.
                    RRSP contributions reduce your taxable income dollar-for-dollar.
                  </p>
                </div>

                <p className="font-body text-white/20 text-xs text-center leading-relaxed px-2">
                  Estimates use 2026 Canada federal and Alberta provincial tax rates. Consult an accountant for your return.
                </p>
              </>
            ) : (
              <div className="glass rounded-2xl p-8 border border-white/8 text-center">
                <TrendingUp size={28} className="text-white/20 mx-auto mb-3" />
                <p className="font-heading font-semibold text-white/40 text-sm">Set up your pay in the Paycheck tab first.</p>
              </div>
            )}
          </div>
        )}

        {/* ── SAVINGS ───────────────────────────────────────── */}
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
                      value={savingsGoal} onChange={e => { setSavingsGoal(e.target.value); setSaved(false) }}
                      className="input-field pl-7 w-full" />
                  </div>
                </div>
                <div>
                  <label className="font-heading text-white/35 text-xs uppercase tracking-wider block mb-1.5">Saved So Far ($)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 font-semibold text-sm">$</span>
                    <input type="number" min="0" placeholder="8500"
                      value={savingsCurrent} onChange={e => { setSavingsCurrent(e.target.value); setSaved(false) }}
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
