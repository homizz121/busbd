import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getBusById } from '../api/busApi'
import { createBooking } from '../api/bookingApi'
import { formatCurrency } from '../utils/formatCurrency'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const PAYMENT_METHODS = [
  { id: 'DEMO_BKASH', name: 'bKash', icon: '💳', color: 'from-pink-500 to-rose-500' },
  { id: 'DEMO_NAGAD', name: 'Nagad', icon: '📱', color: 'from-orange-500 to-amber-500' },
  { id: 'DEMO_CARD', name: 'Card', icon: '💳', color: 'from-blue-500 to-indigo-500' },
]

export default function CheckoutPage() {
  const { bookingId } = useParams() // Actually busId from our route
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()

  const seats = location.state?.seats || []
  const date = location.state?.date || ''
  const busId = bookingId // The route param is actually the bus id

  const [bus, setBus] = useState(null)
  const [passengerName, setPassengerName] = useState(user?.name || '')
  const [passengerPhone, setPassengerPhone] = useState(user?.phone || '')
  const [paymentMethod, setPaymentMethod] = useState('DEMO_BKASH')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchBus()
  }, [busId])

  const fetchBus = async () => {
    try {
      const res = await getBusById(busId)
      setBus(res.data.data.bus)
    } catch (err) {
      addToast('Failed to load bus', 'error')
    }
  }

  const handlePayment = async () => {
    if (!bus || seats.length === 0) return
    
    // Find the trip for the selected date
    const trip = bus.trips?.find(t => new Date(t.travelDate).toISOString().split('T')[0] === date)
    if (!trip) {
      addToast('No trip found for selected date', 'error')
      return
    }

    try {
      setProcessing(true)
      const res = await createBooking({
        tripId: trip.id,
        seatNumbers: seats,
        passengerName,
        passengerPhone,
        paymentMethod
      })
      
      const booking = res.data.data.booking || res.data.data
      addToast('Booking confirmed! 🎉', 'success')
      navigate(`/booking-success/${booking.id}`, { state: { booking } })
    } catch (err) {
      addToast(err.response?.data?.message || 'Booking failed. Please try again.', 'error')
    } finally {
      setProcessing(false)
    }
  }

  if (!bus) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>
  }

  const totalFare = bus.baseFare * seats.length + 50

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h1>

        {/* Booking summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Booking Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Bus</span><span className="font-medium">{bus.name} ({bus.busType})</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Route</span><span className="font-medium">{bus.fromCity} → {bus.toCity}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{date}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Seats</span><span className="font-medium">{seats.join(', ')}</span></div>
            <hr className="border-gray-200 dark:border-gray-700 my-3" />
            <div className="flex justify-between text-lg font-bold"><span>Total Payable</span><span className="text-green-600">{formatCurrency(totalFare)}</span></div>
          </div>
        </div>

        {/* Passenger details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Passenger Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input type="text" value={passengerName} onChange={e => setPassengerName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter passenger name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
              <input type="tel" value={passengerPhone} onChange={e => setPassengerPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+8801XXXXXXXXX" />
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Payment Method</h2>
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map(m => (
              <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${paymentMethod === m.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                <div className="text-2xl mb-1">{m.icon}</div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Pay button */}
        <button onClick={handlePayment} disabled={processing || !passengerName || !passengerPhone}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transform hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {processing ? 'Processing...' : `Pay ${formatCurrency(totalFare)} →`}
        </button>

        <p className="text-xs text-gray-400 mt-3 text-center">This is a demo payment. No actual money will be charged.</p>
      </motion.div>
    </div>
  )
}
