import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SeatMap from '../components/SeatMap'
import { getBusById, getSeatMap } from '../api/busApi'
import { formatCurrency } from '../utils/formatCurrency'
import { formatTime } from '../utils/formatTime'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function BusDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { addToast } = useToast()

  const [bus, setBus] = useState(null)
  const [trips, setTrips] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [seatLoading, setSeatLoading] = useState(false)

  useEffect(() => {
    fetchBus()
  }, [id])

  const fetchBus = async () => {
    try {
      setLoading(true)
      const res = await getBusById(id)
      const busData = res.data.data.bus
      setBus(busData)
      setTrips(busData.trips || [])
      
      // Auto-select first available date
      if (busData.trips?.length > 0) {
        const firstTrip = busData.trips[0]
        const dateStr = new Date(firstTrip.travelDate).toISOString().split('T')[0]
        setSelectedDate(dateStr)
        fetchSeats(dateStr)
      }
    } catch (err) {
      addToast('Failed to load bus details', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchSeats = async (dateStr) => {
    if (!dateStr) return
    try {
      setSeatLoading(true)
      const res = await getSeatMap(id, dateStr)
      setSeats(res.data.data.seats || [])
      setSelectedSeats([])
    } catch (err) {
      addToast('No trip found for this date', 'warning')
      setSeats([])
    } finally {
      setSeatLoading(false)
    }
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
    fetchSeats(e.target.value)
  }

  const handleSeatClick = (seatNum) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatNum)) return prev.filter(s => s !== seatNum)
      if (prev.length >= 4) {
        addToast('Maximum 4 seats per booking', 'warning')
        return prev
      }
      return [...prev, seatNum]
    })
  }

  const handleBook = () => {
    if (!isAuthenticated) {
      addToast('Please login to book', 'warning')
      navigate('/login', { state: { from: `/buses/${id}` } })
      return
    }
    if (selectedSeats.length === 0) {
      addToast('Please select at least one seat', 'warning')
      return
    }
    navigate(`/checkout/${id}`, { state: { seats: selectedSeats, date: selectedDate } })
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>
  }

  if (!bus) {
    return <div className="text-center py-20"><p className="text-xl">Bus not found</p><Link to="/" className="text-blue-600 mt-4 inline-block">← Back home</Link></div>
  }

  const amenities = typeof bus.amenities === 'string' ? JSON.parse(bus.amenities || '[]') : (bus.amenities || [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/search" className="text-sm text-blue-600 hover:underline mb-4 inline-block">← Back to search</Link>

      {/* Bus info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{bus.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">{bus.operator} • Bus #{bus.busNumber} • {bus.busType}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTime(bus.departureTime)}</p>
              <p className="text-sm text-gray-500">{bus.fromCity}</p>
            </div>
            <span className="text-2xl">→</span>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTime(bus.arrivalTime)}</p>
              <p className="text-sm text-gray-500">{bus.toCity}</p>
            </div>
            <div className="text-right ml-4">
              <p className="text-xs text-gray-400">Base Fare</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(bus.baseFare)}</p>
            </div>
          </div>
        </div>

        {amenities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities:</p>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a, i) => (
                <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full">{a}</span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seat map */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select Seats</h2>
          
          {/* Date selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Travel Date</label>
            <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={handleDateChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
            {trips.length > 1 && (
              <p className="text-xs text-gray-400 mt-1">Available dates: {trips.length}</p>
            )}
          </div>

          <SeatMap seats={seats} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} loading={seatLoading} />
        </div>

        {/* Booking summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Booking Summary</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Route</span>
              <span className="font-medium text-gray-900 dark:text-white">{bus.fromCity} → {bus.toCity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900 dark:text-white">{selectedDate || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Seats</span>
              <span className="font-medium text-gray-900 dark:text-white">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}</span>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <div className="flex justify-between">
              <span className="text-gray-500">Base Fare × {selectedSeats.length || 1}</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(bus.baseFare * (selectedSeats.length || 1))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service Fee</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(50)}</span>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
            
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-green-600">{formatCurrency(bus.baseFare * (selectedSeats.length || 1) + 50)}</span>
            </div>
          </div>

          <button onClick={handleBook} disabled={selectedSeats.length === 0}
            className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
            {isAuthenticated ? 'Proceed to Payment →' : 'Login to Book'}
          </button>

          {!isAuthenticated && (
            <p className="text-xs text-gray-400 mt-2 text-center">You need to be logged in to complete your booking</p>
          )}
        </div>
      </div>
    </div>
  )
}
