import api from './api'

export const sendOTP = (data) => api.post('/accounts/auth/send-otp/', data)
export const verifyOTP = (data) => api.post('/accounts/auth/verify-otp/', data)
export const getProfile = () => api.get('/accounts/profile/')
export const updateProfile = (data) => api.patch('/accounts/profile/', data)
export const registerDriver = (formData) =>
  api.post('/accounts/driver/register/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const getDriverProfile = () => api.get('/accounts/driver/profile/')
