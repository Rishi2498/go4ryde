import api from './api'

export const createRide = (data) => api.post('/rides/create/', data)
export const searchRides = (params) => api.get('/rides/search/', { params })
export const getRideDetail = (id) => api.get(`/rides/${id}/`)
export const getDriverRides = () => api.get('/rides/my-rides/')
export const getRideReviews = (id) => api.get(`/rides/${id}/reviews/`)
export const createReview = (data) => api.post('/reviews/create/', data)
