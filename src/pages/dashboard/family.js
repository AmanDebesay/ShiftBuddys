import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, RefreshCw, Users, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function FamilySync() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [inviteCode, setInviteCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        if (!data) return
        setProfile(data)
        if (data.invite_code) setInviteCode(data.invite_code)
      })
  }, [user])

  const handleGenerate = async () => {
    setGenerating(true)
    const code = generateCode()
    const { error } = await supabase.from('profiles').update({ invite_code: code }).eq('id', user.id)
    if (!error) {
      setInviteCode(code)
      setProfile(prev => ({ ...prev, invite_code: code }))
    }
    setGenerating(false)
  }

  const shareUrl = inviteCode ? `${typeof window !== 'undefined' ? window.location.origin : 'https://shiftbuddys.ca'}/family/${inviteCode}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading || !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const firstName = (profile.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Worker').split(' ')[0]

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

      <main className="max-w-lg mx-auto px-4 py-7 space-y-5">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Family Sync</h1>
          <p className="font-body text-white/35 text-sm mt-0.5">Share your rotation so your family always knows when you're coming home</p>
        </div>

        {/* Explainer */}
        <div className="glass rounded-2xl p-5 border border-pink-500/20">
          <div className="flex items-start gap-3">
            <Users size={18} className="text-pink-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-heading font-semibold text-white text-sm mb-1">How it works</p>
              <p className="font-body text-white/45 text-sm leading-relaxed">
                Generate your personal invite link. Send it to your partner, parents, or anyone who needs to know your schedule.
                They open it on their phone — no account needed — and see your rotation status in real time.
              </p>
            </div>
          </div>
        </div>

        {/* Code generator */}
        <div className="glass rounded-3xl p-6 border border-white/8 space-y-5">
          {!inviteCode ? (
            <>
              <p className="font-heading font-semibold text-white text-sm">No link yet</p>
              <p className="font-body text-white/35 text-sm">Generate a private link to share your rotation with family.</p>
              <button onClick={handleGenerate} disabled={generating}
                className="btn-primary justify-center w-full disabled:opacity-40">
                {generating ? 'Generating...' : 'Generate My Family Link'}
              </button>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="font-heading text-white/30 text-xs uppercase tracking-wider mb-2">Your invite code</p>
                <p className="font-display text-5xl text-white tracking-widest leading-none">{inviteCode}</p>
              </div>

              <div className="space-y-2.5">
                <p className="font-heading text-white/30 text-xs uppercase tracking-wider">Share this link</p>
                <div className="flex gap-2">
                  <div className="flex-1 glass rounded-xl px-3 py-2.5 border border-white/8 min-w-0">
                    <p className="font-body text-white/50 text-xs truncate">{shareUrl}</p>
                  </div>
                  <button onClick={handleCopy}
                    className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                      copied ? 'bg-green-500/20 border-green-500/40' : 'bg-white/5 border-white/8 hover:bg-white/10'
                    }`}>
                    {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} className="text-white/50" />}
                  </button>
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 flex items-center justify-center transition-colors">
                    <ExternalLink size={14} className="text-white/50" />
                  </a>
                </div>
                {copied && <p className="font-body text-green-400 text-xs">Link copied to clipboard!</p>}
              </div>

              {/* Preview of what they'll see */}
              <div className="rounded-2xl p-4 border border-white/8 bg-white/3">
                <p className="font-heading text-white/30 text-xs uppercase tracking-wider mb-3">What your family sees</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    profile.rotation_pattern ? 'bg-orange-500/20' : 'bg-white/10'
                  }`}>👷</div>
                  <div>
                    <p className="font-heading font-semibold text-white text-sm">{firstName}'s Rotation</p>
                    <p className="font-body text-white/35 text-xs">{profile.rotation_pattern} rotation · Live status</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={handleGenerate} disabled={generating}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-white/35 text-xs font-heading font-medium hover:bg-white/10 transition-colors disabled:opacity-40">
                  <RefreshCw size={12} />
                  New code
                </button>
                <p className="font-body text-white/20 text-xs self-center">Regenerating invalidates the old link.</p>
              </div>
            </>
          )}
        </div>

        {/* Privacy note */}
        <div className="glass rounded-2xl px-5 py-4 border border-white/8">
          <p className="font-heading font-semibold text-white text-sm mb-1.5">🔒 Privacy</p>
          <p className="font-body text-white/40 text-sm leading-relaxed">
            Your link only shows your name, rotation pattern, and current phase (on shift / at home + countdown).
            No personal details, wellbeing data, or location are shared.
          </p>
        </div>

        <div className="h-4" />
      </main>
    </div>
  )
}
