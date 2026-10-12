import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const CITIES = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', "Cox's Bazar", 'Rangpur', 'Mymensingh', 'Barishal']
const BUS_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'REGULAR', label: 'Regular' },
  { value: 'AC', label: 'AC' },
  { value: 'SLEEPER', label: 'Sleeper' }
]

export default function SearchForm({ initialFrom, initialTo }) {
  const [fromCity, setFromCity] = useState(initialFrom || '')
  const [toCity, setToCity] = useState(initialTo || '')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [busType, setBusType] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (fromCity) params.set('fromCity', fromCity)
    if (toCity) params.set('toCity', toCity)
    if (date) params.set('date', date)
    if (busType) params.set('busType', busType)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
          <select value={fromCity} onChange={e => setFromCity(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
            <option value="">Anywhere</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
          <select value={toCity} onChange={e => setToCity(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
            <option value="">Anywhere</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Travel Date</label>
          <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bus Type</label>
          <select value={busType} onChange={e => setBusType(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
            {BUS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Price (Tk)</label>
          <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" min="0"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price (Tk)</label>
          <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Unlimited" min="0"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="submit"
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all">
          🔍 Search Buses
        </button>
      </div>
    </motion.form>
  )
}
