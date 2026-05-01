import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft, Wind, Droplets, Thermometer, ExternalLink, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const WMO = {
  0:  { label: 'Clear sky',      emoji: '☀️' },
  1:  { label: 'Mainly clear',   emoji: '🌤️' },
  2:  { label: 'Partly cloudy',  emoji: '⛅' },
  3:  { label: 'Overcast',       emoji: '☁️' },
  45: { label: 'Fog',            emoji: '🌫️' },
  48: { label: 'Freezing fog',   emoji: '🌫️' },
  51: { label: 'Light drizzle',  emoji: '🌦️' },
  53: { label: 'Drizzle',        emoji: '🌦️' },
  55: { label: 'Heavy drizzle',  emoji: '🌧️' },
  61: { label: 'Light rain',     emoji: '🌧️' },
  63: { label: 'Rain',           emoji: '🌧️' },
  65: { label: 'Heavy rain',     emoji: '🌧️' },
  71: { label: 'Light snow',     emoji: '🌨️' },
  73: { label: 'Snow',           emoji: '❄️' },
  75: { label: 'Heavy snow',     emoji: '❄️' },
  77: { label: 'Snow grains',    emoji: '🌨️' },
  80: { label: 'Showers',        emoji: '🌦️' },
  81: { label: 'Showers',        emoji: '🌧️' },
  82: { label: 'Heavy showers',  emoji: '⛈️' },
  85: { label: 'Snow showers',   emoji: '🌨️' },
  86: { label: 'Heavy snow',     emoji: '❄️' },
  95: { label: 'Thunderstorm',   emoji: '⛈️' },
  96: { label: 'Thunderstorm',   emoji: '⛈️' },
  99: { label: 'Thunderstorm',   emoji: '⛈️' },
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Local social / community links (no API needed)
const SOCIAL_LINKS = [
  { label: 'Fort McMurray Today',        icon: '📰', url: 'https://www.fortmcmurraytoday.com', color: 'text-orange-400' },
  { label: 'RMWB Official',              icon: '🏛️', url: 'https://www.rmwb.ca', color: 'text-blue-400' },
  { label: 'Play 103.7 (Fort Mac Radio)',icon: '📻', url: 'https://www.play103.ca', color: 'text-purple-400' },
  { label: 'r/FortMcMurray',             icon: '💬', url: 'https://www.reddit.com/r/FortMcMurray/', color: 'text-orange-300' },
  { label: 'YMM Community (Facebook)',   icon: '👥', url: 'https://www.facebook.com/groups/161094274568575/', color: 'text-blue-300' },
  { label: 'Mac City Morning Show',      icon: '▶️', url: 'https://www.youtube.com/@maccitymorningshow', color: 'text-red-400' },
  { label: 'CBC Fort McMurray',          icon: '📺', url: 'https://www.cbc.ca/news/canada/edmonton', color: 'text-green-400' },
  { label: 'Alberta Emergency Alerts',  icon: '🚨', url: 'https://www.alberta.ca/emergency-alerts', color: 'text-red-300' },
]

function Spinner() {
  return <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
}

export default function FortMacLife() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [weather, setWeather] = useState(null)
  const [news, setNews] = useState(null)
  const [weatherErr, setWeatherErr] = useState(false)
  const [newsErr, setNewsErr] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  // Live Fort McMurray time (Mountain timezone)
  useEffect(() => {
    const tick = () => setCurrentTime(
      new Date().toLocaleTimeString('en-CA', {
        timeZone: 'America/Edmonton',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
      })
    )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!user) return
    fetch('/api/weather').then(r => r.json()).then(setWeather).catch(() => setWeatherErr(true))
    fetch('/api/news').then(r => r.json()).then(setNews).catch(() => setNewsErr(true))
  }, [user])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  )

  const cur = weather?.current
  const wmo = WMO[cur?.weather_code] ?? { label: 'Unknown', emoji: '🌡️' }

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

      <main className="max-w-lg mx-auto px-4 py-7 space-y-5">
        {/* Header with live time */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading font-bold text-white text-2xl">Fort Mac Life</h1>
            <p className="font-body text-white/35 text-sm mt-0.5">Fort McMurray, Alberta · Wood Buffalo</p>
          </div>
          {currentTime && (
            <div className="glass rounded-2xl px-4 py-2.5 border border-white/8 text-right">
              <div className="flex items-center gap-1.5 justify-end mb-0.5">
                <Clock size={11} className="text-orange-400" />
                <p className="font-body text-white/35 text-xs uppercase tracking-wider">Local Time</p>
              </div>
              <p className="font-heading font-bold text-white text-lg leading-none">{currentTime}</p>
              <p className="font-body text-white/25 text-xs mt-0.5">Mountain Time</p>
            </div>
          )}
        </div>

        {/* Current weather */}
        {!weather && !weatherErr && (
          <div className="glass rounded-3xl p-8 border border-white/8 flex justify-center"><Spinner /></div>
        )}
        {weatherErr && (
          <div className="glass rounded-3xl p-7 border border-white/8 text-center">
            <p className="font-body text-white/40 text-sm">Weather unavailable right now.</p>
          </div>
        )}
        {weather && cur && (
          <>
            <div className="glass rounded-3xl p-6 border border-white/8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-5xl mb-3 leading-none">{wmo.emoji}</p>
                  <p className="font-display text-8xl text-white leading-none">{Math.round(cur.temperature_2m)}°</p>
                  <p className="font-heading font-semibold text-white/55 text-base mt-2">{wmo.label}</p>
                  <p className="font-body text-white/25 text-xs mt-1">
                    {new Date().toLocaleDateString('en-CA', {
                      timeZone: 'America/Edmonton',
                      weekday: 'long', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="space-y-3 mt-1">
                  <div className="flex items-center gap-2">
                    <Thermometer size={14} className="text-white/30" />
                    <span className="font-body text-white/50 text-sm">Feels {Math.round(cur.apparent_temperature)}°C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind size={14} className="text-white/30" />
                    <span className="font-body text-white/50 text-sm">{Math.round(cur.wind_speed_10m)} km/h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets size={14} className="text-white/30" />
                    <span className="font-body text-white/50 text-sm">{cur.relative_humidity_2m}% humidity</span>
                  </div>
                </div>
              </div>
              <p className="font-body text-white/20 text-xs mt-4">
                📡 Live data · Environment Canada area stations (56.73°N 111.38°W)
              </p>
            </div>

            {/* 7-day forecast */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {weather.daily.time.map((date, i) => {
                const dayWmo = WMO[weather.daily.weather_code[i]] ?? { emoji: '🌡️' }
                const d = new Date(date + 'T12:00:00')
                const isToday = i === 0
                const hasPrecip = weather.daily.precipitation_sum[i] > 0
                return (
                  <div key={date}
                    className={`flex-shrink-0 rounded-2xl p-3.5 border text-center w-[76px] ${
                      isToday ? 'bg-orange-500/15 border-orange-500/40' : 'glass border-white/8'
                    }`}>
                    <p className={`font-heading text-xs font-semibold mb-2 ${isToday ? 'text-orange-400' : 'text-white/40'}`}>
                      {isToday ? 'Today' : WEEKDAYS[d.getDay()]}
                    </p>
                    <p className="text-xl mb-2">{dayWmo.emoji}</p>
                    <p className="font-heading font-bold text-white text-sm">{Math.round(weather.daily.temperature_2m_max[i])}°</p>
                    <p className="font-body text-white/30 text-xs">{Math.round(weather.daily.temperature_2m_min[i])}°</p>
                    {hasPrecip && (
                      <p className="font-body text-blue-400 text-xs mt-1.5">{weather.daily.precipitation_sum[i]}mm</p>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* News */}
        <div>
          <h2 className="font-heading font-bold text-white text-xl mb-4">Local News</h2>
          {!news && !newsErr && (
            <div className="glass rounded-2xl p-6 border border-white/8 flex justify-center"><Spinner /></div>
          )}
          {newsErr && (
            <div className="glass rounded-2xl p-5 border border-white/8 text-center">
              <p className="font-body text-white/40 text-sm">Could not load news feeds.</p>
            </div>
          )}
          {news?.feeds?.length === 0 && (
            <div className="glass rounded-2xl p-5 border border-white/8 text-center">
              <p className="font-body text-white/40 text-sm">No news available right now.</p>
            </div>
          )}
          {news?.feeds?.map(feed => (
            <div key={feed.name} className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <p className="font-heading font-semibold text-orange-400 text-xs uppercase tracking-wider">{feed.name}</p>
              </div>
              <div className="flex flex-col gap-2">
                {feed.items.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                    className="glass rounded-xl p-4 border border-white/8 hover:border-orange-500/30 transition-all flex items-start justify-between gap-3 group">
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-medium text-white text-sm leading-snug line-clamp-2 group-hover:text-orange-200 transition-colors">
                        {item.title}
                      </p>
                      {item.pubDate && (
                        <p className="font-body text-white/25 text-xs mt-1.5">
                          {new Date(item.pubDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <ExternalLink size={13} className="text-white/20 flex-shrink-0 mt-0.5 group-hover:text-orange-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Social & Community */}
        <div>
          <h2 className="font-heading font-bold text-white text-xl mb-4">Social &amp; Community</h2>
          <div className="grid grid-cols-2 gap-2">
            {SOCIAL_LINKS.map(({ label, icon, url, color }) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                className="glass rounded-xl p-3.5 border border-white/8 hover:border-white/20 transition-all flex items-center gap-2.5 group">
                <span className="text-lg leading-none">{icon}</span>
                <p className={`font-heading font-medium text-xs leading-snug ${color} group-hover:opacity-80 transition-opacity`}>
                  {label}
                </p>
              </a>
            ))}
          </div>
        </div>

        <p className="font-body text-white/15 text-xs text-center pb-4">
          Weather via Open-Meteo (Environment Canada NWP) · News via RSS feeds
        </p>
      </main>
    </div>
  )
}
