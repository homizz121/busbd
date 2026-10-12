import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SearchForm from '../components/SearchForm'

const popularRoutes = [
  { from: 'Dhaka', to: 'Chattogram', icon: '🏖️' },
  { from: 'Dhaka', to: 'Sylhet', icon: '🌄' },
  { from: 'Dhaka', to: 'Rajshahi', icon: '🏛️' },
  { from: 'Dhaka', to: "Cox's Bazar", icon: '🏝️' },
]

const features = [
  { icon: '⚡', title: 'Instant Booking', desc: 'Real-time seat selection and instant confirmation' },
  { icon: '🎫', title: 'Digital Tickets', desc: 'Printable e-tickets with QR codes' },
  { icon: '🔄', title: 'Free Cancellation', desc: 'Cancel anytime before departure' },
  { icon: '📱', title: 'Mobile Friendly', desc: 'Book from any device, anywhere' },
]

export default function HomePage() {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Book Your Bus Journey <br className="hidden md:block" />
              <span className="text-yellow-300">With Confidence</span>
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Bangladesh's most trusted bus reservation platform. Real-time seat selection, instant confirmation, and the best fares across all major routes.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto">
            <SearchForm />
          </motion.div>

          {/* Quick routes */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="text-white/80 text-sm mr-2 self-center">Popular:</span>
            {popularRoutes.map((r, i) => (
              <Link key={i} to={`/search?fromCity=${encodeURIComponent(r.from)}&toCity=${encodeURIComponent(r.to)}`}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full hover:bg-white/30 transition-all">
                {r.icon} {r.from} → {r.to}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose BusBD?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">Everything you need for a seamless bus travel experience</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Search & Select', desc: 'Choose your route, date, and preferred bus type' },
              { step: '2', title: 'Pick Your Seat', desc: 'Select from an interactive seat map in real-time' },
              { step: '3', title: 'Get Confirmed', desc: 'Instant confirmation with digital ticket ready to go' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {s.step}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Travel?</h2>
            <p className="text-blue-100 mb-6">Join thousands of travelers who book with BusBD every day</p>
            <Link to="/register" className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all">
              Get Started Free →
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
