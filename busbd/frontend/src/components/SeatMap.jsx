import React from 'react'
import { motion } from 'framer-motion'
import { getSeatLayout, getSeatColor, getSeatTypeIcon } from '../utils/seatHelpers'

export default function SeatMap({ seats, selectedSeats, onSeatClick, maxSelect = 4, loading }) {
  const rows = getSeatLayout(seats?.length || 40)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  const handleSeatClick = (seat) => {
    if (seat.isBooked || seat.isBlocked) return
    onSeatClick(seat.seatNumber)
  }

  return (
    <div className="relative">
      {/* Bus frame */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
        {/* Driver area */}
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Front</span>
          <div className="w-16 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-400 border border-gray-200 dark:border-gray-600">
            🚗 Driver
          </div>
        </div>

        {/* Seat grid */}
        <div className="space-y-2">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-2 justify-center">
              {/* Row number */}
              <span className="w-6 text-xs text-gray-400 text-right">{rowIdx + 1}</span>

              {row.map((seatNum) => {
                const seat = seats?.find(s => s.seatNumber === seatNum)
                if (!seat) return <div key={seatNum} className="w-12 h-12" />
                
                const isSelected = selectedSeats.includes(seatNum)
                const colorClass = getSeatColor(seat, selectedSeats)

                return (
                  <motion.button
                    key={seatNum}
                    whileHover={!seat.isBooked && !seat.isBlocked ? { scale: 1.05 } : {}}
                    whileTap={!seat.isBooked && !seat.isBlocked ? { scale: 0.95 } : {}}
                    onClick={() => handleSeatClick(seat)}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold transition-all border ${colorClass} ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}
                    title={`Seat ${seatNum} - ${seat.seatType}${seat.isBooked ? ' (Booked)' : seat.isBlocked ? ' (Blocked)' : ''}`}
                  >
                    {seatNum}
                  </motion.button>
                )
              })}

              {/* Row number right */}
              <span className="w-6 text-xs text-gray-400">{rowIdx + 1}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500"></span>
              Available
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-500"></span>
              Selected
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600"></span>
              Booked
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-200 dark:bg-red-900"></span>
              Blocked
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900 border border-blue-300"></span>
              Window
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-pink-100 dark:bg-pink-900 border border-pink-300"></span>
              Ladies
            </div>
          </div>
        </div>

        {/* Selected seats summary */}
        {selectedSeats.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Selected Seats:</p>
            <div className="flex flex-wrap gap-1">
              {selectedSeats.map(num => (
                <span key={num} className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-bold">{num}</span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
