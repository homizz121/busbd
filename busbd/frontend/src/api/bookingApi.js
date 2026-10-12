import api from './axios'
export const createBooking = (data) => api.post('/bookings', data)
export const getMyBookings = () => api.get('/bookings/my')
export const getBookingById = (id) => api.get(`/bookings/${id}`)
export const cancelBooking = (id) => api.delete(`/bookings/${id}`)
export const getTicket = (id) => api.get(`/bookings/${id}/ticket`)
