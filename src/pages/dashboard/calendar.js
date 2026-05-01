import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowLeft, Plus, X, Trash2, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { getDayPhase } from '../../lib/rotationUtils'
import { getHolidays } from '../../lib/holidays'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const CAL_COLORS = ['#60a5fa', '#c084fc', '#f472b6', '#34d399', '#fb923c', '#facc15']

function buildCalendarDays(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const days = []
  for (let i = first.getDay(); i > 0; i--) days.push({ date: new Date(year, month, 1 - i), current: false })
  for (let i = 1; i <= last.getDate(); i++) days.push({ date: new Date(year, month, i), current: true })
  let next = 1
  while (days.length < 42) days.push({ date: new Date(year, month + 1, next++), current: false })
  return days
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function CalendarPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const now = new Date()
  const todayStr = toDateStr(now)
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState(todayStr)
  const [externalEvents, setExternalEvents] = useState({})
  const [eventsLoading, setEventsLoading] = useState(false)
  const [calErrors, setCalErrors] = useState({})
  const [showConnect, setShowConnect] = useState(false)
  const [newCal, setNewCal] = useState({ name: '', url: '', color: '#60a5fa' })
  const [savingCal, setSavingCal] = useState(false)
  const [calError, setCalError] = useState('')

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return }
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          if (!data?.onboarding_complete) { router.replace('/onboarding'); return }
          setProfile(data)
          setProfileLoading(false)
        })
    }
  }, [user, loading, router])

  const fetchEvents = useCallback(async (calUrls, year, month) => {
    if (!calUrls?.length) { setExternalEvents({}); return }
    setEventsLoading(true)
    const from = new Date(year, month, 1).toISOString().split('T')[0]
    const to   = new Date(year, month + 1, 0).toISOString().split('T')[0]
    const merged = {}
    const errors = {}
    await Promise.allSettled(calUrls.map(async cal => {
      try {
        const res  = await fetch(`/api/ics-events?${new URLSearchParams({ url: cal.url, from, to })}`)
        const data = await res.json()
        if (data.error) { errors[cal.id] = data.error; return }
        for (const ev of (data.events || [])) {
          if (!merged[ev.date]) merged[ev.date] = []
          merged[ev.date].push({ summary: ev.summary, calName: cal.name, color: cal.color })
        }
      } catch (e) {
        errors[cal.id] = 'Could not reach calendar'
      }
    }))
    setExternalEvents(merged)
    setCalErrors(errors)
    setEventsLoading(false)
  }, [])

  useEffect(() => {
    if (profile) fetchEvents(profile.calendar_urls, viewYear, viewMonth)
  }, [profile, viewYear, viewMonth, fetchEvents])

  const prevMonth = () => viewMonth === 0 ? (setViewYear(y => y - 1), setViewMonth(11)) : setViewMonth(m => m - 1)
  const nextMonth = () => viewMonth === 11 ? (setViewYear(y => y + 1), setViewMonth(0)) : setViewMonth(m => m + 1)

  const handleAddCalendar = async () => {
    if (!newCal.name || !newCal.url) return
    // Normalize webcal:// → https://
    const normalizedUrl = newCal.url.trim().replace(/^webcal:\/\//i, 'https://')
    if (!normalizedUrl.startsWith('https://') && !normalizedUrl.startsWith('http://')) {
      setCalError('URL must start with https:// or webcal://')
      return
    }
    setSavingCal(true); setCalError('')
    const calToAdd = { ...newCal, url: normalizedUrl }
    const updated = [...(profile.calendar_urls || []), { id: Date.now().toString(), ...calToAdd }]
    const { error } = await supabase.from('profiles').update({ calendar_urls: updated }).eq('id', user.id)
    if (error) { setCalError(error.message); setSavingCal(false) }
    else {
      setProfile(p => ({ ...p, calendar_urls: updated }))
      setNewCal({ name: '', url: '', color: '#60a5fa' })
      setShowConnect(false); setSavingCal(false)
    }
  }

  const handleRemoveCalendar = async (id) => {
    const updated = (profile.calendar_urls || []).filter(c => c.id !== id)
    await supabase.from('profiles').update({ calendar_urls: updated }).eq('id', user.id)
    setProfile(p => ({ ...p, calendar_urls: updated }))
  }

  const holidays = useMemo(() => [
    ...getHolidays(viewYear - 1),
    ...getHolidays(viewYear),
    ...getHolidays(viewYear + 1),
  ], [viewYear])

  const holidayMap = useMemo(() => {
    const map = {}
    for (const h of holidays) {
      if (!map[h.date]) map[h.date] = []
      map[h.date].push(h.name)
    }
    return map
  }, [holidays])

  if (loading || profileLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user || !profile) return null

  const calDays = buildCalendarDays(viewYear, viewMonth)
  const selDate = selectedDay ? new Date(selectedDay + 'T12:00:00') : null
  const selPhase = selDate ? getDayPhase(selDate, profile.rotation_start_date, profile.rotation_pattern) : null
  const selHolidays = holidayMap[selectedDay] || []
  const selEvents = externalEvents[selectedDay] || []

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/8 px-4 py-3.5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ArrowLeft size={16} className="text-white/60" />
            </Link>
            <img src="/images/logo.svg" alt="ShiftBuddys" className="h-8 w-auto" />
          </div>
          <button onClick={() => setShowConnect(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-sm font-heading font-medium hover:bg-orange-500/25 transition-colors">
            <Plus size={14} /> Connect
          </button>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft size={18} className="text-white/60" />
          </button>
          <div className="text-center">
            <h1 className="font-heading font-bold text-white text-xl">{MONTH_NAMES[viewMonth]}</h1>
            <p className="font-body text-white/30 text-sm">{viewYear}</p>
          </div>
          <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronRight size={18} className="text-white/60" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="glass rounded-3xl p-3 border border-white/8 relative">
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center font-heading text-white/25 text-xs py-2">{d}</div>
            ))}
          </div>
          {eventsLoading && profile.calendar_urls?.length > 0 && (
            <div className="absolute top-2 right-2">
              <Loader2 size={14} className="text-white/30 animate-spin" />
            </div>
          )}
          <div className="grid grid-cols-7 gap-1">
            {calDays.map(({ date, current }, idx) => {
              const ds = toDateStr(date)
              const phase = getDayPhase(date, profile.rotation_start_date, profile.rotation_pattern)
              const isToday = ds === todayStr
              const isSelected = ds === selectedDay
              const hasHoliday = !!holidayMap[ds]
              const dayExEvents = externalEvents[ds] || []

              return (
                <button key={idx} onClick={() => current && setSelectedDay(ds)}
                  className={[
                    'rounded-xl flex flex-col items-center pt-1.5 pb-1 gap-0.5 transition-all',
                    !current ? 'opacity-20 cursor-default' : 'cursor-pointer active:scale-95',
                    current && phase === 'ON_SHIFT' ? 'bg-red-500/25' : '',
                    current && phase === 'AT_HOME' ? 'bg-green-500/25' : '',
                    isToday ? 'ring-2 ring-white ring-offset-1 ring-offset-[#040f1a]' : '',
                    isSelected && current ? 'brightness-110 scale-95' : '',
                  ].join(' ')}
                  style={{ aspectRatio: '1' }}>
                  <span className={[
                    'font-heading text-xs leading-none',
                    !current ? 'text-white/40' : phase === 'ON_SHIFT' ? 'text-red-200' : 'text-green-200',
                    isToday ? 'font-bold' : 'font-medium',
                  ].join(' ')}>
                    {date.getDate()}
                  </span>
                  <div className="flex gap-0.5 items-center" style={{ minHeight: '6px' }}>
                    {hasHoliday && current && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                    {dayExEvents.slice(0, 2).map((e, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: e.color }} />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {[
            { color: 'bg-red-500/25 border-red-500/20', label: 'On Shift' },
            { color: 'bg-green-500/25 border-green-500/20', label: 'At Home' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded-md border ${color}`} />
              <span className="font-body text-white/40 text-xs">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="font-body text-white/40 text-xs">Holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md border-2 border-white" />
            <span className="font-body text-white/40 text-xs">Today</span>
          </div>
        </div>

        {/* Selected day detail */}
        {selDate && (
          <div className="glass rounded-2xl p-4 border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <p className="font-heading font-semibold text-white text-sm">
                {selDate.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              {selPhase && (
                <span className={`text-xs font-heading font-semibold px-2.5 py-1 rounded-full border ${
                  selPhase === 'ON_SHIFT'
                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                    : 'bg-green-500/20 text-green-300 border-green-500/30'
                }`}>
                  {selPhase === 'ON_SHIFT' ? '⛏️ On Shift' : '🏠 At Home'}
                </span>
              )}
            </div>
            {selHolidays.length === 0 && selEvents.length === 0
              ? <p className="font-body text-white/25 text-sm">No events or holidays</p>
              : (
                <div className="space-y-2.5">
                  {selHolidays.map(h => (
                    <div key={h} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                      <p className="font-body text-white/70 text-sm">{h} 🇨🇦</p>
                    </div>
                  ))}
                  {selEvents.map((e, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: e.color }} />
                      <div>
                        <p className="font-body text-white/70 text-sm leading-snug">{e.summary}</p>
                        <p className="font-body text-white/30 text-xs">{e.calName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* Connected calendars */}
        {profile.calendar_urls?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-heading text-white/35 text-xs uppercase tracking-wider">Connected Calendars</p>
              <button onClick={() => fetchEvents(profile.calendar_urls, viewYear, viewMonth)}
                className="flex items-center gap-1 text-white/25 hover:text-white/50 transition-colors text-xs font-heading">
                <RefreshCw size={11} />
                Refresh
              </button>
            </div>
            <div className="space-y-2">
              {profile.calendar_urls.map(cal => {
                const hasError = !!calErrors[cal.id]
                return (
                  <div key={cal.id} className={`glass rounded-xl px-4 py-3 border flex items-center justify-between ${hasError ? 'border-red-500/20' : 'border-white/8'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cal.color }} />
                      <div className="min-w-0">
                        <p className="font-heading font-medium text-white text-sm">{cal.name}</p>
                        {hasError && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <AlertCircle size={11} className="text-red-400 flex-shrink-0" />
                            <p className="font-body text-red-400/80 text-xs truncate">{calErrors[cal.id]}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleRemoveCalendar(cal.id)}
                      className="text-white/20 hover:text-red-400 transition-colors p-1 flex-shrink-0 ml-2">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <p className="font-body text-white/15 text-xs text-center pb-4">
          {profile.rotation_pattern} rotation &middot; started{' '}
          {new Date(profile.rotation_start_date + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </main>

      {/* Connect Calendar bottom sheet */}
      {showConnect && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4"
          onClick={() => setShowConnect(false)}>
          <div className="glass rounded-3xl p-6 border border-white/10 w-full max-w-lg space-y-4 mb-safe"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-white text-lg">Connect a Calendar</h3>
              <button onClick={() => setShowConnect(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="bg-white/4 rounded-xl p-4 space-y-2.5">
              <p className="font-heading font-semibold text-white/50 text-xs uppercase tracking-wider">How to get your ICS link</p>
              <p className="font-body text-white/50 text-xs leading-relaxed">
                <span className="text-white/70 font-semibold">Google Calendar:</span> Open calendar.google.com → Settings (gear) → click your calendar name → scroll to "Integrate calendar" → copy "Secret address in iCal format"
              </p>
              <p className="font-body text-white/50 text-xs leading-relaxed">
                <span className="text-white/70 font-semibold">Outlook.com:</span> outlook.com → Settings → View all settings → Calendar → Shared calendars → "Publish a calendar" → select calendar → select "All events" → Copy the ICS link
              </p>
              <p className="font-body text-white/50 text-xs leading-relaxed">
                <span className="text-white/70 font-semibold">Work Outlook (Exchange):</span> Your IT team or Outlook web → Calendar → Share → copy ICS/subscription link
              </p>
            </div>

            <div>
              <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Name this calendar</label>
              <input type="text" placeholder="Work, Family, Partner..."
                value={newCal.name} onChange={e => setNewCal(p => ({ ...p, name: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">ICS URL</label>
              <input type="url" placeholder="https://calendar.google.com/calendar/ical/..."
                value={newCal.url} onChange={e => setNewCal(p => ({ ...p, url: e.target.value }))}
                className="input-field" />
            </div>
            <div>
              <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-2">Colour</label>
              <div className="flex gap-2.5">
                {CAL_COLORS.map(c => (
                  <button key={c} onClick={() => setNewCal(p => ({ ...p, color: c }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${newCal.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            {calError && <p className="font-body text-red-400 text-sm">{calError}</p>}
            <button onClick={handleAddCalendar}
              disabled={savingCal || !newCal.name || !newCal.url}
              className="btn-primary justify-center w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              {savingCal ? 'Connecting...' : (<><Plus size={16} /> Connect Calendar</>)}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
