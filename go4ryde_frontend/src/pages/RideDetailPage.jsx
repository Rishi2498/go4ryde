import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRideDetail } from '../services/rideService'
import { createBooking } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'

export default function RideDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ride, setRide] = useState(null)
  const [seats, setSeats] = useState(1)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getRideDetail(id)
      .then((res) => setRide(res.data))
      .catch(() => setError('Failed to load ride'))
      .finally(() => setLoading(false))
  }, [id])

  const handleBook = async () => {
    setError('')
    setSuccess('')
    setBooking(true)
    try {
      await createBooking({ ride_id: parseInt(id), seats })
      setSuccess('Booking created! Redirecting to bookings...')
      setTimeout(() => navigate('/bookings'), 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed')
    }
    setBooking(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!ride) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">Ride not found.</div>
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="glass-card p-8">
        {/* Route */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex flex-col items-center mt-1">
            <div className="w-3 h-3 rounded-full bg-success" />
            <div className="w-0.5 h-12 bg-gray-600" />
            <div className="w-3 h-3 rounded-full bg-danger" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{ride.source_name}</h2>
            <p className="text-sm text-gray-400 mt-1">↓</p>
            <h2 className="text-xl font-bold text-white">{ride.destination_name}</h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary-light">₹{ride.price_per_seat}</p>
            <p className="text-sm text-gray-400">per seat</p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <DetailBox label="Departure" value={formatDate(ride.departure_time)} />
          <DetailBox label="Available Seats" value={`${ride.available_seats} / ${ride.total_seats}`} />
          <DetailBox label="Ride Type" value={ride.ride_type || 'Local'} />
          <DetailBox label="Women Only" value={ride.women_only ? 'Yes' : 'No'} />
        </div>

        {/* Driver info */}
        {ride.driver && (
          <div className="glass-card p-4 mb-6 bg-white/5">
            <p className="text-sm text-gray-400 mb-1">Driver</p>
            <p className="text-white font-semibold">{ride.driver.user?.name}</p>
            <p className="text-sm text-gray-400">{ride.driver.vehicle_model_name} · {ride.driver.vehicle_type}</p>
          </div>
        )}

        {error && <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm">{success}</div>}

        {/* Booking section */}
        {user?.role !== 'driver' && ride.available_seats > 0 && ride.is_active && (
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Seats</label>
              <input
                type="number"
                min="1"
                max={ride.available_seats}
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
                className="input-field"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">Total</p>
              <p className="text-2xl font-bold text-white">₹{(ride.price_per_seat * seats).toFixed(2)}</p>
            </div>
            <button id="book-ride-btn" onClick={handleBook} disabled={booking} className="btn-primary py-3 px-8">
              {booking ? 'Booking...' : 'Book Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailBox({ label, value }) {
  return (
    <div className="bg-white/5 rounded-lg p-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-white font-medium capitalize">{value}</p>
    </div>
  )
}
