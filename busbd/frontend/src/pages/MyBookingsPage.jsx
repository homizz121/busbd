import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getMyBookings, cancelBooking } from '../api/bookingApi'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { formatTime } from '../utils/formatTime'
import { useToast } from '../context/ToastContext'

const statusColors = { CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await getMyBookings()
      setBookings(res.data.data.bookings || [])
    } catch (err) {
      addToast('Failed to load bookings', 'error')
    } finally { setLoading(false) }
  }

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    try {
      await cancelBooking(id)
      addToast('Booking cancelled', 'success')
      fetchBookings()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel', 'error')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-4">Start your journey by booking a bus</p>
          <Link to="/search" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Search Buses</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, i) => {
            const seats = typeof booking.seatNumbers === 'string' ? JSON.parse(booking.seatNumbers) : booking.seatNumbers
            const bus = booking.trip?.bus
            
            return (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-100 dark:border-gray-700">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status] || ''}`}>{booking.status}</span>
                      <span className="text-xs text-gray-400 font-mono">{booking.bookingCode}</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">{bus?.name} • {bus?.fromCity} → {bus?.toCity}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(booking.trip?.travelDate)} at {formatTime(bus?.departureTime)} • Seats: {seats.join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold text-green-600">{formatCurrency(booking.totalFare)}</p>
                    </div>
                    
                    {booking.status === 'CONFIRMED' && (
                      <>
                        <Link to={`/ticket/${booking.id}`} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Ticket</Link>
                        <button onClick={() => handleCancel(booking.id)} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors">Cancel</button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
