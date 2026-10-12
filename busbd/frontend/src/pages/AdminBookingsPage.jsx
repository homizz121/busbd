import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllBookings, cancelAdminBooking } from '../api/adminApi'
import { useToast } from '../context/ToastContext'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDateShort } from '../utils/formatDate'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { addToast } = useToast()

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await getAllBookings(params)
      setBookings(res.data.data.bookings || res.data.data || [])
    } catch (err) { /* ignore */ }
    finally { setLoading(false) }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await cancelAdminBooking(id)
      addToast('Booking cancelled', 'success')
      fetchBookings()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel', 'error')
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All Bookings</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code, name, phone..."
          className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white">
          <option value="">All Status</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button onClick={fetchBookings} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Search</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Code</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Passenger</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium hidden lg:table-cell">Route</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">Seats</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Amount</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {bookings.map((b, i) => (
                <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{b.bookingCode}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{b.passengerName}</p>
                    <p className="text-xs text-gray-400">{b.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{b.trip?.bus?.fromCity} → {b.trip?.bus?.toCity}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDateShort(b.trip?.travelDate)}</td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{b.seatCount}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(b.totalFare)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {b.status === 'CONFIRMED' && (
                      <button onClick={() => handleCancel(b.id)} className="text-red-600 text-xs font-medium hover:underline">Cancel</button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
