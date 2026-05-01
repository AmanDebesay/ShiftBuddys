import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Circle, Home, Heart, MessageCircle, ShoppingCart, Wrench, Smile } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { getRotationStatus } from '../../lib/rotationUtils'

const CHECKLIST_SECTIONS = [
  {
    title: 'Before You Leave Site',
    icon: Wrench,
    color: 'text-orange-400',
    items: [
      'Submit any outstanding timesheets',
      'Return borrowed tools / gear',
      'Clean your room / locker area',
      'Confirm your ride home or flight',
      'Charge your phone fully',
      'Pack all your medications',
    ],
  },
  {
    title: 'On the Way Home',
    icon: Home,
    color: 'text-blue-400',
    items: [
      'Text your partner your ETA',
      'Pick up a small gift or treat',
      'Stop for groceries if needed',
      'Decompress — listen to music or a podcast',
      'No phone calls about work',
    ],
  },
  {
    title: 'First 24 Hours Home',
    icon: Heart,
    color: 'text-rose-400',
    items: [
      'Hug your people first — before unpacking',
      "Let the kids show you what they've been up to",
      'Sleep in your own bed',
      'Eat a home-cooked meal together',
      'Avoid jumping straight into chores or fixing things',
      'Keep your first night low-key',
    ],
  },
  {
    title: 'Reconnecting',
    icon: MessageCircle,
    color: 'text-green-400',
    items: [
      'Ask questions — listen more than you talk',
      'Your partner held everything down — acknowledge it',
      'Kids may need time to warm up — be patient',
      'Share one good thing from your rotation',
      'Plan one family activity together',
    ],
  },
  {
    title: 'Practical Stuff',
    icon: ShoppingCart,
    color: 'text-yellow-400',
    items: [
      'Grocery run together',
      'Check bills / finances',
      "Schedule any appointments you've been putting off",
      'Get your vehicle checked if needed',
      'Rest before you start tackling the to-do list',
    ],
  },
]

const TIPS = [
  { emoji: '🧠', tip: 'Your brain needs 24–48 hrs to shift out of "work mode." Give yourself grace.' },
  { emoji: '💤', tip: 'Sleep deprivation stacks. Catching up on rest isn\'t lazy — it\'s recovery.' },
  { emoji: '🗣️', tip: 'Talk to your partner about the schedule before you leave site, not after you arrive.' },
  { emoji: '📵', tip: 'Mute work group chats for your first 12 hours home. The site will survive.' },
  { emoji: '❤️', tip: 'Coming home stress is real. If conflict spikes within 24 hrs, it\'s normal. Breathe.' },
  { emoji: '🍺', tip: 'Limit alcohol the first night — it disrupts the sleep you actually need.' },
]

function pad(n) { return String(n).padStart(2, '0') }

