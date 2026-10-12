import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-8xl mb-6">🚌💨</div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">This page has left the station</p>
        <p className="text-gray-500 mb-8">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
        <Link to="/" className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-block">
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
