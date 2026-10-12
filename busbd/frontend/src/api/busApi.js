import api from './axios'
export const getBuses = (params) => api.get('/buses', { params })
export const getFilters = () => api.get('/buses/filters')
export const getBusById = (id) => api.get(`/buses/${id}`)
export const getSeatMap = (busId, date) => api.get(`/buses/${busId}/seats`, { params: { date } })
export const getPopularRoutes = () => api.get('/buses/popular-routes')
