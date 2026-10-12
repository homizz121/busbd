import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllBuses, blockSeat, unblockSeat, changeSeatType } from '../api/adminApi'
import { useToast } from '../context/ToastContext'

export default function AdminSeatsPage() {
  const [buses, setBuses] = useState([])
  const [selectedBusId, setSelectedBusId] = useState('')
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => { fetchBuses() }, [])

  const fetchBuses = async () => {
    try {
      const res = await getAllBuses()
      const busList = res.data.data.buses || res.data.data || []
      setBuses(busList)
      if (busList.length > 0) setSelectedBusId(String(busList[0].id))
    } catch (err) { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchSeats() }, [selectedBusId])

  const fetchSeats = async () => {
    if (!selectedBusId) return
    try {
      // Get seats from bus data (we'll fetch from the bus detail)
      const res = await getAllBuses()
      const busList = res.data.data.buses || res.data.data || []
      const bus = busList.find(b => b.id === Number(selectedBusId))
      if (bus?.seats) {
        setSeats(bus.seats)
      } else {
        // Generate seat list based on totalSeats
        const total = bus?.totalSeats || 40
        const generated = []
        for (let s = 1; s <= total; s++) {
          const row = Math.ceil(s / 4)
          const col = ((s - 1) % 4) + 1
          let seatType = 'AISLE'
          if (row >= 32 && row <= 35) seatType = 'LADIES'
          else if (col === 1 || col === 4) seatType = 'WINDOW'
          generated.push({ id: s, seatNumber: s, seatType, isBlocked: false })
        }
        setSeats(generated)
      }
    } catch (err) { /* ignore */ }
  }

  const handleBlock = async (seatNumbers) => {
    try {
      await blockSeat(selectedBusId, { seatNumbers })
      addToast('Seats blocked', 'success')
      fetchSeats()
    } catch (err) { addToast('Failed to block seats', 'error') }
  }

  const handleUnblock = async (seatNumber) => {
    try {
      await unblockSeat(selectedBusId, seatNumber)
      addToast(`Seat ${seatNumber} unblocked`, 'success')
      fetchSeats()
    } catch (err) { addToast('Failed to unblock', 'error') }
  }

  const handleTypeChange = async (seatNumber, newType) => {
    try {
      await changeSeatType(selectedBusId, seatNumber, { seatType: newType })
      addToast(`Seat ${seatNumber} type changed`, 'success')
      fetchSeats()
    } catch (err) { addToast('Failed to change type', 'error') }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>

  const seatTypeColor = {
    AISLE: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500',
    WINDOW: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600',
    LADIES: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-600',
    EXTRA_LEGROOM: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600',
  }

  const rows = []
  for (let r = 1; r <= Math.ceil(seats.length / 4); r++) {
    const row = seats.filter(s => Math.ceil(s.seatNumber / 4) === r)
    if (row.length > 0) rows.push(row)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Seat Management</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-500 mb-2">Select Bus</label>
        <select value={selectedBusId} onChange={e => setSelectedBusId(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white">
          {buses.map(b => <option key={b.id} value={b.id}>{b.name} ({b.busNumber})</option>)}
        </select>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {[['AISLE', 'Default'], ['WINDOW', 'Window'], ['LADIES', 'Ladies Row'], ['EXTRA_LEGROOM', 'Extra Legroom']].map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border ${seatTypeColor[type]}`}></div>
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Seat Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 overflow-x-auto">
        <div className="space-y-2 min-w-[400px]">
          {rows.map((row, ri) => (
            <div key={ri} className="flex items-center gap-2">
              <span className="w-6 text-xs text-gray-400 font-mono">{String(ri + 1).padStart(2, '0')}</span>
              {row.map(seat => (
                <motion.div key={seat.seatNumber} whileHover={{ scale: 1.1 }}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ${seat.isBlocked ? 'bg-red-200 dark:bg-red-900/50 border-red-400 text-red-700' : seatTypeColor[seat.seatType] || seatTypeColor.AISLE} text-gray-900 dark:text-white`}>
                  {seat.seatNumber}
                </motion.div>
              ))}
              <div className="w-16"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Actions */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Seat Actions</h3>
        <div className="flex gap-4 flex-wrap items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Block Seats (comma separated)</label>
            <input id="block-seats" placeholder="e.g. 5, 6, 7"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white w-48" />
          </div>
          <button onClick={() => {
            const val = document.getElementById('block-seats')?.value || ''
            const nums = val.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
            if (nums.length > 0) handleBlock(nums)
          }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Block</button>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Unblock Seat #</label>
            <input id="unblock-seat" type="number" min={1} max={60} placeholder="e.g. 5"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white w-24" />
          </div>
          <button onClick={() => {
            const val = parseInt(document.getElementById('unblock-seat')?.value)
            if (val) handleUnblock(val)
          }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Unblock</button>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Change Seat # Type</label>
            <input id="type-seat" type="number" min={1} max={60} placeholder="e.g. 5"
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white w-24" />
          </div>
          <select id="type-value" className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white">
            <option value="AISLE">Aisle</option>
            <option value="WINDOW">Window</option>
            <option value="LADIES">Ladies</option>
            <option value="EXTRA_LEGROOM">Extra Legroom</option>
          </select>
          <button onClick={() => {
            const num = parseInt(document.getElementById('type-seat')?.value)
            const type = document.getElementById('type-value')?.value || 'AISLE'
            if (num) handleTypeChange(num, type)
          }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Change Type</button>
        </div>
      </div>
    </div>
  )
}
