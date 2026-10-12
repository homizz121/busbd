import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMyWaitlist, leaveWaitlist } from '../api/waitlistApi'
import { formatDate } from '../utils/formatDate'
import { formatTime } from '../utils/formatTime'
import { useToast } from '../context/ToastContext'

export default function WaitingListPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => { fetchWaitlist() }, [])

  const fetchWaitlist = async () => {
    try {
      setLoading(true)
      const res = await getMyWaitlist()
      setEntries(res.data.data.entries || [])
    } catch (err) {
      addToast('Failed to load waitlist', 'error')
    } finally { setLoading(false) }
  }

  const handleLeave = async (id) => {
    try {
      await leaveWaitlist(id)
      addToast('Removed from waiting list', 'success')
      fetchWaitlist()
    } catch (err) {
      addToast('Failed to remove', 'error')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Waiting List</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">You&apos;ll be automatically promoted when a seat becomes available.</p>

      {entries.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No waitlist entries</h3>
          <p className="text-gray-500">When a bus is full, join the waiting list to get notified</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, i) => {
            const bus = entry.trip?.bus
            const statusColor = entry.status === 'PROMOTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : entry.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
            
            return (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-100 dark:border-gray-700">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>{entry.status}</span>
                      {entry.status === 'WAITING' && (
                        <span className="text-xs text-gray-400">Position: #{entry.position}</span>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">{bus?.name} • {bus?.fromCity} → {bus?.toCity}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(entry.trip?.travelDate)} at {formatTime(bus?.departureTime)}
                    </p>
                  </div>

                  {entry.status === 'WAITING' && (
                    <button onClick={() => handleLeave(entry.id)}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors self-start md:self-center">
                      Leave Waitlist
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
