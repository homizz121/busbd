import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllTrips, createTrip, createTripsRange, cancelTrip, getAllBuses } from '../api/adminApi'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/formatDate'

export default function AdminTripsPage() {
  const [trips, setTrips] = useState([])
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showRangeModal, setShowRangeModal] = useState(false)
  const [form, setForm] = useState({ busId: '', travelDate: '' })
  const [rangeForm, setRangeForm] = useState({ busId: '', startDate: '', endDate: '' })
  const { addToast } = useToast()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tripsRes, busesRes] = await Promise.all([getAllTrips(), getAllBuses()])
      setTrips(tripsRes.data.data.trips || tripsRes.data.data || [])
      setBuses(busesRes.data.data.buses || busesRes.data.data || [])
    } catch (err) { /* ignore */ }
    finally { setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createTrip({ busId: Number(form.busId), travelDate: form.travelDate })
      addToast('Trip created!', 'success')
      setShowModal(false)
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create trip', 'error')
    }
  }

  const handleCreateRange = async (e) => {
    e.preventDefault()
    try {
      const res = await createTripsRange({ busId: Number(rangeForm.busId), startDate: rangeForm.startDate, endDate: rangeForm.endDate })
      addToast(`${res.data.data?.count || 'Some'} trips created!`, 'success')
      setShowRangeModal(false)
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create trips', 'error')
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this trip? All bookings will be refunded.')) return
    try {
      await cancelTrip(id)
      addToast('Trip cancelled', 'success')
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel', 'error')
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Trips</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">+ Single Trip</button>
          <button onClick={() => setShowRangeModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">+ Date Range</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Bus</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium hidden md:table-cell">Route</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {trips.map((trip, i) => (
                <motion.tr key={trip.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{trip.bus?.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{trip.bus?.fromCity} → {trip.bus?.toCity}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(trip.travelDate)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${trip.status === 'SCHEDULED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {trip.status === 'SCHEDULED' && (
                      <button onClick={() => handleCancel(trip.id)} className="text-red-600 text-xs font-medium hover:underline">Cancel</button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Trip Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create Trip</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Select Bus</label>
                <select value={form.busId} onChange={e => setForm({...form, busId: e.target.value})} required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white">
                  <option value="">Choose a bus...</option>
                  {buses.filter(b => b.isActive).map(b => <option key={b.id} value={b.id}>{b.name} ({b.busNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Travel Date</label>
                <input type="date" value={form.travelDate} onChange={e => setForm({...form, travelDate: e.target.value})} required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Range Modal */}
      {showRangeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create Trips for Date Range</h2>
            <form onSubmit={handleCreateRange} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Select Bus</label>
                <select value={rangeForm.busId} onChange={e => setRangeForm({...rangeForm, busId: e.target.value})} required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white">
                  <option value="">Choose a bus...</option>
                  {buses.filter(b => b.isActive).map(b => <option key={b.id} value={b.id}>{b.name} ({b.busNumber})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                  <input type="date" value={rangeForm.startDate} onChange={e => setRangeForm({...rangeForm, startDate: e.target.value})} required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                  <input type="date" value={rangeForm.endDate} onChange={e => setRangeForm({...rangeForm, endDate: e.target.value})} required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">Create Range</button>
                <button type="button" onClick={() => setShowRangeModal(false)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
