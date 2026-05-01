import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard')
  }, [user, loading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setSubmitting(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } },
    })
    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else if (data?.session) {
      router.push('/onboarding')
    } else {
      setCheckEmail(true)
    }
  }

  if (loading) return null

  if (checkEmail) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-5">
          <Check size={28} className="text-green-400" />
        </div>
        <h1 className="font-heading font-bold text-white text-2xl mb-3">Check your email</h1>
        <p className="font-body text-white/50 text-sm leading-relaxed mb-6">
          We sent a confirmation link to <span className="text-white">{form.email}</span>.<br />
          Click it to activate your account, then come back and sign in.
        </p>
        <Link href="/login" className="btn-primary justify-center">
          Go to Login <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/images/logo.svg" alt="ShiftBuddys" className="h-10 w-auto mx-auto mb-6" />
          </Link>
          <h1 className="font-heading font-bold text-white text-3xl mb-2">Create your account</h1>
          <p className="font-body text-white/50 text-sm">Join workers across Fort McMurray</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 border border-white/8 flex flex-col gap-5">
          <div>
            <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Your Name</label>
            <input required type="text" placeholder="Marcus Thompson"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="input-field" />
          </div>
          <div>
            <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Email</label>
            <input required type="email" placeholder="you@email.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="input-field" />
          </div>
          <div>
            <label className="block font-heading text-white/60 text-xs uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input required type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="input-field pr-10" />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <p className="font-body text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary justify-center">
            {submitting ? 'Creating account...' : (<>Create Account <ArrowRight size={16} /></>)}
          </button>
          <p className="font-body text-white/30 text-xs text-center">
            By signing up you agree to our{' '}
            <Link href="/terms" className="underline hover:text-white/50 transition-colors">Terms</Link> and{' '}
            <Link href="/privacy" className="underline hover:text-white/50 transition-colors">Privacy Policy</Link>.
          </p>
        </form>

        <p className="text-center font-body text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-400 hover:text-orange-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
