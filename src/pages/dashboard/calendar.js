import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { getDayPhase } from '../../lib/rotationUtils'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []
  for (let i = firstDay.getDay(); i > 0; i--) {
    days.push({ date: new Date(year, month, 1 - i), current: false })
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), current: true })
  }
  while (days.length < 42) {
    days.push({ date: new Date(year, month + 1, days.length - lastDay.getDate() - firstDay.getDay() + 1), current: false })
  }
  return days
}

export default function CalendarPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

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

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !profile) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const calDays = buildCalendarDays(viewYear, viewMonth)

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/8 px-4 py-3.5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/dashboard"
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={16} className="text-white/60" />
          </Link>
          <img src="/images/logo.svg" alt="ShiftBuddys" className="h-8 w-auto" />
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-7">
        {/* Month navigator */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft size={18} className="text-white/60" />
          </button>
          <div className="text-center">
            <h1 className="font-heading font-bold text-white text-xl">{MONTH_NAMES[viewMonth]}</h1>
            <p className="font-body text-white/30 text-sm">{viewYear}</p>
          </div>
          <button onClick={nextMonth}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronRight size={18} className="text-white/60" />
          </button>
        </div>

        {/* Calendar */}
        <div className="glass rounded-3xl p-4 border border-white/8">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center font-heading text-white/25 text-xs py-2">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {calDays.map(({ date, current }, idx) => {
              const phase = getDayPhase(date, profile.rotation_start_date, profile.rotation_pattern)
              const isToday = date.getTime() === today.getTime()

              return (
                <div key={idx} className={`
                  aspect-square rounded-xl flex items-center justify-center
                  ${!current ? 'opacity-20' : ''}
                  ${current && phase === 'ON_SHIFT' ? 'bg-orange-500/25' : ''}
                  ${current && phase === 'AT_HOME' ? 'bg-white/4' : ''}
                  ${isToday ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent' : ''}
                `}>
                  <span className={`
                    font-heading text-sm leading-none select-none
                    ${phase === 'ON_SHIFT' ? 'text-orange-300' : 'text-white/55'}
                    ${isToday ? 'text-white font-bold' : 'font-medium'}
                  `}>
                    {date.getDate()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-orange-500/25 border border-orange-400/30" />
            <span className="font-body text-white/40 text-xs">On Shift</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-white/5 border border-white/10" />
            <span className="font-body text-white/40 text-xs">At Home</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md border-2 border-white" />
            <span className="font-body text-white/40 text-xs">Today</span>
          </div>
        </div>

        {/* Rotation label */}
        <p className="text-center font-body text-white/20 text-xs mt-4">
          {profile.rotation_pattern} rotation &middot; started{' '}
          {new Date(profile.rotation_start_date + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </main>
    </div>
  )
}
