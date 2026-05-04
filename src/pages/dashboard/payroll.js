/**
 * Payroll Manager — accessible to users with role: manager | supervisor | payroll
 *
 * Required Supabase setup (run once in SQL editor):
 * ─────────────────────────────────────────────────
 * -- 1. Add role + company_code columns to profiles
 * ALTER TABLE profiles
 *   ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'employee',
 *   ADD COLUMN IF NOT EXISTS company_code TEXT;
 *
 * -- 2. Create paycheck_records table
 * CREATE TABLE IF NOT EXISTS paycheck_records (
 *   id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   pay_date         DATE NOT NULL,
 *   period_start     DATE,
 *   period_end       DATE,
 *   pay_frequency    INTEGER,
 *   hourly_rate      NUMERIC,
 *   regular_hours    NUMERIC,
 *   ot_hours         NUMERIC,
 *   ot_multiplier    NUMERIC,
 *   gross_regular    NUMERIC,
 *   gross_ot         NUMERIC,
 *   gross_period     NUMERIC,
 *   cpp_period       NUMERIC,
 *   ei_period        NUMERIC,
 *   fed_period       NUMERIC,
 *   ab_period        NUMERIC,
 *   std_period       NUMERIC,
 *   custom_deductions JSONB,
 *   custom_total     NUMERIC,
 *   total_deductions NUMERIC,
 *   net_period       NUMERIC,
 *   annual_gross     NUMERIC,
 *   annual_net       NUMERIC,
 *   notes            TEXT,
 *   created_at       TIMESTAMPTZ DEFAULT now()
 * );
 *
 * -- 3. RLS policies
 * ALTER TABLE paycheck_records ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "employee_own" ON paycheck_records
 *   FOR ALL USING (auth.uid() = user_id);
 * CREATE POLICY "manager_read_company" ON paycheck_records
 *   FOR SELECT USING (
 *     EXISTS (
 *       SELECT 1 FROM profiles mgr
 *       JOIN profiles emp ON mgr.company_code = emp.company_code
 *       WHERE mgr.id = auth.uid()
 *         AND mgr.role IN ('manager','supervisor','payroll')
 *         AND emp.id = paycheck_records.user_id
 *     )
 *   );
 */

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  ArrowLeft, Users, DollarSign, TrendingUp, FileText,
  FileSpreadsheet, Search, ChevronDown, ChevronRight,
  ShieldAlert, Building2, Download,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const MANAGER_ROLES = ['manager', 'supervisor', 'payroll']

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
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
function todayStr() { return new Date().toISOString().slice(0, 10) }

// ── Export all employees — Excel ─────────────────────────────
async function doExportAllExcel(records, employees) {
  const XLSX = await import('xlsx')
  const empMap = Object.fromEntries(employees.map(e => [e.id, e]))

  const detailRows = records.map(r => {
    const emp = empMap[r.user_id] || {}
    const customStr = (Array.isArray(r.custom_deductions) ? r.custom_deductions : [])
      .map(d => `${d.name}: ${fmtC(d.amount)}`).join('; ')
    return {
      'Employee':              emp.name || emp.email || r.user_id,
      'Email':                 emp.email || '',
      'Role':                  emp.role  || 'employee',
      'Pay Date':              r.pay_date,
      'Period Start':          r.period_start || '',
      'Period End':            r.period_end   || '',
      'Frequency':             FREQ_OPTIONS.find(f => f.value === Number(r.pay_frequency))?.label || '',
      'Hourly Rate':           Number(r.hourly_rate),
      'Regular Hours':         Number(r.regular_hours),
      'OT Hours':              Number(r.ot_hours),
      'Gross Total ($)':       Number(r.gross_period),
      'CPP ($)':               Number(r.cpp_period),
      'EI ($)':                Number(r.ei_period),
      'Federal Tax ($)':       Number(r.fed_period),
      'Alberta Tax ($)':       Number(r.ab_period),
      'Custom Deductions ($)': Number(r.custom_total),
      'Custom Details':        customStr,
      'Total Deductions ($)':  Number(r.total_deductions),
      'Net Pay ($)':           Number(r.net_period),
      'Notes':                 r.notes || '',
    }
  })

  const ws1 = XLSX.utils.json_to_sheet(detailRows)
  ws1['!cols'] = Array(20).fill({ wch: 20 })

  // Summary per employee
  const byEmp = {}
  records.forEach(r => {
    const emp = empMap[r.user_id] || {}
    const name = emp.name || emp.email || r.user_id
    if (!byEmp[name]) byEmp[name] = { gross: 0, net: 0, ded: 0, count: 0, lastDate: '' }
    byEmp[name].gross   += Number(r.gross_period)
    byEmp[name].net     += Number(r.net_period)
    byEmp[name].ded     += Number(r.total_deductions)
    byEmp[name].count   += 1
    if (r.pay_date > byEmp[name].lastDate) byEmp[name].lastDate = r.pay_date
  })

  const summaryRows = Object.entries(byEmp).map(([name, d]) => ({
    'Employee':              name,
    'Paychecks':             d.count,
    'Total Gross ($)':       d.gross,
    'Total Net ($)':         d.net,
    'Total Deductions ($)':  d.ded,
    'Last Pay Date':         d.lastDate,
    'Avg Gross / Period ($)': d.count ? d.gross / d.count : 0,
    'Avg Net / Period ($)':   d.count ? d.net   / d.count : 0,
  }))

  const ws2 = XLSX.utils.json_to_sheet(summaryRows)
  ws2['!cols'] = Array(8).fill({ wch: 24 })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws1, 'All Paychecks')
  XLSX.utils.book_append_sheet(wb, ws2, 'Employee Summary')
  XLSX.writeFile(wb, `shiftbuddys_payroll_${todayStr()}.xlsx`)
}

