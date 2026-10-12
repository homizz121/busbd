import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useToast } from '../context/ToastContext'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    
    try {
      setLoading(true)
      // Demo: just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSent(true)
      addToast('Password reset link sent to your email', 'success')
    } catch (err) {
      addToast('Failed to send reset link', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🔐</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        {sent ? (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center border border-green-200 dark:border-green-800">
            <span className="text-4xl mb-3 block">✅</span>
            <p className="text-green-700 dark:text-green-300 font-medium mb-4">Check your inbox! We&apos;ve sent a password reset link to {email}</p>
            <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="you@example.com" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:underline">← Back to Login</Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
