import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard')
  }, [user, loading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      router.push('/dashboard')
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/images/logo.svg" alt="ShiftBuddys" className="h-10 w-auto mx-auto mb-6" />
          </Link>
          <h1 className="font-heading font-bold text-white text-3xl mb-2">Welcome back</h1>
          <p className="font-body text-white/50 text-sm">Sign in to your ShiftBuddys account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 border border-white/8 flex flex-col gap-5">
          <div>
            <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                required type="email" placeholder="you@email.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                required type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="input-field pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <p className="font-body text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary justify-center">
            {submitting ? 'Signing in...' : (<>Sign In <ArrowRight size={16} /></>)}
          </button>
        </form>

        <p className="text-center font-body text-white/40 text-sm mt-6">
          New to ShiftBuddys?{' '}
          <Link href="/signup" className="text-orange-400 hover:text-orange-300 transition-colors">Create a free account</Link>
        </p>
      </div>
    </div>
  )
}
