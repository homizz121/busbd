import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getTicket } from '../api/bookingApi'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { formatTime } from '../utils/formatTime'

export default function TicketPage() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTicket() }, [id])

  const fetchTicket = async () => {
    try {
      const res = await getTicket(id)
      setBooking(res.data.data.booking || res.data.data)
    } catch (err) {}
    finally { setLoading(false) }
  }

  const handlePrint = () => window.print()

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>
  }

  if (!booking) {
    return <div className="text-center py-20"><p>Ticket not found</p><Link to="/my-bookings" className="text-blue-600 mt-4 inline-block">← My Bookings</Link></div>
  }

  const seats = typeof booking.seatNumbers === 'string' ? JSON.parse(booking.seatNumbers) : booking.seatNumbers
  const bus = booking.trip?.bus

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link to="/my-bookings" className="text-sm text-blue-600 hover:underline">← Back</Link>
        <button onClick={handlePrint} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
          🖨️ Print Ticket
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 border-dashed border-blue-300 dark:border-blue-700">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🚌</span>
              <div>
                <h1 className="text-xl font-bold">BusBD Ticket</h1>
                <p className="text-xs opacity-80">Official Boarding Pass</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-red-500'}`}>
              {booking.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Route */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatTime(bus?.departureTime)}</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{bus?.fromCity}</p>
              <p className="text-xs text-gray-400">Departure</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xs text-gray-400 mb-1">{Math.floor((bus?.durationMinutes || 0) / 60)}h {(bus?.durationMinutes || 0) % 60}m</span>
              <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 relative">
                <span className="absolute -top-1.5 left-0 w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="absolute -top-1.5 right-0 w-3 h-3 rounded-full bg-cyan-500"></span>
              </div>
            </div>
            <div className="text-center flex-1">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatTime(bus?.arrivalTime)}</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{bus?.toCity}</p>
              <p className="text-xs text-gray-400">Arrival</p>
            </div>
          </div>

          <hr className="border-dashed border-gray-300 dark:border-gray-600 my-5" />

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Booking</p>
              <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">{booking.bookingCode}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(booking.trip?.travelDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Passenger</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.passengerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bus</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{bus?.name} ({bus?.busType})</p>
            </div>
          </div>

          {/* Seats */}
          <div className="mb-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Seat Numbers</p>
            <div className="flex gap-2 flex-wrap">
              {seats.map(s => (
                <span key={s} className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md">{s}</span>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount Paid</span>
            <span className="text-xl font-bold text-green-600">{formatCurrency(booking.totalFare)}</span>
          </div>

          {/* Barcode */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-end gap-[2px] h-16 justify-center opacity-50">
              {Array.from({ length: 60 }, (_, i) => (
                <div key={i} className="bg-gray-900 dark:bg-white" style={{ width: [1,2,3,1,2,3][i%6], height: `${30 + (i*11)%70}%` }}></div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Present this ticket at the boarding point</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