// ── Export one employee — PDF ─────────────────────────────────
async function doExportEmpPDF(records, employeeName) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const docW = doc.internal.pageSize.getWidth()

  const bgPage = () => { doc.setFillColor(4, 15, 26); doc.rect(0, 0, docW, 297, 'F') }
  bgPage()

  doc.setFillColor(9, 30, 52); doc.rect(0, 0, docW, 32, 'F')
  doc.setTextColor(240, 133, 26); doc.setFontSize(17); doc.setFont('helvetica', 'bold')
  doc.text('ShiftBuddys — Payroll', 14, 13)
  doc.setFontSize(9); doc.setTextColor(170, 190, 215)
  doc.text(`Employee: ${employeeName}`, 14, 22)
  doc.setFontSize(7.5); doc.setTextColor(80, 100, 130)
  doc.text(`Generated ${new Date().toLocaleDateString('en-CA')}`, docW - 14, 28, { align: 'right' })

  let y = 40

  for (const r of records) {
    if (y > 245) { doc.addPage(); bgPage(); y = 20 }

    doc.setFillColor(20, 52, 88); doc.roundedRect(14, y, docW - 28, 10, 1.5, 1.5, 'F')
    doc.setTextColor(240, 133, 26); doc.setFontSize(9); doc.setFont('helvetica', 'bold')
    doc.text(`Pay Date: ${fmtDate(r.pay_date)}`, 18, y + 6.8)
    y += 14

    const rows = [
      [`Regular (${r.regular_hours}h × $${Number(r.hourly_rate).toFixed(2)})`, '', fmtC(r.gross_regular)],
    ]
    if (Number(r.ot_hours) > 0) rows.push([`Overtime (${r.ot_hours}h × ${r.ot_multiplier}x)`, '', fmtC(r.gross_ot)])
    rows.push([{ content: 'GROSS PAY', styles: { fontStyle: 'bold', textColor: [210, 225, 245] } }, '', { content: fmtC(r.gross_period), styles: { fontStyle: 'bold', textColor: [210, 225, 245] } }])
    rows.push(['CPP', '', `(${fmtC(r.cpp_period)})`])
    rows.push(['EI', '', `(${fmtC(r.ei_period)})`])
    rows.push(['Federal Tax', '', `(${fmtC(r.fed_period)})`])
    rows.push(['Alberta Tax', '', `(${fmtC(r.ab_period)})`]);
    (Array.isArray(r.custom_deductions) ? r.custom_deductions : []).forEach(d => {
      rows.push([d.name, '', `(${fmtC(d.amount)})`])
    })
    rows.push([{ content: 'NET PAY', styles: { fontStyle: 'bold', textColor: [74, 222, 128] } }, '', { content: fmtC(r.net_period), styles: { fontStyle: 'bold', textColor: [74, 222, 128] } }])

    autoTable(doc, {
      startY: y, head: [['Description', '', 'Amount (CAD)']], body: rows,
      theme: 'plain',
      styles: { textColor: [155, 175, 205], fontSize: 8, cellPadding: 2, fillColor: [4, 15, 26] },
      headStyles: { fillColor: [9, 30, 52], textColor: [240, 133, 26], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [7, 22, 40] },
      columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 40 }, 2: { cellWidth: 50, halign: 'right' } },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 7
  }

  doc.save(`shiftbuddys_payroll_${employeeName.replace(/\s+/g, '_').toLowerCase()}_${todayStr()}.pdf`)
}

