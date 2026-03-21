import api from './api'

export const createBooking = (data) => api.post('/bookings/create/', data)
export const getUserBookings = () => api.get('/bookings/my-bookings/')
export const getBookingDetail = (id) => api.get(`/bookings/${id}/`)
export const cancelBooking = (id, reason) => api.post(`/bookings/${id}/cancel/`, { reason })
