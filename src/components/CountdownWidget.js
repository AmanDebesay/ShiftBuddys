import { useState, useEffect } from 'react'

function Block({ value, label }) {
  return (
    <div className="countdown-block">
      <span className="font-display text-4xl text-orange-400 leading-none animate-count-pulse">
        {String(value).padStart(2, '0')}
      </span>
      <span className="font-body text-white/50 text-xs uppercase tracking-widest mt-1">{label}</span>
    </div>
  )
}

export default function CountdownWidget({ targetDays = 9 }) {
  // Demo: count down from targetDays * 24 hours
  const [timeLeft, setTimeLeft] = useState({
    days: targetDays,
    hours: 14,
    minutes: 32,
    seconds: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev
        seconds -= 1
        if (seconds < 0) { seconds = 59; minutes -= 1 }
        if (minutes < 0) { minutes = 59; hours -= 1 }
        if (hours < 0) { hours = 23; days -= 1 }
        if (days < 0) return prev
        return { days, hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass rounded-2xl p-6 border border-white/10 shadow-2xl shadow-navy-900/80">
      <div className="text-center mb-4">
        <p className="font-heading text-white/60 text-xs uppercase tracking-widest">Home in</p>
      </div>
      <div className="flex items-center gap-1.5">
        <Block value={timeLeft.days} label="Days" />
        <span className="font-display text-2xl text-orange-500/60 mb-2">:</span>
        <Block value={timeLeft.hours} label="Hrs" />
        <span className="font-display text-2xl text-orange-500/60 mb-2">:</span>
        <Block value={timeLeft.minutes} label="Min" />
        <span className="font-display text-2xl text-orange-500/60 mb-2">:</span>
        <Block value={timeLeft.seconds} label="Sec" />
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <div>
          <p className="font-heading text-white/80 text-xs font-medium">Today</p>
          <p className="font-body text-white/40 text-xs">Day shift — 7am to 7pm</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
          <span className="text-orange-400 text-xs font-heading font-medium">On rotation</span>
        </div>
      </div>
    </div>
  )
}
