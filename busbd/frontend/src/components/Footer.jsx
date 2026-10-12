import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🚌</span>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">BusBD</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Bangladesh's most advanced bus reservation platform. Book your next journey with confidence.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-200">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link to="/my-bookings" className="hover:text-blue-400 transition-colors">My Bookings</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-blue-400 transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-200">Popular Routes</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Dhaka → Chattogram</li>
              <li>Dhaka → Sylhet</li>
              <li>Dhaka → Rajshahi</li>
              <li>Dhaka → Khulna</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-200">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 support@busbd.com</li>
              <li>📞 +880 1XXX-XXXXXX</li>
              <li>📍 Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} BusBD. All rights reserved. Made with ❤️ in Bangladesh.
        </div>
      </div>
    </footer>
  )
}
