import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createRide } from '../services/rideService'

export default function CreateRidePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    ride_type: 'local',
    source_name: '',
    destination_name: '',
    source_lat: '',
    source_lng: '',
    dest_lat: '',
    dest_lng: '',
    departure_time: '',
    available_seats: 1,
    total_seats: 4,
    women_only: false,
    price_per_seat: '',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const payload = {
        ...form,
        source_lat: parseFloat(form.source_lat),
        source_lng: parseFloat(form.source_lng),
        dest_lat: parseFloat(form.dest_lat),
        dest_lng: parseFloat(form.dest_lng),
        available_seats: parseInt(form.available_seats),
        total_seats: parseInt(form.total_seats),
        price_per_seat: parseFloat(form.price_per_seat),
      }
      await createRide(payload)
      setSuccess('Ride created successfully!')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.[0] || 'Failed to create ride')
    }
    setLoading(false)
  }

  if (user?.role !== 'driver') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Drivers Only</h2>
          <p className="text-gray-400">You need a driver account to create rides.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Create a New Ride</h1>

      <div className="glass-card p-8">
        {error && <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Ride type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Ride Type</label>
            <select name="ride_type" value={form.ride_type} onChange={handleChange} className="input-field">
              <option value="local">Local</option>
              <option value="intercity">Intercity</option>
            </select>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Source Name</label>
              <input name="source_name" value={form.source_name} onChange={handleChange} className="input-field" placeholder="e.g. Hitech City, Hyderabad" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Destination Name</label>
              <input name="destination_name" value={form.destination_name} onChange={handleChange} className="input-field" placeholder="e.g. Gachibowli" required />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Src Lat</label>
              <input name="source_lat" type="number" step="any" value={form.source_lat} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Src Lng</label>
              <input name="source_lng" type="number" step="any" value={form.source_lng} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Dest Lat</label>
              <input name="dest_lat" type="number" step="any" value={form.dest_lat} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Dest Lng</label>
              <input name="dest_lng" type="number" step="any" value={form.dest_lng} onChange={handleChange} className="input-field" required />
            </div>
          </div>

          {/* Date & seats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Departure Date & Time</label>
              <input name="departure_time" type="datetime-local" value={form.departure_time} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Price per Seat (₹)</label>
              <input name="price_per_seat" type="number" step="0.01" value={form.price_per_seat} onChange={handleChange} className="input-field" placeholder="150" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Available Seats</label>
              <input name="available_seats" type="number" min="1" value={form.available_seats} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Total Seats</label>
              <input name="total_seats" type="number" min="1" value={form.total_seats} onChange={handleChange} className="input-field" required />
            </div>
          </div>

          {/* Women only */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input name="women_only" type="checkbox" checked={form.women_only} onChange={handleChange} className="w-5 h-5 rounded accent-primary" />
            <span className="text-sm text-gray-300">Women-only ride</span>
          </label>

          <button id="create-ride-btn" type="submit" disabled={loading} className="btn-primary w-full text-lg py-3">
            {loading ? 'Creating...' : '🚗 Create Ride'}
          </button>
        </form>
      </div>
    </div>
  )
}
