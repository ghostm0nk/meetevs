import { useState, useRef, useEffect } from 'react'
import { Mail, Lock, LogIn } from 'lucide-react'
import supabase from '../lib/supabase'

export default function LoginPage({ onNavigate }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    // Mesh gradient animation background
    if (containerRef.current) {
      const canvas = document.createElement('div')
      canvas.className = 'fixed inset-0 -z-10'
      canvas.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-900"></div>
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style="animation-delay: 2s"></div>
        <div class="absolute top-1/2 right-0 w-80 h-80 bg-violet-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style="animation-delay: 4s"></div>
      `
      document.body.appendChild(canvas)
      return () => canvas.remove()
    }
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        // Sign up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (authError) throw new Error(authError.message)

        // Create user profile
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: authData.user.id,
                email: authData.user.email,
                full_name: fullName || email.split('@')[0],
              },
            ])

          if (profileError) throw new Error(profileError.message)
        }

        setError('')
        setEmail('')
        setPassword('')
        setFullName('')
        setIsSignUp(false)
        alert('Sign up successful! Please log in.')
      } else {
        // Sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw new Error(signInError.message)

        // Navigation will happen in App.jsx via auth state change
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-md">
        {/* Animated background blob */}
        <div className="absolute inset-0 -z-5">
          <div className="absolute top-20 left-1/2 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        {/* Glass card */}
        <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-xl">
                ⚡
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
                meetEVs
              </h1>
            </div>
            <p className="text-gray-300 text-sm">
              {isSignUp
                ? 'Join our EV community'
                : 'Welcome back to the EV wiki'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-100 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-6 py-4 rounded-2xl border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <LogIn size={18} />
              {loading
                ? isSignUp
                  ? 'Creating account...'
                  : 'Signing in...'
                : isSignUp
                  ? 'Sign Up'
                  : 'Sign In'}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setEmail('')
                  setPassword('')
                  setFullName('')
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