export default function ComingHome() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [checked, setChecked] = useState({})
  const [countdown, setCountdown] = useState(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [user])

  // Countdown to home — calculates the exact moment the last ON shift day ends
  useEffect(() => {
    if (!profile) return
    const status = getRotationStatus(profile.rotation_start_date, profile.rotation_pattern)
    if (!status || status.phase !== 'ON_SHIFT') return

    const tick = () => {
      const now = new Date()
      // End of the last shift day = midnight (start of day) after daysRemaining days
      const target = new Date()
      target.setHours(0, 0, 0, 0)
      target.setDate(target.getDate() + status.daysRemaining)
      const diff = target - now
      if (diff <= 0) { setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setCountdown({ days, hours, minutes, seconds })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [profile])

  const toggleItem = (sectionIdx, itemIdx) => {
    const key = `${sectionIdx}-${itemIdx}`
    setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const totalItems = CHECKLIST_SECTIONS.reduce((s, sec) => s + sec.items.length, 0)
  const checkedCount = Object.values(checked).filter(Boolean).length

  if (loading || !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const status = getRotationStatus(profile.rotation_start_date, profile.rotation_pattern)
  const isActive = status && status.phase === 'ON_SHIFT' && status.daysRemaining <= 2

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

      <main className="max-w-lg mx-auto px-4 py-7 space-y-6">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Coming Home Mode</h1>
          <p className="font-body text-white/35 text-sm mt-0.5">48-hr reintegration guide for rotation workers</p>
        </div>

        {/* Countdown — only when active */}
        {isActive && countdown && (
          <div className="rounded-3xl p-6 border border-yellow-400/40 bg-yellow-500/8">
            <p className="font-heading font-semibold text-yellow-300 text-sm mb-4">🏠 You're almost home</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Days',    val: countdown.days },
                { label: 'Hours',   val: countdown.hours },
                { label: 'Minutes', val: countdown.minutes },
                { label: 'Seconds', val: countdown.seconds },
              ].map(({ label, val }) => (
                <div key={label} className="glass rounded-2xl py-3 border border-white/8">
                  <p className="font-display text-3xl text-white leading-none">{pad(val)}</p>
                  <p className="font-body text-white/30 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
            <p className="font-body text-yellow-200/50 text-xs text-center mt-4">
              {status.daysRemaining === 1 ? "Last shift day — you've got this." : "Two more days and you're done."}
            </p>
          </div>
        )}

        {/* Not in coming home window */}
        {!isActive && status && (
          <div className="glass rounded-2xl p-5 border border-white/8 text-center">
            <Smile size={28} className="text-white/20 mx-auto mb-3" />
            <p className="font-heading font-semibold text-white text-sm">
              {status.phase === 'ON_SHIFT'
                ? `${status.daysRemaining} days until home — check back closer to your return`
                : 'You\'re home! Enjoy your time off.'}
            </p>
            <p className="font-body text-white/30 text-xs mt-1">
              This countdown activates within 48 hrs of your rotation end.
            </p>
          </div>
        )}

        {/* Progress bar */}
        {checkedCount > 0 && (
          <div className="glass rounded-2xl px-5 py-4 border border-white/8">
            <div className="flex justify-between text-xs font-heading text-white/40 mb-2">
              <span>Checklist Progress</span>
              <span>{checkedCount} / {totalItems}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                style={{ width: `${(checkedCount / totalItems) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Checklists */}
        {CHECKLIST_SECTIONS.map((section, sIdx) => {
          const Icon = section.icon
          return (
            <div key={section.title} className="glass rounded-2xl p-5 border border-white/8">
              <div className="flex items-center gap-2.5 mb-4">
                <Icon size={16} className={section.color} />
                <p className="font-heading font-semibold text-white text-sm">{section.title}</p>
              </div>
              <div className="space-y-3">
                {section.items.map((item, iIdx) => {
                  const key = `${sIdx}-${iIdx}`
                  const done = !!checked[key]
                  return (
                    <button key={iIdx} onClick={() => toggleItem(sIdx, iIdx)}
                      className="w-full flex items-start gap-3 text-left group">
                      {done
                        ? <CheckCircle2 size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                        : <Circle size={18} className="text-white/20 flex-shrink-0 mt-0.5 group-hover:text-white/40 transition-colors" />
                      }
                      <span className={`font-body text-sm leading-snug transition-colors ${done ? 'text-white/30 line-through' : 'text-white/65'}`}>
                        {item}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Tips */}
        <div>
          <p className="font-heading text-white/30 text-xs uppercase tracking-wider mb-3">Worker Tips</p>
          <div className="space-y-2">
            {TIPS.map((t, i) => (
              <div key={i} className="glass rounded-xl px-4 py-3.5 border border-white/8 flex items-start gap-3">
                <span className="text-xl leading-none flex-shrink-0">{t.emoji}</span>
                <p className="font-body text-white/55 text-sm leading-relaxed">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mental health reminder */}
        <div className="rounded-2xl p-5 border border-blue-400/20 bg-blue-500/8">
          <p className="font-heading font-semibold text-blue-300 text-sm mb-2">💙 Reintegration is hard</p>
          <p className="font-body text-white/45 text-sm leading-relaxed">
            Many rotation workers experience tension or emotional distance in their first 24 hrs home.
            It doesn't mean something is wrong — it means you've been away. Give yourself and your family time.
          </p>
          <Link href="/dashboard/wellbeing"
            className="inline-flex items-center gap-2 mt-3 text-blue-300 font-heading font-semibold text-sm hover:text-blue-200 transition-colors">
            Log your mood today →
          </Link>
        </div>

        <div className="h-4" />
      </main>
    </div>
  )
}
