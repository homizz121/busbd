import React, { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '../api/adminApi'
import { useToast } from '../context/ToastContext'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'BusBD',
    supportEmail: 'support@busbd.com',
    serviceFee: 50,
    maxSeatsPerBooking: 4,
    cancellationPolicy: 'Free cancellation up to 2 hours before departure. After that, 50% refund applies.',
    maintenanceMode: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const res = await getSettings()
      if (res.data?.data?.settings) setSettings(res.data.data.settings)
    } catch (err) { /* use defaults */ }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateSettings(settings)
      addToast('Settings saved!', 'success')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save settings', 'error')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">System Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Name</label>
          <input value={settings.siteName || ''} onChange={e => setSettings({...settings, siteName: e.target.value})}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Support Email</label>
          <input type="email" value={settings.supportEmail || ''} onChange={e => setSettings({...settings, supportEmail: e.target.value})}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Fee (Tk)</label>
            <input type="number" value={settings.serviceFee || 50} onChange={e => setSettings({...settings, serviceFee: Number(e.target.value)})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Seats per Booking</label>
            <input type="number" min={1} max={10} value={settings.maxSeatsPerBooking || 4} onChange={e => setSettings({...settings, maxSeatsPerBooking: Number(e.target.value)})}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cancellation Policy</label>
          <textarea rows={3} value={settings.cancellationPolicy || ''} onChange={e => setSettings({...settings, cancellationPolicy: e.target.value})}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white resize-none" />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
            <p className="text-xs text-gray-500 mt-1">When enabled, only admins can access the site</p>
          </div>
          <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
            className={`relative w-12 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.maintenanceMode ? 'translate-x-6' : ''}`}></span>
          </button>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
