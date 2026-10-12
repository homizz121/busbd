import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from || '/my-bookings'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      addToast('Please fill in all fields', 'warning')
      return
    }

    try {
      setLoading(true)
      await login({ email, password })
      addToast('Welcome back! 👋', 'success')
      navigate(from, { replace: true })
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed. Check your credentials.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🚌</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to your BusBD account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
          </div>

          <div className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-1">🔑 Demo Credentials</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">Admin: admin@busbd.com / Admin123!</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">User: user@busbd.com / User123!</p>
        </div>
      </motion.div>
    </div>
  )
}
