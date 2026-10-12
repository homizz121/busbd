import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getDashboard } from '../api/adminApi'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDateShort } from '../utils/formatDate'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboard() }, [])

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard()
      setData(res.data.data)
    } catch (err) { /* ignore */ }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>

  const stats = data?.stats || {}
  const revenueByDayData = Object.entries(data?.revenueByDay || {}).map(([day, amount]) => ({ day: formatDateShort(day), amount }))
  const bookingsByTypeData = Object.entries(data?.bookingsByType || {}).filter(([,v]) => v > 0).map(([name, value]) => ({ name, value }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Buses', value: stats.totalBuses || 0, icon: '🚌', color: 'from-blue-500 to-cyan-500' },
          { label: 'Total Users', value: stats.totalUsers || 0, icon: '👥', color: 'from-green-500 to-emerald-500' },
          { label: 'Bookings', value: stats.totalBookings || 0, icon: '📋', color: 'from-purple-500 to-pink-500' },
          { label: 'Revenue', value: formatCurrency(data?.revenue || 0), icon: '💰', color: 'from-yellow-500 to-orange-500' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${s.color} rounded-xl p-5 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <span className="text-3xl">{s.icon}</span>
              <span className="text-2xl font-bold">{s.value}</span>
            </div>
            <p className="text-sm opacity-80 mt-2">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* More stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Confirmed Bookings', value: stats.confirmedBookings || 0, color: 'text-green-600' },
          { label: 'Cancelled Bookings', value: stats.cancelledBookings || 0, color: 'text-red-600' },
          { label: 'Active Trips', value: stats.activeTrips || 0, color: 'text-blue-600' },
          { label: 'Waitlist Entries', value: stats.waitlistCount || 0, color: 'text-yellow-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByDayData}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Bookings by Bus Type</h3>
          {bookingsByTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={bookingsByTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {bookingsByTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">No booking data yet</div>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Bookings</h3>
          <Link to="/admin/bookings" className="text-sm text-blue-600 hover:underline">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Code</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Passenger</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium hidden md:table-cell">Route</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Amount</th>
                <th className="px-4 py-3 text-center text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {(data?.recentBookings || []).slice(0, 8).map(b => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{b.bookingCode}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{b.passengerName}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{b.trip?.bus?.fromCity} → {b.trip?.bus?.toCity}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDateShort(b.trip?.travelDate)}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(b.totalFare)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        {[
          { to: '/admin/buses', label: 'Manage Buses', icon: '🚌' },
          { to: '/admin/trips', label: 'Manage Trips', icon: '📅' },
          { to: '/admin/users', label: 'Manage Users', icon: '👥' },
          { to: '/admin/revenue', label: 'Revenue Report', icon: '💰' },
        ].map((l, i) => (
          <Link key={i} to={l.to} className="flex items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <span className="text-2xl">{l.icon}</span>
            <span className="font-medium text-gray-900 dark:text-white text-sm">{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
