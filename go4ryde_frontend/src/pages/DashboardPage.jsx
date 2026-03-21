import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDriverRides } from '../services/rideService'
import { getUserBookings } from '../services/bookingService'
import RideCard from '../components/RideCard'

export default function DashboardPage() {
  const { user } = useAuth()
  const [rides, setRides] = useState([])
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    if (user?.role === 'driver') {
      getDriverRides().then((res) => setRides(res.data)).catch(() => {})
    }
    getUserBookings().then((res) => setBookings(res.data)).catch(() => {})
  }, [user])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Welcome header */}
      <div className="glass-card p-8 mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">{user?.name}</span>
        </h1>
        <p className="text-gray-400">Here's what's happening with your rides.</p>

        <div className="flex flex-wrap gap-3 mt-6">
          {user?.role === 'driver' && (
            <Link to="/create-ride" className="btn-primary">
              + Create Ride
            </Link>
          )}
          <Link to="/search" className="btn-secondary">
            🔍 Search Rides
          </Link>
          <Link to="/bookings" className="btn-secondary">
            📋 My Bookings
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="My Bookings" value={bookings.length} color="primary" />
        <StatCard
          title="Active Bookings"
          value={bookings.filter((b) => b.status === 'confirmed').length}
          color="success"
        />
        {user?.role === 'driver' && (
          <StatCard title="My Rides" value={rides.length} color="accent" />
        )}
      </div>

      {/* Driver: show recent rides */}
      {user?.role === 'driver' && rides.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Your Recent Rides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rides.slice(0, 4).map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        </section>
      )}

      {/* Recent bookings */}
      {bookings.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    {booking.ride_details?.source_name} → {booking.ride_details?.destination_name}
                  </p>
                  <p className="text-sm text-gray-400">{booking.seats} seat(s) · ₹{booking.total_price}</p>
                </div>
                <span className={`badge ${
                  booking.status === 'confirmed' ? 'badge-success' :
                  booking.status === 'cancelled' ? 'badge-danger' :
                  booking.status === 'completed' ? 'badge-info' :
                  'badge-warning'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ title, value, color }) {
  const colors = {
    primary: 'from-primary/20 to-primary/5 border-primary/30',
    success: 'from-success/20 to-success/5 border-success/30',
    accent: 'from-accent/20 to-accent/5 border-accent/30',
  }

  return (
    <div className={`glass-card p-5 border bg-gradient-to-br ${colors[color]}`}>
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}
