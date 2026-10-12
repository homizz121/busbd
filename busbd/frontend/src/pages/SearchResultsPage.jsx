import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchForm from '../components/SearchForm'
import BusCard from '../components/BusCard'
import { getBuses } from '../api/busApi'
import { useToast } from '../context/ToastContext'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  const fromCity = searchParams.get('fromCity') || ''
  const toCity = searchParams.get('toCity') || ''
  const busType = searchParams.get('busType') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  useEffect(() => {
    fetchBuses()
  }, [fromCity, toCity, busType, minPrice, maxPrice])

  const fetchBuses = async () => {
    try {
      setLoading(true)
      const params = {}
      if (fromCity) params.fromCity = fromCity
      if (toCity) params.toCity = toCity
      if (busType) params.busType = busType
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice
      const res = await getBuses(params)
      setBuses(res.data.data.buses || [])
    } catch (err) {
      addToast('Failed to fetch buses. Is the server running?', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Search Buses</h1>
        <SearchForm initialFrom={fromCity} initialTo={toCity} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : buses.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🚌</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No buses found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{buses.length} bus(es) found</p>
          <div className="space-y-4">
            {buses.map((bus, i) => (
              <BusCard key={bus.id} bus={bus} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
