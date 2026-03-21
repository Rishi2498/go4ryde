import { useState, useEffect } from 'react'
import { getUserBookings, cancelBooking } from '../services/bookingService'
import { Link } from 'react-router-dom'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = () => {
    getUserBookings()
      .then((res) => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookings() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    try {
      await cancelBooking(id, 'User requested cancellation')
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel')
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">📋 My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-400 mb-4">No bookings yet.</p>
          <Link to="/search" className="btn-primary">Search Rides</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {b.ride_details?.source_name} → {b.ride_details?.destination_name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatDate(b.ride_details?.departure_time)} · {b.seats} seat(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-light">₹{b.total_price}</p>
                  <span className={`badge mt-1 ${
                    b.status === 'confirmed' ? 'badge-success' :
                    b.status === 'cancelled' ? 'badge-danger' :
                    b.status === 'completed' ? 'badge-info' :
                    'badge-warning'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>

              {(b.status === 'pending' || b.status === 'confirmed') && (
                <div className="mt-4 flex gap-3">
                  <Link to={`/rides/${b.ride_details?.id}`} className="btn-secondary text-sm py-2 px-4">View Ride</Link>
                  <button onClick={() => handleCancel(b.id)} className="btn-danger text-sm py-2 px-4">Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
