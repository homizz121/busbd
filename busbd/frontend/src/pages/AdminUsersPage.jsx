import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllUsers, toggleUserStatus } from '../api/adminApi'
import { useToast } from '../context/ToastContext'
import { formatCurrency } from '../utils/formatCurrency'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { addToast } = useToast()

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await getAllUsers()
      setUsers(res.data.data.users || res.data.data || [])
    } catch (err) { /* ignore */ }
    finally { setLoading(false) }
  }

  const handleToggle = async (id) => {
    try {
      await toggleUserStatus(id)
      addToast('User status updated', 'success')
      fetchUsers()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user', 'error')
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manage Users</h1>

      <div className="mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
          className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">User</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium hidden md:table-cell">Phone</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">Role</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium hidden lg:table-cell">Bookings</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium hidden lg:table-cell">Spending</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((user, i) => (
                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${!user.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{user.phone}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300 hidden lg:table-cell">
                    {user.confirmedBookings}/{user.totalBookings}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white hidden lg:table-cell">{formatCurrency(user.totalSpending)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleToggle(user.id)} className="text-xs font-medium hover:underline text-blue-600">
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No users found</div>}
    </div>
  )
}
