import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/formatDate'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

        {/* Profile card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.role === 'ADMIN' ? '👑 Administrator' : '👤 Passenger'}</p>
              <p className="text-xs text-gray-400 mt-1">Member since {formatDate(user.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Phone</p>
              <p className="font-medium text-gray-900 dark:text-white">{user.phone}</p>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 mb-6">
          <button onClick={() => setShowChangePassword(!showChangePassword)}
            className="text-blue-600 font-medium text-sm hover:underline">
            {showChangePassword ? '✕ Cancel' : '🔑 Change Password'}
          </button>

          {showChangePassword && (
            <div className="mt-4 space-y-3">
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              <button onClick={() => {
                if (newPassword !== confirmPassword) return addToast('Passwords do not match', 'error')
                if (newPassword.length < 8) return addToast('Password too short', 'error')
                addToast('Password changed! (Demo)', 'success')
                setNewPassword('')
                setConfirmPassword('')
              }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Update Password
              </button>
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={() => { logout(); addToast('Logged out', 'info') }}
          className="w-full py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 font-medium rounded-lg hover:bg-red-200 transition-colors">
          Sign Out
        </button>
      </motion.div>
    </div>
  )
}
