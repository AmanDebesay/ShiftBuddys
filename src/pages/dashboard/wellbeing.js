import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft, Phone, AlertCircle, Moon, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const MOODS = [
  { value: 1, emoji: '😞', label: 'Rough',  bg: 'bg-red-500/25',    ring: 'ring-red-400',    text: 'text-red-300' },
  { value: 2, emoji: '😔', label: 'Low',    bg: 'bg-orange-500/25', ring: 'ring-orange-400', text: 'text-orange-300' },
  { value: 3, emoji: '😐', label: 'Okay',   bg: 'bg-yellow-500/25', ring: 'ring-yellow-400', text: 'text-yellow-300' },
  { value: 4, emoji: '🙂', label: 'Good',   bg: 'bg-lime-500/25',   ring: 'ring-lime-400',   text: 'text-lime-300' },
  { value: 5, emoji: '😊', label: 'Great',  bg: 'bg-green-500/25',  ring: 'ring-green-400',  text: 'text-green-300' },
]

const SLEEP_OPTIONS = [
  { label: '<4h', value: 3.5 },
  { label: '4h',  value: 4 },
  { label: '5h',  value: 5 },
  { label: '6h',  value: 6 },
  { label: '7h',  value: 7 },
  { label: '8h',  value: 8 },
  { label: '9h+', value: 9 },
]

