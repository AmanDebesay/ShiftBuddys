import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const STREAMING = [
  { label: 'Netflix',      icon: '🎬', url: 'https://www.netflix.com',         color: 'border-red-500/30 hover:border-red-500/50',     iconBg: 'bg-red-500/15' },
  { label: 'Prime Video',  icon: '📦', url: 'https://www.primevideo.com',       color: 'border-blue-400/30 hover:border-blue-400/50',   iconBg: 'bg-blue-500/15' },
  { label: 'Disney+',      icon: '✨', url: 'https://www.disneyplus.com',       color: 'border-indigo-400/30 hover:border-indigo-400/50',iconBg: 'bg-indigo-500/15' },
  { label: 'Crave',        icon: '🍁', url: 'https://www.crave.ca',             color: 'border-purple-400/30 hover:border-purple-400/50',iconBg: 'bg-purple-500/15' },
  { label: 'YouTube',      icon: '▶️', url: 'https://www.youtube.com',          color: 'border-red-400/30 hover:border-red-400/50',     iconBg: 'bg-red-500/15' },
  { label: 'Spotify',      icon: '🎵', url: 'https://open.spotify.com',         color: 'border-green-400/30 hover:border-green-400/50', iconBg: 'bg-green-500/15' },
  { label: 'Apple Music',  icon: '🎶', url: 'https://music.apple.com',          color: 'border-pink-400/30 hover:border-pink-400/50',   iconBg: 'bg-pink-500/15' },
  { label: 'Audible',      icon: '🎧', url: 'https://www.audible.ca',           color: 'border-orange-400/30 hover:border-orange-400/50',iconBg: 'bg-orange-500/15' },
]

const PODCASTS = [
  {
    category: '😂 Comedy & Chill',
    color: 'text-yellow-300',
    shows: [
      { name: 'Trailer Park Boys Podcasts',  desc: 'The boys keep it real. Camp-approved.' },
      { name: 'SmartLess',                   desc: 'Jason Bateman, Sean Hayes, Will Arnett — celebrity interviews + comedy.' },
      { name: 'Comedy Bang Bang',            desc: 'Improv comedy. Good for long commutes.' },
      { name: 'My Brother, My Brother and Me', desc: 'Advice for the modern era. Hilarious.' },
    ],
  },
  {
    category: '💰 Money & Trades',
    color: 'text-green-300',
    shows: [
      { name: 'The Blueprint (MoneySense)',  desc: 'Canadian personal finance. RRSP, mortgages, investing.' },
      { name: 'Millennial Money Canada',     desc: 'Real talk about building wealth as a Canadian.' },
      { name: 'SkillsCast — Trades & Tech',  desc: 'For skilled trades workers — career, safety, business.' },
      { name: 'The Canadian Investor',       desc: 'Stocks, ETFs, and long-term investing from Canada.' },
    ],
  },
  {
    category: '🧠 Mind & Wellbeing',
    color: 'text-blue-300',
    shows: [
      { name: 'The Huberman Lab',            desc: 'Science-backed sleep, focus, and health protocols.' },
      { name: 'Feel Better Live More',       desc: 'Dr. Rangan Chatterjee on mental and physical health.' },
      { name: 'Unlocking Us (Brené Brown)',  desc: 'Vulnerability, courage, and real human stuff.' },
      { name: 'Ten Percent Happier',         desc: 'Meditation for skeptics. Great for shift workers.' },
    ],
  },
  {
    category: '🔧 Oilsands & Industry',
    color: 'text-orange-300',
    shows: [
      { name: 'The Oil Sands Magazine Pod',  desc: 'Industry news, tech, and Alberta energy.' },
      { name: 'Energy vs Climate',           desc: 'Balanced takes on energy transition and oilsands future.' },
      { name: 'The Roughneck Hour',          desc: 'For the patch — stories from the field.' },
      { name: 'Mining Stock Daily',          desc: 'Mining and resource sector news from Canada.' },
    ],
  },
  {
    category: '🎙️ True Crime & Stories',
    color: 'text-rose-300',
    shows: [
      { name: 'Casefile True Crime',         desc: 'Serious, well-researched. Good for night shift.' },
      { name: 'Hardcore History (Dan Carlin)', desc: 'Epic deep-dives into history. Hours of content.' },
      { name: 'Conan O\'Brien Needs a Friend', desc: "Comedy gold. Perfect camp-life listen." },
      { name: 'Crime Junkie',                desc: 'Weekly true crime. Short and sharp.' },
    ],
  },
]

