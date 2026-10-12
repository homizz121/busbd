import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getRevenue } from '../api/adminApi'
import { formatCurrency } from '../utils/formatCurrency'

export default function AdminRevenuePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => { fetchRevenue() }, [])

  const fetchRevenue = async () => {
    try {
      setLoading(true)
      const res = await getRevenue({ from, to })
      setData(res.data.data)
    } catch (err) { /* ignore */ }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div></div>

  const revenueByDayData = Object.entries(data?.revenueByDay || {}).map(([day, amount]) => ({ day: day.slice(5), amount }))
  const revenueByTypeData = Object.entries(data?.revenueByType || {}).map(([name, value]) => ({ name: name.replace('_', ' '), value }))
  const revenueByRouteData = Object.entries(data?.revenueByRoute || {}).sort((a,b) => b[1]-a[1]).slice(0,10).map(([route, amount]) => ({ route: route.replace(' → ', '\n'), amount }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Revenue Report</h1>

      {/* Date Filters */}
      <div className="flex gap-3 mb-8 flex-wrap items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
        </div>
        <button onClick={fetchRevenue} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Apply</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
          <p className="text-sm opacity-80">Total Revenue</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(data?.totalRevenue || 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-5 text-white">
          <p className="text-sm opacity-80">Total Refunds</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(data?.totalRefunded || 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
          <p className="text-sm opacity-80">Net Revenue</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency((data?.totalRevenue || 0) - (data?.totalRefunded || 0))}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByDayData}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="amount" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue by Bus Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByTypeData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="value" name="Revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Routes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Routes by Revenue</h3>
        <div className="space-y-2">
          {Object.entries(data?.revenueByRoute || {}).sort((a,b) => b[1]-a[1]).slice(0,10).map(([route, amount], i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 text-xs text-gray-400 font-mono">{i+1}</span>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{route}</span>
              <div className="w-1/2 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(amount / (Object.values(data?.revenueByRoute || {})[0] || 1)) * 100}%` }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white w-24 text-right">{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bus Earnings */}
      {Object.keys(data?.busEarnings || {}).length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Earnings by Bus</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500"><th className="pb-2">Bus</th><th className="pb-2 text-right">Revenue</th></tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {Object.entries(data.busEarnings).sort((a,b) => b[1]-a[1]).slice(0,15).map(([bus, amount]) => (
                  <tr key={bus}><td className="py-2 text-gray-900 dark:text-white">{bus}</td><td className="py-2 text-right font-medium">{formatCurrency(amount)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
