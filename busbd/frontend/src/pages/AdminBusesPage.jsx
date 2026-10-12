import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllBuses, createBus, updateBus, deleteBus } from '../api/adminApi'
import { useToast } from '../context/ToastContext'
import { formatCurrency } from '../utils/formatCurrency'

const emptyForm = { busNumber: '', name: '', operator: '', fromCity: '', toCity: '', departureTime: '08:00', arrivalTime: '14:00', durationMinutes: 360, busType: 'REGULAR', totalSeats: 40, baseFare: 500, imageUri: '' }

export default function AdminBusesPage() {
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBus, setEditingBus] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const { addToast } = useToast()

  useEffect(() => { fetchBuses() }, [])

  const fetchBuses = async () => {
    try {
      setLoading(true)
      const res = await getAllBuses()
      setBuses(res.data.data.buses || res.data.data || [])
    } catch (err) { /* ignore */ }
    finally { setLoading(false) }
  }

  const openCreate = () => { setEditingBus(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (bus) => { setEditingBus(bus); setForm({ ...bus, imageUri: bus.imageUri || '' }); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingBus) {
        await updateBus(editingBus.id, form)
        addToast('Bus updated!', 'success')
      } else {
        await createBus(form)
        addToast('Bus created!', 'success')
      }
      setShowModal(false)
      fetchBuses()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save bus', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this bus and all its data?')) return
    try {
      await deleteBus(id)
      addToast('Bus deleted', 'success')
      fetchBuses()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete', 'error')
    }
  }

  const handleToggleActive = async (bus) => {
    try {
      await updateBus(bus.id, { isActive: !bus.isActive })
      addToast(`Bus ${!bus.isActive ? 'activated' : 'deactivated'}`, 'success')
      fetchBuses()
    } catch (err) { addToast('Failed', 'error') }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>

  const typeColor = { REGULAR: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', AC: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', SLEEPER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Buses</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">+ Add Bus</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buses.map((bus, i) => (
          <motion.div key={bus.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className={`bg-white dark:bg-gray-800 rounded-xl p-5 border ${!bus.isActive ? 'opacity-60' : ''} border-gray-100 dark:border-gray-700`}>
            
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{bus.name}</h3>
                <p className="text-xs text-gray-400 font-mono">{bus.busNumber}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor[bus.busType] || ''}`}>{bus.busType}</span>
            </div>

            <div className="space-y-1 text-sm mb-4">
              <p className="text-gray-600 dark:text-gray-300">🚌 {bus.operator}</p>
              <p className="text-gray-600 dark:text-gray-300">📍 {bus.fromCity} → {bus.toCity}</p>
              <p className="text-gray-600 dark:text-gray-300">⏰ {bus.departureTime} – {bus.arrivalTime} ({Math.floor(bus.durationMinutes/60)}h {bus.durationMinutes%60}m)</p>
              <p className="text-gray-600 dark:text-gray-300">💺 {bus.totalSeats} seats • 💰 {formatCurrency(bus.baseFare)}</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={() => openEdit(bus)} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-medium rounded-lg hover:bg-blue-200 transition-colors">Edit</button>
              <button onClick={() => handleToggleActive(bus)} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-lg hover:bg-yellow-200 transition-colors">
                {bus.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => handleDelete(bus.id)} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors">Delete</button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
              
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingBus ? 'Edit Bus' : 'Add New Bus'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bus Number *</label>
                    <input value={form.busNumber} onChange={e => setForm({...form, busNumber: e.target.value})} required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" placeholder="DHK-CTG-001" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" placeholder="Green Line Express" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Operator *</label>
                    <input value={form.operator} onChange={e => setForm({...form, operator: e.target.value})} required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" placeholder="Green Line" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bus Type *</label>
                    <select value={form.busType} onChange={e => setForm({...form, busType: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white">
                      <option value="REGULAR">Regular</option>
                      <option value="AC">AC</option>
                      <option value="SLEEPER">Sleeper</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">From City *</label>
                    <input value={form.fromCity} onChange={e => setForm({...form, fromCity: e.target.value})} required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" placeholder="Dhaka" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">To City *</label>
                    <input value={form.toCity} onChange={e => setForm({...form, toCity: e.target.value})} required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" placeholder="Chattogram" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Departure Time *</label>
                    <input type="time" value={form.departureTime} onChange={e => setForm({...form, departureTime: e.target.value})} required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Arrival Time *</label>
                    <input type="time" value={form.arrivalTime} onChange={e => setForm({...form, arrivalTime: e.target.value})} required
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Duration (min) *</label>
                    <input type="number" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: e.target.value})} required min={30}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Total Seats *</label>
                    <input type="number" value={form.totalSeats} onChange={e => setForm({...form, totalSeats: e.target.value})} required min={4} max={60}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Base Fare (Tk) *</label>
                    <input type="number" value={form.baseFare} onChange={e => setForm({...form, baseFare: e.target.value})} required min={100}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
                    <input value={form.imageUri} onChange={e => setForm({...form, imageUri: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" placeholder="https://..." />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    {editingBus ? 'Update Bus' : 'Create Bus'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