const CRISIS = [
  { name: 'Crisis Services Canada',     number: '1-833-456-4566',        hours: '24/7 · Free' },
  { name: 'Alberta Mental Health Line', number: '1-877-303-2642',        hours: '24/7 · Free' },
  { name: 'Crisis Text Line Canada',    number: 'Text HOME to 686868',   hours: '24/7 · Free' },
  { name: 'Employee Assistance (EAP)', number: 'Check your benefits card', hours: 'Confidential' },
]

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function Wellbeing() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mood, setMood] = useState(null)
  const [sleep, setSleep] = useState(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [showCrisis, setShowCrisis] = useState(false)

  const todayStr = toDateStr(new Date())

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const since = new Date()
    since.setDate(since.getDate() - 30)
    supabase
      .from('wellbeing_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', toDateStr(since))
      .order('date', { ascending: false })
      .then(({ data }) => {
        const all = data || []
        setLogs(all)
        const todayLog = all.find(l => l.date === todayStr)
        if (todayLog) {
          setMood(todayLog.mood)
          setSleep(todayLog.sleep_hours)
          setNote(todayLog.note || '')
          setSaved(true)
        }
        setLogsLoading(false)
      })
  }, [user, todayStr])

  const handleSave = async () => {
    if (!mood) return
    setSaving(true)
    const { error } = await supabase.from('wellbeing_logs').upsert({
      user_id: user.id,
      date: todayStr,
      mood,
      sleep_hours: sleep,
      note: note || null,
    }, { onConflict: 'user_id,date' })
    if (!error) {
      setSaved(true)
      setLogs(prev => {
        const rest = prev.filter(l => l.date !== todayStr)
        return [{ user_id: user.id, date: todayStr, mood, sleep_hours: sleep, note: note || null }, ...rest]
      })
    }
    setSaving(false)
  }

  const last14 = useMemo(() => {
    const days = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const ds = toDateStr(d)
      days.push({
        ds,
        log: logs.find(l => l.date === ds) || null,
        isToday: ds === todayStr,
        label: i === 0 ? '·' : d.toLocaleDateString('en-CA', { weekday: 'short' }).slice(0, 1),
      })
    }
    return days
  }, [logs, todayStr])

  const avgMood = useMemo(() => {
    const w = logs.filter(l => l.mood)
    return w.length ? (w.reduce((s, l) => s + l.mood, 0) / w.length).toFixed(1) : null
  }, [logs])

  const avgSleep = useMemo(() => {
    const w = logs.filter(l => l.sleep_hours)
    return w.length ? (w.reduce((s, l) => s + l.sleep_hours, 0) / w.length).toFixed(1) : null
  }, [logs])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-white/8 px-4 py-3.5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ArrowLeft size={16} className="text-white/60" />
            </Link>
            <img src="/images/logo.svg" alt="ShiftBuddys" className="h-8 w-auto" />
          </div>
          <button onClick={() => setShowCrisis(p => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-heading font-semibold hover:bg-red-500/20 transition-colors">
            <Phone size={13} /> Crisis Line
          </button>
        </div>
      </nav>

      {/* Crisis panel */}
      {showCrisis && (
        <div className="border-b border-red-500/20 bg-red-500/8 px-4 py-5">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={16} className="text-red-400" />
              <p className="font-heading font-bold text-red-300 text-sm">You don&apos;t have to face this alone.</p>
            </div>
            <div className="space-y-1">
              {CRISIS.map(r => (
                <div key={r.name} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <p className="font-body text-white/55 text-sm">{r.name}</p>
                  <div className="text-right">
                    <p className="font-heading font-semibold text-white text-sm">{r.number}</p>
                    <p className="font-body text-white/30 text-xs">{r.hours}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="font-body text-white/25 text-xs mt-4">
              All calls are confidential. Your employer never sees this.
            </p>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 py-7 space-y-5">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Wellbeing</h1>
          <p className="font-body text-white/35 text-sm mt-0.5">5 seconds a day. No judgment.</p>
        </div>

        {/* Daily check-in */}
        <div className="glass rounded-3xl p-6 border border-white/8">
          <p className="font-heading font-semibold text-white text-sm mb-5">
            {saved ? '✅ Check-in saved for today' : 'How are you feeling today?'}
          </p>

          {/* Mood buttons */}
          <div className="flex justify-between gap-1 mb-6">
            {MOODS.map(m => (
              <button key={m.value} onClick={() => { setMood(m.value); setSaved(false) }}
                className={`flex flex-col items-center gap-1.5 flex-1 py-2 rounded-2xl transition-all ${
                  mood === m.value ? `${m.bg} ring-2 ${m.ring} scale-105` : 'hover:bg-white/5'
                }`}>
                <span className="text-3xl leading-none">{m.emoji}</span>
                <span className={`font-heading text-xs font-medium ${mood === m.value ? m.text : 'text-white/25'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          {/* Sleep */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2.5">
              <Moon size={13} className="text-blue-400" />
              <p className="font-heading text-white/50 text-xs uppercase tracking-wider">Hours slept last night</p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {SLEEP_OPTIONS.map(s => (
                <button key={s.label} onClick={() => { setSleep(s.value); setSaved(false) }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-heading font-medium transition-all ${
                    sleep === s.value
                      ? 'bg-blue-500/25 text-blue-300 border border-blue-400/40'
                      : 'bg-white/5 text-white/35 border border-white/8 hover:bg-white/10'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mb-5">
            <p className="font-heading text-white/40 text-xs uppercase tracking-wider mb-2">Anything on your mind? (optional)</p>
            <textarea rows={2} placeholder="Private note — never shared with anyone..."
              value={note} onChange={e => { setNote(e.target.value); setSaved(false) }}
              className="input-field resize-none text-sm" />
          </div>

          <button onClick={handleSave} disabled={!mood || saving}
            className="btn-primary justify-center w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
            {saving ? 'Saving...' : saved ? 'Update Check-in' : 'Save Check-in'}
          </button>
          <p className="font-body text-white/20 text-xs text-center mt-3">
            Private to you. Never shared with your employer.
          </p>
        </div>

        {/* 14-day history strip */}
        {!logsLoading && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-white/40" />
              <p className="font-heading font-semibold text-white text-sm">Last 14 Days</p>
            </div>
            <div className="glass rounded-2xl p-4 border border-white/8">
              <div className="flex gap-1 justify-between">
                {last14.map(({ ds, log, isToday, label }) => {
                  const m = log ? MOODS.find(x => x.value === log.mood) : null
                  return (
                    <div key={ds} className="flex flex-col items-center gap-1 flex-1">
                      <div className={`w-full rounded-lg flex items-center justify-center ${m ? m.bg : 'bg-white/5'} ${isToday ? 'ring-1 ring-white/50' : ''}`}
                        style={{ aspectRatio: '1' }}>
                        {m
                          ? <span className="text-sm leading-none">{m.emoji}</span>
                          : <div className="w-1 h-1 rounded-full bg-white/15" />
                        }
                      </div>
                      <p className={`font-body text-xs ${isToday ? 'text-white/60 font-semibold' : 'text-white/20'}`}>
                        {isToday ? '•' : label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {(avgMood || avgSleep) && (
          <div className="grid grid-cols-2 gap-3">
            {avgMood && (
              <div className="glass rounded-2xl p-4 border border-white/8 text-center">
                <p className="font-display text-5xl text-white leading-none mb-1">{avgMood}</p>
                <p className="font-heading text-white/40 text-xs uppercase tracking-wider">Avg Mood</p>
                <p className="font-body text-white/20 text-xs mt-1">Last 30 days</p>
              </div>
            )}
            {avgSleep && (
              <div className="glass rounded-2xl p-4 border border-white/8 text-center">
                <p className="font-display text-5xl text-white leading-none mb-1">
                  {avgSleep}<span className="text-2xl text-white/40">h</span>
                </p>
                <p className="font-heading text-white/40 text-xs uppercase tracking-wider">Avg Sleep</p>
                <p className="font-body text-white/20 text-xs mt-1">Last 30 days</p>
              </div>
            )}
          </div>
        )}

        {/* You're not alone */}
        <div className="glass rounded-2xl p-5 border border-white/8">
          <p className="font-heading font-semibold text-white text-sm mb-4">💙 You&apos;re not alone</p>
          <div className="space-y-3">
            {[
              '"Day 11 always hits different. Push through — home stretch."',
              '"Track your sleep. When mine dips below 6h for 3 days straight, I know to slow down."',
              '"Talking to someone changed everything. EAP is free and confidential."',
            ].map((q, i) => (
              <p key={i} className="font-body text-white/45 text-sm italic leading-relaxed border-l-2 border-white/10 pl-3">
                {q}
              </p>
            ))}
          </div>
          <p className="font-body text-white/20 text-xs mt-4">Anonymous insights from rotation workers.</p>
        </div>

        {/* Persistent crisis button */}
        <button
          onClick={() => { setShowCrisis(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          className="w-full rounded-2xl p-4 border border-red-500/25 bg-red-500/8 flex items-center justify-center gap-3 hover:bg-red-500/15 transition-colors">
          <Phone size={16} className="text-red-400" />
          <span className="font-heading font-semibold text-red-300 text-sm">
            Crisis &amp; Mental Health Support Numbers
          </span>
        </button>

        <div className="h-4" />
      </main>
    </div>
  )
}
