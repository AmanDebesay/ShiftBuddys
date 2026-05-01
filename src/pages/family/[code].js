import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Sun, Moon, Home } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function getRotationStatus(startDateStr, pattern) {
  if (!startDateStr || !pattern) return null
  const parts = pattern.split('/')
  if (parts.length !== 2) return null
  const onDays = parseInt(parts[0])
  const offDays = parseInt(parts[1])
  if (isNaN(onDays) || isNaN(offDays)) return null
  const totalCycle = onDays + offDays
  const start = new Date(startDateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24))
  const dayInCycle = ((daysSinceStart % totalCycle) + totalCycle) % totalCycle
  if (dayInCycle < onDays) {
    return { phase: 'ON_SHIFT', daysRemaining: onDays - dayInCycle, dayNumber: dayInCycle + 1, totalDays: onDays, progressPct: ((dayInCycle + 1) / onDays) * 100 }
  } else {
    const homeDay = dayInCycle - onDays
    return { phase: 'AT_HOME', daysRemaining: totalCycle - dayInCycle, dayNumber: homeDay + 1, totalDays: offDays, progressPct: ((homeDay + 1) / offDays) * 100 }
  }
}

export default function FamilyView() {
  const router = useRouter()
  const { code } = router.query
  const [profile, setProfile] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!code) return
    supabase.from('profiles')
      .select('name, rotation_pattern, rotation_start_date')
      .eq('invite_code', code)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data)
        else setNotFound(true)
        setLoading(false)
      })
  }, [code])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">🔍</p>
        <h1 className="font-heading font-bold text-white text-xl mb-2">Link not found</h1>
        <p className="font-body text-white/40 text-sm">This invite link may have expired or been reset.</p>
      </div>
    </div>
  )

  const status = getRotationStatus(profile.rotation_start_date, profile.rotation_pattern)
  const firstName = (profile.name || 'Your worker').split(' ')[0]
  const isComingHome = status && status.phase === 'ON_SHIFT' && status.daysRemaining <= 2

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/8 px-4 py-3.5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <img src="/images/logo.svg" alt="ShiftBuddys" className="h-8 w-auto" />
          <span className="font-heading text-white/25 text-xs">Shared rotation view</span>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-10 space-y-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto mb-4">
            👷
          </div>
          <h1 className="font-heading font-bold text-white text-2xl">{firstName}'s Rotation</h1>
          <p className="font-body text-white/35 text-sm mt-1">{profile.rotation_pattern} rotation</p>
        </div>

        {isComingHome && (
          <div className="rounded-2xl p-5 border border-yellow-400/40 bg-yellow-500/10 text-center">
            <p className="text-2xl mb-2">🏠</p>
            <p className="font-heading font-bold text-yellow-300">Coming Home Soon!</p>
            <p className="font-body text-yellow-200/60 text-sm mt-1">
              {status.daysRemaining === 1 ? 'Last day on shift — home tomorrow!' : 'Home in 2 days!'}
            </p>
          </div>
        )}

        {status ? (
          <div className={`rounded-3xl p-7 border ${
            status.phase === 'ON_SHIFT'
              ? 'border-orange-500/30 bg-gradient-to-br from-orange-600/15 via-orange-900/5 to-transparent'
              : 'border-blue-400/30 bg-gradient-to-br from-blue-600/15 via-blue-900/5 to-transparent'
          }`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-semibold uppercase tracking-wider mb-3 ${
                  status.phase === 'ON_SHIFT'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {status.phase === 'ON_SHIFT' ? <Sun size={11} /> : <Moon size={11} />}
                  {status.phase === 'ON_SHIFT' ? 'On Shift' : 'At Home'}
                </div>
                <p className="font-body text-white/45 text-sm">Day {status.dayNumber} of {status.totalDays}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-7xl text-white leading-none">{status.daysRemaining}</p>
                <p className="font-body text-white/45 text-sm mt-1">
                  day{status.daysRemaining !== 1 ? 's' : ''}{' '}
                  {status.phase === 'ON_SHIFT' ? 'until home' : 'until work'}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-body text-white/35">
                <span>{status.phase === 'ON_SHIFT' ? 'Shift start' : 'Home start'}</span>
                <span>{status.phase === 'ON_SHIFT' ? '🏠 Going home' : '⛏️ Back to work'}</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    status.phase === 'ON_SHIFT' ? 'bg-gradient-to-r from-orange-600 to-orange-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'
                  }`}
                  style={{ width: `${Math.min(Math.max(status.progressPct, 2), 100)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 border border-white/8 text-center">
            <p className="font-body text-white/40 text-sm">Rotation not set up yet.</p>
          </div>
        )}

        <div className="glass rounded-2xl px-5 py-4 border border-white/8 text-center">
          <p className="font-body text-white/20 text-xs">
            This page is shared by {firstName}. Only rotation status is visible — nothing else is shared.
          </p>
        </div>

        <div className="text-center">
          <a href="https://shiftbuddys.ca" className="font-heading text-white/15 text-xs hover:text-white/30 transition-colors">
            Powered by ShiftBuddys
          </a>
        </div>
      </main>
    </div>
  )
}
