import React, { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getBookingById } from '../api/bookingApi'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { formatTime } from '../utils/formatTime'

export default function BookingSuccessPage() {
  const { id } = useParams()
  const location = useLocation()
  const [booking, setBooking] = useState(location.state?.booking || null)
  const [loading, setLoading] = useState(!location.state?.booking)

  useEffect(() => {
    if (!booking && id) {
      fetchBooking()
    }
  }, [id])

  const fetchBooking = async () => {
    try {
      setLoading(true)
      const res = await getBookingById(id)
      setBooking(res.data.data.booking || res.data.data)
    } catch (err) {}
    finally { setLoading(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div></div>
  }

  if (!booking) {
    return <div className="text-center py-20"><p>Booking not found</p><Link to="/" className="text-blue-600 mt-4 inline-block">← Go Home</Link></div>
  }

  const seats = typeof booking.seatNumbers === 'string' ? JSON.parse(booking.seatNumbers) : booking.seatNumbers
  const bus = booking.trip?.bus

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <span className="text-5xl">✅</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h1>
        <p className="text-gray-500 dark:text-gray-400">Your ticket is ready. Have a safe journey!</p>
      </motion.div>

      {/* Ticket */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        
        {/* Ticket header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Booking Code</p>
              <p className="text-2xl font-mono font-bold">{booking.bookingCode}</p>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">CONFIRMED ✓</span>
          </div>
        </div>

        {/* Ticket body */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">From</p>
              <p className="font-bold text-lg text-gray-900 dark:text-white">{bus?.fromCity}</p>
              <p className="text-sm text-gray-500">{formatTime(bus?.departureTime)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">To</p>
              <p className="font-bold text-lg text-gray-900 dark:text-white">{bus?.toCity}</p>
              <p className="text-sm text-gray-500">{formatTime(bus?.arrivalTime)}</p>
            </div>
          </div>

          <hr className="border-dashed border-gray-300 dark:border-gray-600 my-4" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-1">Travel Date</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.trip?.travelDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Passenger</p>
              <p className="font-medium text-gray-900 dark:text-white">{booking.passengerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Seats</p>
              <div className="flex gap-1 flex-wrap">
                {seats.map(s => <span key={s} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-bold">{s}</span>)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Total Paid</p>
              <p className="font-bold text-green-600">{formatCurrency(booking.totalFare)}</p>
            </div>
          </div>

          {/* Barcode simulation */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-end gap-[2px] h-12 justify-center opacity-60">
              {Array.from({ length: 50 }, (_, i) => (
                <div key={i} className="bg-gray-900 dark:bg-white" style={{ width: [1,2,3,1,2][i%5], height: `${40 + (i*7)%60}%` }}></div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Scan at boarding point</p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-4 mt-8">
        <Link to={`/ticket/${booking.id}`} className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center">
          View Ticket
        </Link>
        <Link to="/my-bookings" className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-200 transition-colors text-center">
          My Bookings
        </Link>
      </div>
    </div>
  )
}
