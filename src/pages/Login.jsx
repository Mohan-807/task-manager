import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'

const DEMO_ACCOUNTS = [
  { role: 'Admin',     email: 'alex@company.io',   password: 'admin123'   },
  { role: 'Manager',   email: 'sarah@company.io',  password: 'manager123' },
  { role: 'Developer', email: 'marcus@company.io', password: 'dev123'     },
  { role: 'Tester',    email: 'taylor@company.io', password: 'tester123'  },
]

export default function Login() {
  const navigate = useNavigate()
  const { login, loading, error, clearError } = useAuth()
  const toast = useNotification()

  const [email, setEmail]           = useState('alex@company.io')
  const [password, setPassword]     = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    const result = await login(email.trim(), password)
    if (result.ok) {
      toast.success('Welcome back!', `Signed in as ${result.user.name}`)
      navigate('/dashboard', { replace: true })
    }
  }

  const fillDemo = (account) => {
    clearError()
    setEmail(account.email)
    setPassword(account.password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-subtle px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-indigo-500 flex items-center justify-center mb-4">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">TaskFlow</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your workspace</p>
        </div>

        {/* Demo accounts */}
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
          <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide mb-2">Demo Accounts</p>
          <div className="flex gap-1.5 flex-wrap">
            {DEMO_ACCOUNTS.map(a => (
              <button
                key={a.role}
                type="button"
                onClick={() => fillDemo(a)}
                className="px-2.5 py-1 text-xs font-medium bg-white border border-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-colors"
              >
                {a.role}
              </button>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl mb-5">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError() }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                placeholder="you@company.io"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError() }}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-500"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors duration-150 shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">© 2026 TaskFlow. All rights reserved.</p>
      </div>
    </div>
  )
}
