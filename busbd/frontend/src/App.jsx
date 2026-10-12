import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import HomePage from './pages/HomePage'
import SearchResultsPage from './pages/SearchResultsPage'
import BusDetailsPage from './pages/BusDetailsPage'
import CheckoutPage from './pages/CheckoutPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import MyBookingsPage from './pages/MyBookingsPage'
import TicketPage from './pages/TicketPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ProfilePage from './pages/ProfilePage'
import WaitingListPage from './pages/WaitingListPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminBusesPage from './pages/AdminBusesPage'
import AdminTripsPage from './pages/AdminTripsPage'
import AdminBookingsPage from './pages/AdminBookingsPage'
import AdminSeatsPage from './pages/AdminSeatsPage'
import AdminWaitlistPage from './pages/AdminWaitlistPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminRevenuePage from './pages/AdminRevenuePage'
import AdminSettingsPage from './pages/AdminSettingsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/buses/:id" element={<BusDetailsPage />} />
                <Route path="/checkout/:bookingId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/booking-success/:id" element={<ProtectedRoute><BookingSuccessPage /></ProtectedRoute>} />
                <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
                <Route path="/ticket/:id" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/waiting-list" element={<ProtectedRoute><WaitingListPage /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                <Route path="/admin/buses" element={<AdminRoute><AdminBusesPage /></AdminRoute>} />
                <Route path="/admin/trips" element={<AdminRoute><AdminTripsPage /></AdminRoute>} />
                <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
                <Route path="/admin/seats" element={<AdminRoute><AdminSeatsPage /></AdminRoute>} />
                <Route path="/admin/waitlist" element={<AdminRoute><AdminWaitlistPage /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                <Route path="/admin/revenue" element={<AdminRoute><AdminRevenuePage /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
