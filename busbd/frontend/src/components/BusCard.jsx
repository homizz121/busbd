import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatCurrency } from '../utils/formatCurrency'
import { formatTime } from '../utils/formatTime'

const busTypeIcons = { REGULAR: '🚌', AC: '❄️', SLEEPER: '🛏️' }
const busTypeColors = { REGULAR: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', AC: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', SLEEPER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' }

export default function BusCard({ bus, index = 0 }) {
  const nextTrip = bus.trips?.[0]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 overflow-hidden group"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{bus.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${busTypeColors[bus.busType] || busTypeColors.REGULAR}`}>
                {busTypeIcons[bus.busType]} {bus.busType}
              </span>
            </div>
            <p className="text-sm text-gray-500">{bus.operator} • Bus #{bus.busNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">From</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(bus.baseFare)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTime(bus.departureTime)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{bus.fromCity}</p>
          </div>
          <div className="flex-1 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <span className="text-xs text-gray-400">{Math.floor(bus.durationMinutes / 60)}h {bus.durationMinutes % 60}m</span>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTime(bus.arrivalTime)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{bus.toCity}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {nextTrip ? (
            <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              Next: {new Date(nextTrip.travelDate).toLocaleDateString('en-BD', { month: 'short', day: 'numeric' })}
            </span>
          ) : (
            <span className="text-xs text-gray-400">No upcoming trips</span>
          )}

          <Link to={`/buses/${bus.id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all group-hover:scale-105">
            Select Seats →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