const FORT_MAC = [
  { emoji: '🎬', label: 'Landmark Cinemas YMM',     sub: '5-screen cinema, Fort McMurray',         url: 'https://www.landmarkcinemas.com/theatres/landmark-cinemas-fort-mcmurray' },
  { emoji: '🍕', label: 'Boston Pizza Fort Mac',     sub: 'Games, food, drinks',                    url: 'https://www.bostonpizza.com' },
  { emoji: '🎳', label: 'Oil Sands Bowling',         sub: 'Bowling, arcade, Fort McMurray',         url: 'https://www.facebook.com/oilsandsbowling' },
  { emoji: '🏊', label: 'MacDonald Island Park',     sub: 'Aquatics, gym, trails, arena',           url: 'https://macdonaldisland.ca' },
  { emoji: '🥩', label: 'Borealis Grille & Bar',     sub: 'Best steak in Fort Mac',                 url: 'https://www.borealisgrille.com' },
  { emoji: '🧗', label: 'Syncrude Athletic Park',    sub: 'Ice, turf, fitness',                     url: 'https://syncrude-athletic-park.com' },
  { emoji: '🛒', label: 'Walmart Supercentre YMM',   sub: 'Groceries, gear, everything',            url: 'https://www.walmart.ca' },
  { emoji: '🌲', label: 'Fort McMurray Trails',      sub: 'Clearwater Trail system — hiking/biking', url: 'https://www.trailforks.com/region/fort-mcmurray/' },
]

const CAMP_GAMES = [
  { emoji: '📱', label: 'Alto\'s Odyssey',           sub: 'Chill endless runner. Offline-friendly.' },
  { emoji: '♟️', label: 'Chess.com',                  sub: 'Play vs AI or friends. Great offline.' },
  { emoji: '🃏', label: 'Balatro',                    sub: 'Poker roguelike. Addictive. Best $15 ever.' },
  { emoji: '🧩', label: 'Monument Valley',            sub: 'Beautiful puzzle game. Zero stress.' },
  { emoji: '🗺️', label: 'Civilization VI',            sub: '"One more turn" will destroy your sleep.' },
  { emoji: '🎯', label: 'Mini Metro',                 sub: 'Subway layout puzzle. Oddly satisfying.' },
  { emoji: '🌙', label: 'Stardew Valley',             sub: 'Farm sim. Wildly relaxing for night shift.' },
  { emoji: '🔤', label: 'Wordle / Connections',       sub: 'NYT Games. 5-min daily brain warm-up.' },
]

const TABS = ['Stream', 'Podcasts', 'Fort Mac', 'Camp Games']

