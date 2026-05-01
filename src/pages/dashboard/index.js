import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { LogOut, Settings, Calendar, Users, MessageSquare, MapPin, ChevronRight, Sun, Moon, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

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
    return {
      phase: 'ON_SHIFT',
      daysRemaining: onDays - dayInCycle,
      dayNumber: dayInCycle + 1,
      totalDays: onDays,
      progressPct: ((dayInCycle + 1) / onDays) * 100,
    }
  } else {
    const homeDay = dayInCycle - onDays
    return {
      phase: 'AT_HOME',
      daysRemaining: totalCycle - dayInCycle,
      dayNumber: homeDay + 1,
      totalDays: offDays,
      progressPct: ((homeDay + 1) / offDays) * 100,
    }
  }
}

export default function Dashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
      return
    }
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          if (!data || !data.onboarding_complete) {
            router.replace('/onboarding')
          } else {
            setProfile(data)
            setProfileLoading(false)
          }
        })
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !profile) return null

  const status = getRotationStatus(profile.rotation_start_date, profile.rotation_pattern)
  const displayName = profile.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Worker'
  const firstName = displayName.split(' ')[0]

  const dateStr = new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <nav className="border-b border-white/8 px-4 py-3.5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <img src="/images/logo.svg" alt="ShiftBuddys" className="h-8 w-auto" />
          <div className="flex items-center gap-2">
            <Link href="/onboarding"
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors"
              title="Update rotation">
              <RefreshCw size={15} className="text-white/50" />
            </Link>
            <button onClick={handleSignOut}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors"
              title="Sign out">
              <LogOut size={15} className="text-white/50" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-7 space-y-5">
        {/* Greeting */}
        <div>
          <p className="font-body text-white/35 text-sm">{dateStr}</p>
          <h1 className="font-heading font-bold text-white text-2xl mt-0.5">
            Hey {firstName} 👷
          </h1>
        </div>

        {/* Main rotation card */}
        {status ? (
          <div className={`rounded-3xl p-7 border ${
            status.phase === 'ON_SHIFT'
              ? 'border-orange-500/30 bg-gradient-to-br from-orange-600/15 via-orange-900/5 to-transparent'
              : 'border-blue-400/30 bg-gradient-to-br from-blue-600/15 via-blue-900/5 to-transparent'
          }`}>
            {/* Status badge + day label */}
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
                <p className="font-body text-white/45 text-sm">
                  Day {status.dayNumber} of {status.totalDays}
                </p>
              </div>

              {/* Big countdown number */}
              <div className="text-right">
                <p className="font-display text-7xl text-white leading-none">{status.daysRemaining}</p>
                <p className="font-body text-white/45 text-sm mt-1">
                  day{status.daysRemaining !== 1 ? 's' : ''}{' '}
                  {status.phase === 'ON_SHIFT' ? 'until home' : 'until work'}
                </p>
              </div>
            </div>

            {/* Progress bar */}
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
              <p className="font-body text-white/25 text-xs text-center pt-1">
                {profile.rotation_pattern} rotation
              </p>
            </div>
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 border border-white/8 text-center">
            <p className="font-body text-white/50 text-sm mb-3">Rotation not configured yet.</p>
            <Link href="/onboarding" className="btn-outline text-sm">
              Set up your rotation <ChevronRight size={14} />
            </Link>
          </div>
        )}

        {/* Feature tiles */}
        <div>
          <p className="font-heading text-white/30 text-xs uppercase tracking-wider mb-3">Coming Soon</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-5 border border-white/8">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mb-3">
                <Calendar size={18} className="text-orange-400" />
              </div>
              <p className="font-heading font-semibold text-white text-sm">Shift Calendar</p>
              <p className="font-body text-white/30 text-xs mt-1">Full rotation view</p>
            </div>
            <div className="glass rounded-2xl p-5 border border-white/8">
              <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center mb-3">
                <Users size={18} className="text-pink-400" />
              </div>
              <p className="font-heading font-semibold text-white text-sm">Family Sync</p>
              <p className="font-body text-white/30 text-xs mt-1">Shared calendar</p>
            </div>
            <div className="glass rounded-2xl p-5 border border-white/8">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-3">
                <MessageSquare size={18} className="text-purple-400" />
              </div>
              <p className="font-heading font-semibold text-white text-sm">Crew Chat</p>
              <p className="font-body text-white/30 text-xs mt-1">Your crew network</p>
            </div>
            <div className="glass rounded-2xl p-5 border border-white/8">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-3">
                <MapPin size={18} className="text-green-400" />
              </div>
              <p className="font-heading font-semibold text-white text-sm">Fort Mac Life</p>
              <p className="font-body text-white/30 text-xs mt-1">Weather &amp; events</p>
            </div>
          </div>
        </div>

        {/* Rotation info row */}
        <div className="glass rounded-2xl px-5 py-4 border border-white/8 flex items-center justify-between">
          <div>
            <p className="font-heading font-semibold text-white text-sm">Rotation Setup</p>
            <p className="font-body text-white/35 text-xs mt-0.5">
              {profile.rotation_pattern} &middot; started{' '}
              {new Date(profile.rotation_start_date + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <Link href="/onboarding"
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronRight size={14} className="text-white/40" />
          </Link>
        </div>
      </main>
    </div>
  )
}
