import api from './api'

export const createPaymentOrder = (bookingId) =>
  api.post('/payments/create-order/', { booking_id: bookingId })

export const verifyPayment = (data) => api.post('/payments/verify/', data)
