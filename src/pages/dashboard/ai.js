import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft, Send, Bot, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { getRotationStatus } from '../../lib/rotationUtils'

const STARTERS = [
  'When do I go home?',
  'What should I pack for camp?',
  'How does Alberta overtime work?',
  'Tips for staying connected with family on shift?',
  'How much RRSP room do I have?',
  'What\'s coming home mode about?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot size={14} className="text-orange-400" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-orange-500/20 border border-orange-500/25 text-white font-body text-sm'
          : 'glass border border-white/8 text-white/80 font-body text-sm leading-relaxed'
      }`}>
        {msg.content}
      </div>
    </div>
  )
}

export default function AIChat() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  const buildContext = () => {
    if (!profile) return {}
    const status = getRotationStatus(profile.rotation_start_date, profile.rotation_pattern)
    return {
      name: profile.name || user?.user_metadata?.name || user?.email?.split('@')[0],
      rotation_pattern: profile.rotation_pattern,
      phase: status?.phase,
      daysRemaining: status?.daysRemaining,
      dayNumber: status?.dayNumber,
      totalDays: status?.totalDays,
    }
  }

  const sendMessage = async (text) => {
    const content = text || input.trim()
    if (!content) return
    setInput('')
    const newMessages = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setThinking(true)
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context: buildContext() }),
      })
      const data = await res.json()
      if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Try again.' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Could not connect. Check your connection and try again.' }])
    }
    setThinking(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  if (loading || !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-white/8 px-4 py-3.5 flex-shrink-0">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ArrowLeft size={16} className="text-white/60" />
            </Link>
            <img src="/images/logo.svg" alt="ShiftBuddys" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Sparkles size={12} className="text-orange-400" />
            <span className="font-heading text-orange-300 text-xs font-semibold">AI Assistant</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-4 min-h-0">
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center mx-auto mb-4">
                <Bot size={24} className="text-orange-400" />
              </div>
              <h1 className="font-heading font-bold text-white text-xl">ShiftBuddy AI</h1>
              <p className="font-body text-white/35 text-sm mt-1">Ask me anything about your rotation, pay, Fort Mac, or camp life.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STARTERS.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="glass rounded-xl p-3 border border-white/8 hover:border-orange-500/30 transition-all text-left">
                  <p className="font-body text-white/50 text-xs leading-snug">{s}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message thread */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1" style={{ scrollbarWidth: 'none' }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {thinking && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-orange-400" />
                </div>
                <div className="glass rounded-2xl px-4 py-3 border border-white/8 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className="flex-shrink-0 pt-3 pb-2">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Ask anything about your rotation…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-field flex-1 resize-none text-sm py-2.5"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <button onClick={() => sendMessage()}
              disabled={!input.trim() || thinking}
              className="w-11 h-11 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0">
              <Send size={16} className="text-white" />
            </button>
          </div>
          <p className="font-body text-white/15 text-xs text-center mt-2">
            AI can make mistakes. For serious health/legal/financial matters, consult a professional.
          </p>
        </div>
      </main>
    </div>
  )
}
