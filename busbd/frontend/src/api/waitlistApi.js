import api from './axios'
export const joinWaitlist = (data) => api.post('/waitlist', data)
export const getMyWaitlist = () => api.get('/waitlist/my')
export const getWaitlistByTrip = (tripId) => api.get(`/waitlist/${tripId}`)
export const leaveWaitlist = (id) => api.delete(`/waitlist/${id}`)