export default function Entertainment() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState('Stream')

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

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

      <main className="max-w-lg mx-auto px-4 py-7">
        <div className="mb-6">
          <h1 className="font-heading font-bold text-white text-2xl">Entertainment</h1>
          <p className="font-body text-white/35 text-sm mt-0.5">Camp life, home life — something for every hour off</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all ${
                tab === t
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'bg-white/5 text-white/35 border border-white/8 hover:bg-white/10 hover:text-white/60'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Stream tab */}
        {tab === 'Stream' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2.5">
              {STREAMING.map(({ label, icon, url, color, iconBg }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                  className={`glass rounded-2xl p-4 border ${color} transition-all flex items-center gap-3 group`}>
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 text-xl`}>
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading font-semibold text-white text-sm">{label}</p>
                    <ExternalLink size={11} className="text-white/20 mt-0.5 group-hover:text-white/40 transition-colors" />
                  </div>
                </a>
              ))}
            </div>

            <div className="glass rounded-2xl p-5 border border-white/8">
              <p className="font-heading font-semibold text-white text-sm mb-3">📺 What Workers Are Watching</p>
              <div className="space-y-2.5">
                {[
                  { title: 'Yellowstone',     note: 'Camp favourite. All seasons on Crave.' },
                  { title: 'Clarkson\'s Farm', note: 'Surprisingly relatable for trades folks.' },
                  { title: 'Letterkenny',      note: "Canadian. If you haven't seen it — start now." },
                  { title: 'The Bear',         note: 'Stressful but brilliant. Short episodes.' },
                  { title: 'Shoresy',          note: "Letterkenny spinoff. Proudly Canadian." },
                  { title: 'Suits',            note: 'Easy watch, great for background.' },
                  { title: 'Band of Brothers', note: 'Night shift essential. 10-episode masterpiece.' },
                  { title: 'Trailer Park Boys',note: "East coast chaos. Timeless Canadian comedy." },
                ].map(({ title, note }) => (
                  <div key={title} className="flex items-start gap-3 border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0 mt-2" />
                    <div>
                      <p className="font-heading font-semibold text-white text-sm">{title}</p>
                      <p className="font-body text-white/35 text-xs mt-0.5">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Podcasts tab */}
        {tab === 'Podcasts' && (
          <div className="space-y-4">
            {PODCASTS.map(section => (
              <div key={section.category} className="glass rounded-2xl p-5 border border-white/8">
                <p className={`font-heading font-semibold text-sm mb-4 ${section.color}`}>{section.category}</p>
                <div className="space-y-3">
                  {section.shows.map(show => (
                    <div key={show.name} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0 mt-2" />
                      <div>
                        <p className="font-heading font-semibold text-white text-sm">{show.name}</p>
                        <p className="font-body text-white/35 text-xs mt-0.5">{show.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="font-body text-white/20 text-xs text-center pb-2">Search any of these on Spotify, Apple Podcasts, or YouTube</p>
          </div>
        )}

        {/* Fort Mac tab */}
        {tab === 'Fort Mac' && (
          <div className="space-y-4">
            <p className="font-body text-white/35 text-sm">Things to do when you&apos;re home in Fort McMurray</p>
            <div className="space-y-2">
              {FORT_MAC.map(({ emoji, label, sub, url }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                  className="glass rounded-xl px-4 py-3.5 border border-white/8 hover:border-white/20 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl leading-none w-8 text-center">{emoji}</span>
                    <div>
                      <p className="font-heading font-semibold text-white text-sm">{label}</p>
                      <p className="font-body text-white/30 text-xs mt-0.5">{sub}</p>
                    </div>
                  </div>
                  <ExternalLink size={13} className="text-white/20 flex-shrink-0 group-hover:text-white/50 transition-colors" />
                </a>
              ))}
            </div>
            <div className="glass rounded-2xl p-5 border border-white/8 text-center">
              <p className="text-2xl mb-2">🌄</p>
              <p className="font-heading font-semibold text-white text-sm">Outdoors in YMM</p>
              <p className="font-body text-white/35 text-sm mt-1 leading-relaxed">
                The Clearwater Trail system has 30+ km of hiking and biking. The Athabasca River walk is great year-round. Gregoire Lake is 45 min south — worth it in summer.
              </p>
            </div>
          </div>
        )}

        {/* Camp Games tab */}
        {tab === 'Camp Games' && (
          <div className="space-y-4">
            <p className="font-body text-white/35 text-sm">No WiFi? No problem. Good picks for slow camp internet or offline play.</p>
            <div className="grid grid-cols-2 gap-2.5">
              {CAMP_GAMES.map(({ emoji, label, sub }) => (
                <div key={label} className="glass rounded-2xl p-4 border border-white/8">
                  <span className="text-2xl leading-none block mb-2">{emoji}</span>
                  <p className="font-heading font-semibold text-white text-sm">{label}</p>
                  <p className="font-body text-white/30 text-xs mt-1 leading-snug">{sub}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-5 border border-white/8">
              <p className="font-heading font-semibold text-white text-sm mb-3">🃏 Card & Board Games for the Lounge</p>
              <div className="space-y-2">
                {[
                  'Cribbage — Canadian classic, 2–4 players',
                  'Euchre — oilsands standard',
                  'Sequence — easy to learn, hard to put down',
                  'Uno — always in the lounge somewhere',
                  'Poker nights — check if your camp allows it',
                ].map(g => (
                  <div key={g} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0" />
                    <p className="font-body text-white/50 text-sm">{g}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/8">
              <p className="font-heading font-semibold text-white text-sm mb-2">📚 Audiobooks for Camp</p>
              <p className="font-body text-white/35 text-sm mb-3">Great on Audible or free via your local library on Libby</p>
              {[
                { title: 'Can\'t Hurt Me — David Goggins',    note: 'Mental toughness. Rotation workers love it.' },
                { title: 'Rich Dad Poor Dad',                  note: 'Classic money mindset shift.' },
                { title: 'The Obstacle is the Way',            note: 'Stoicism. Short, practical, powerful.' },
                { title: 'Spare (Prince Harry)',               note: 'Wildly addictive on long drives.' },
                { title: 'Born to Run',                        note: 'Best running/human potential book ever written.' },
              ].map(b => (
                <div key={b.title} className="border-b border-white/5 pb-2.5 mb-2.5 last:border-0 last:mb-0 last:pb-0">
                  <p className="font-heading font-semibold text-white text-sm">{b.title}</p>
                  <p className="font-body text-white/30 text-xs mt-0.5">{b.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-6" />
      </main>
    </div>
  )
}
