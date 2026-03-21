import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CreateRidePage from './pages/CreateRidePage'
import SearchRidePage from './pages/SearchRidePage'
import RideDetailPage from './pages/RideDetailPage'
import BookingsPage from './pages/BookingsPage'
import ProfilePage from './pages/ProfilePage'
import LiveTrackingPage from './pages/LiveTrackingPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/create-ride" element={<ProtectedRoute><CreateRidePage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchRidePage /></ProtectedRoute>} />
        <Route path="/rides/:id" element={<ProtectedRoute><RideDetailPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/tracking/:rideId" element={<ProtectedRoute><LiveTrackingPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  )
}
