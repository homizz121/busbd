import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllWaitlist, promoteWaitlist, deleteWaitlistEntry } from '../api/adminApi'
import { useToast } from '../context/ToastContext'
import { formatDateShort } from '../utils/formatDate'

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => { fetchEntries() }, [])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const res = await getAllWaitlist()
      setEntries(res.data.data.entries || res.data.data || [])
    } catch (err) { /* ignore */ }
    finally { setLoading(false) }
  }

  const handlePromote = async (id) => {
    try {
      await promoteWaitlist(id)
      addToast('User promoted to confirmed booking!', 'success')
      fetchEntries()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to promote', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this waitlist entry?')) return
    try {
      await deleteWaitlistEntry(id)
      addToast('Entry removed', 'success')
      fetchEntries()
    } catch (err) { addToast('Failed to remove', 'error') }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Waiting List</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">User</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium hidden md:table-cell">Route</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium hidden md:table-cell">Travel Date</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">Position</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {entries.map((entry, i) => (
                <motion.tr key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{entry.user?.name}</p>
                    <p className="text-xs text-gray-400">{entry.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{entry.trip?.bus?.fromCity} → {entry.trip?.bus?.toCity}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDateShort(entry.trip?.travelDate)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-xs">{entry.position}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.status === 'WAITING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : entry.status === 'PROMOTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right flex gap-2 justify-end">
                    {entry.status === 'WAITING' && (
                      <>
                        <button onClick={() => handlePromote(entry.id)} className="text-green-600 text-xs font-medium hover:underline">Promote</button>
                        <button onClick={() => handleDelete(entry.id)} className="text-red-600 text-xs font-medium hover:underline">Remove</button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12 text-gray-400">No waitlist entries found</div>
      )}
    </div>
  )
}