// ── Component ─────────────────────────────────────────────────
export default function PayrollManager() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile]       = useState(null)
  const [employees, setEmployees]   = useState([])
  const [records, setRecords]       = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [exporting, setExporting]   = useState(false)
  const [search, setSearch]         = useState('')
  const [filterMonth, setFilterMonth] = useState('all')
  const [expandedEmp, setExpandedEmp] = useState(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        if (!data) { router.replace('/onboarding'); return }
        setProfile(data)
        if (!MANAGER_ROLES.includes(data.role) || !data.company_code) {
          setLoadingData(false)
          return
        }
        loadCompanyData(data.company_code)
      })
  }, [user])

  const loadCompanyData = async (companyCode) => {
    setLoadingData(true)

    const { data: emps } = await supabase
      .from('profiles')
      .select('id, name, email, role, rotation_pattern, hourly_rate')
      .eq('company_code', companyCode)

    setEmployees(emps || [])

    if (emps && emps.length > 0) {
      const { data: recs } = await supabase
        .from('paycheck_records')
        .select('*')
        .in('user_id', emps.map(e => e.id))
        .order('pay_date', { ascending: false })
      setRecords(recs || [])
    }

    setLoadingData(false)
  }

  // Derived data
  const { empStats, availableMonths, filteredByMonth } = useMemo(() => {
    const months = [...new Set(records.map(r => r.pay_date.slice(0, 7)))].sort().reverse()
    const recs = filterMonth === 'all' ? records : records.filter(r => r.pay_date.startsWith(filterMonth))

    const stats = {}
    recs.forEach(r => {
      if (!stats[r.user_id]) stats[r.user_id] = { gross: 0, net: 0, ded: 0, count: 0, lastDate: '' }
      stats[r.user_id].gross   += Number(r.gross_period)
      stats[r.user_id].net     += Number(r.net_period)
      stats[r.user_id].ded     += Number(r.total_deductions)
      stats[r.user_id].count   += 1
      if (r.pay_date > stats[r.user_id].lastDate) stats[r.user_id].lastDate = r.pay_date
    })

    return { empStats: stats, availableMonths: months, filteredByMonth: recs }
  }, [records, filterMonth])

  const filteredEmployees = useMemo(() => {
    const q = search.toLowerCase()
    return employees.filter(e =>
      !q ||
      (e.name  && e.name.toLowerCase().includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q))
    )
  }, [employees, search])

  const totals = useMemo(() => ({
    gross: filteredByMonth.reduce((s, r) => s + Number(r.gross_period), 0),
    net:   filteredByMonth.reduce((s, r) => s + Number(r.net_period),   0),
    ded:   filteredByMonth.reduce((s, r) => s + Number(r.total_deductions), 0),
  }), [filteredByMonth])

  const handleExportAll = async (format) => {
    if (!records.length) return
    setExporting(true)
    try {
      if (format === 'excel') await doExportAllExcel(filteredByMonth, employees)
    } finally {
      setExporting(false)
    }
  }

  const handleExportEmp = async (empId, format) => {
    const emp  = employees.find(e => e.id === empId)
    const recs = filteredByMonth.filter(r => r.user_id === empId)
    if (!recs.length) return
    setExporting(true)
    try {
      const name = emp?.name || emp?.email || 'employee'
      if (format === 'pdf')   await doExportEmpPDF(recs, name)
      if (format === 'excel') await doExportAllExcel(recs, employees)
    } finally {
      setExporting(false)
    }
  }

  if (loading || !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // Access denied
  if (!MANAGER_ROLES.includes(profile.role)) {
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
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert size={24} className="text-red-400" />
          </div>
          <h2 className="font-heading font-bold text-white text-xl mb-2">Access Restricted</h2>
          <p className="font-body text-white/50 text-sm leading-relaxed mb-2">
            This area is for payroll managers, supervisors, and HR administrators.
          </p>
          <p className="font-body text-white/30 text-sm mb-8">
            Your current role: <span className="text-white/60">{profile.role || 'employee'}</span>
          </p>
          <p className="font-body text-white/25 text-xs max-w-xs mx-auto leading-relaxed">
            To request payroll access, contact your employer or ShiftBuddys support. Your employer must set your role to manager, supervisor, or payroll in the admin panel.
          </p>
          <Link href="/dashboard" className="btn-outline mt-8 mx-auto">
            Back to Dashboard
          </Link>
        </main>
      </div>
    )
  }

  // No company code
  if (!profile.company_code) {
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
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center mx-auto mb-5">
            <Building2 size={24} className="text-yellow-400" />
          </div>
          <h2 className="font-heading font-bold text-white text-xl mb-2">Company Not Linked</h2>
          <p className="font-body text-white/50 text-sm leading-relaxed mb-6">
            Your account needs a company code to access the payroll manager. Contact ShiftBuddys support to set up your company and link your employees.
          </p>
          <Link href="/dashboard" className="btn-outline mx-auto">Back to Dashboard</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/8 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={16} className="text-white/60" />
          </Link>
          <img src="/images/logo.svg" alt="ShiftBuddys" className="h-8 w-auto" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-7 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading font-bold text-white text-2xl">Payroll Manager</h1>
            <p className="font-body text-white/35 text-sm mt-0.5">
              Company: <span className="text-orange-300/70">{profile.company_code}</span>
              {' · '}{employees.length} employee{employees.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleExportAll('excel')} disabled={exporting || !filteredByMonth.length}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/15 text-green-300 border border-green-400/20 text-xs font-heading font-semibold disabled:opacity-30 hover:bg-green-500/25 transition-colors">
              <FileSpreadsheet size={13} /> Export All
            </button>
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Company stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Users,      label: 'Employees',    value: employees.length, color: 'text-blue-300' },
                { icon: DollarSign, label: filterMonth === 'all' ? 'Total Gross' : 'Period Gross',  value: fmtC(totals.gross, 0), color: 'text-white' },
                { icon: TrendingUp, label: filterMonth === 'all' ? 'Total Net'   : 'Period Net',    value: fmtC(totals.net,   0), color: 'text-green-300' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="glass rounded-2xl p-4 border border-white/8 text-center">
                  <Icon size={16} className={`${color} mx-auto mb-2`} />
                  <p className={`font-heading font-bold text-base ${color}`}>{value}</p>
                  <p className="font-body text-white/30 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Filter + search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input type="text" placeholder="Search employees..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="input-field pl-8 w-full text-sm" />
              </div>
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                className="input-field text-sm w-44">
                <option value="all">All Time</option>
                {availableMonths.map(m => (
                  <option key={m} value={m}>
                    {new Date(m + '-15').toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee table */}
            {filteredEmployees.length === 0 ? (
              <div className="glass rounded-2xl p-10 border border-white/8 text-center">
                <Users size={24} className="text-white/15 mx-auto mb-3" />
                <p className="font-heading font-semibold text-white/30 text-sm">No employees found</p>
                <p className="font-body text-white/20 text-xs mt-1">
                  Employees must have the same company code ({profile.company_code}) in their profile
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEmployees.map(emp => {
                  const stats    = empStats[emp.id] || null
                  const empRecs  = filteredByMonth.filter(r => r.user_id === emp.id)
                  const isExpanded = expandedEmp === emp.id

                  return (
                    <div key={emp.id} className="glass rounded-2xl border border-white/8 overflow-hidden">
                      {/* Employee row */}
                      <div className="flex items-center gap-3 px-4 py-4">
                        <div className="w-9 h-9 rounded-full bg-navy-500/60 flex items-center justify-center text-orange-400 font-heading font-bold text-sm flex-shrink-0">
                          {(emp.name || emp.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-heading font-semibold text-white text-sm truncate">
                              {emp.name || emp.email}
                            </p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-heading font-semibold border ${
                              emp.role === 'manager'    ? 'bg-orange-500/15 text-orange-300 border-orange-400/25' :
                              emp.role === 'supervisor' ? 'bg-blue-500/15   text-blue-300   border-blue-400/25'   :
                              emp.role === 'payroll'    ? 'bg-purple-500/15 text-purple-300 border-purple-400/25' :
                              'bg-white/5 text-white/30 border-white/10'
                            }`}>
                              {emp.role || 'employee'}
                            </span>
                          </div>
                          <p className="font-body text-white/30 text-xs">{emp.email}</p>
                        </div>

                        {stats ? (
                          <div className="text-right hidden sm:block">
                            <p className="font-heading font-semibold text-white text-sm">{fmtC(stats.gross, 0)}</p>
                            <p className="font-body text-green-300/70 text-xs">→ {fmtC(stats.net, 0)} net</p>
                          </div>
                        ) : (
                          <p className="font-body text-white/20 text-xs">No records</p>
                        )}

                        {/* Per-employee export */}
                        {stats && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleExportEmp(emp.id, 'pdf')} disabled={exporting}
                              className="p-1.5 rounded-lg text-white/20 hover:text-red-300 hover:bg-red-400/10 transition-colors disabled:opacity-30"
                              title="Export PDF">
                              <FileText size={14} />
                            </button>
                            <button onClick={() => handleExportEmp(emp.id, 'excel')} disabled={exporting}
                              className="p-1.5 rounded-lg text-white/20 hover:text-green-300 hover:bg-green-400/10 transition-colors disabled:opacity-30"
                              title="Export Excel">
                              <FileSpreadsheet size={14} />
                            </button>
                          </div>
                        )}

                        <button onClick={() => setExpandedEmp(isExpanded ? null : emp.id)}
                          className="p-1.5 rounded-lg text-white/20 hover:text-white/60 transition-colors">
                          {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </button>
                      </div>

                      {/* Expanded employee records */}
                      {isExpanded && (
                        <div className="border-t border-white/8 px-4 pb-4 pt-3">
                          {empRecs.length === 0 ? (
                            <p className="font-body text-white/25 text-sm text-center py-3">
                              No paycheck records for this period
                            </p>
                          ) : (
                            <div className="space-y-2">
                              <div className="grid grid-cols-4 gap-2 mb-3">
                                {[
                                  { label: 'Records',  value: stats?.count || 0 },
                                  { label: 'Avg Gross', value: fmtC(stats ? stats.gross / stats.count : 0, 0) },
                                  { label: 'Avg Net',   value: fmtC(stats ? stats.net   / stats.count : 0, 0) },
                                  { label: 'Last Pay',  value: stats?.lastDate ? new Date(stats.lastDate + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : '—' },
                                ].map(({ label, value }) => (
                                  <div key={label} className="glass rounded-xl px-2 py-2 border border-white/6 text-center">
                                    <p className="font-heading font-bold text-white text-xs">{value}</p>
                                    <p className="font-body text-white/25 text-xs">{label}</p>
                                  </div>
                                ))}
                              </div>

                              {empRecs.map(r => (
                                <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5">
                                  <div className="flex-1">
                                    <p className="font-heading font-semibold text-white/80 text-xs">{fmtDate(r.pay_date)}</p>
                                    {r.period_start && (
                                      <p className="font-body text-white/25 text-xs">{fmtDate(r.period_start)} – {fmtDate(r.period_end)}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-heading font-semibold text-white/80 text-xs">{fmtC(r.gross_period)}</p>
                                    <p className="font-body text-green-300/60 text-xs">→ {fmtC(r.net_period)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-body text-white/25 text-xs">{fmtC(r.hourly_rate)}/h</p>
                                    <p className="font-body text-white/25 text-xs">{r.regular_hours}h reg</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Totals footer */}
            {filteredByMonth.length > 0 && (
              <div className="glass rounded-2xl p-5 border border-orange-400/20">
                <p className="font-heading text-white/30 text-xs uppercase tracking-wider mb-3">
                  {filterMonth === 'all' ? 'All-time' : new Date(filterMonth + '-15').toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })} Company Totals
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Gross', value: fmtC(totals.gross, 0), color: 'text-white' },
                    { label: 'Total Deductions', value: fmtC(totals.ded, 0), color: 'text-red-300' },
                    { label: 'Total Net', value: fmtC(totals.net, 0), color: 'text-green-300' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <p className="font-body text-white/25 text-xs">{label}</p>
                      <p className={`font-heading font-bold text-lg ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="font-body text-white/15 text-xs text-center leading-relaxed">
              Individual employee data is only visible here due to your manager role. All data is private from other employees.
            </p>
          </>
        )}
      </main>
    </div>
  )
}
