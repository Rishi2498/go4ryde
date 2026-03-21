import { useState } from 'react'
import { searchRides } from '../services/rideService'
import RideCard from '../components/RideCard'

export default function SearchRidePage() {
  const [params, setParams] = useState({
    source_lat: '',
    source_lng: '',
    dest_lat: '',
    dest_lng: '',
    date_time: '',
    women_only: false,
    ride_type: '',
    vehicle_type: '',
  })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setParams((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSearched(true)

    try {
      const query = {
        source_lat: params.source_lat,
        source_lng: params.source_lng,
        dest_lat: params.dest_lat,
        dest_lng: params.dest_lng,
        date_time: new Date(params.date_time).toISOString(),
      }
      if (params.women_only) query.women_only = 'true'
      if (params.ride_type) query.ride_type = params.ride_type
      if (params.vehicle_type) query.vehicle_type = params.vehicle_type

      const res = await searchRides(query)
      setResults(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">🔍 Search Rides</h1>

      <div className="glass-card p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Source Lat</label>
              <input name="source_lat" type="number" step="any" value={params.source_lat} onChange={handleChange} className="input-field" placeholder="17.4400" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Source Lng</label>
              <input name="source_lng" type="number" step="any" value={params.source_lng} onChange={handleChange} className="input-field" placeholder="78.3489" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Dest Lat</label>
              <input name="dest_lat" type="number" step="any" value={params.dest_lat} onChange={handleChange} className="input-field" placeholder="17.4500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Dest Lng</label>
              <input name="dest_lng" type="number" step="any" value={params.dest_lng} onChange={handleChange} className="input-field" placeholder="78.3800" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date & Time</label>
              <input name="date_time" type="datetime-local" value={params.date_time} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ride Type</label>
              <select name="ride_type" value={params.ride_type} onChange={handleChange} className="input-field">
                <option value="">All</option>
                <option value="local">Local</option>
                <option value="intercity">Intercity</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Vehicle Type</label>
              <select name="vehicle_type" value={params.vehicle_type} onChange={handleChange} className="input-field">
                <option value="">All</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>
            <label className="flex items-end gap-2 pb-2 cursor-pointer">
              <input name="women_only" type="checkbox" checked={params.women_only} onChange={handleChange} className="w-5 h-5 accent-primary" />
              <span className="text-sm text-gray-300">Women Only</span>
            </label>
          </div>

          <button id="search-rides-btn" type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Searching...' : '🔍 Search'}
          </button>
        </form>
      </div>

      {error && <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm mb-4">{error}</div>}

      {searched && !loading && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            {results.length > 0 ? `${results.length} ride(s) found` : 'No rides found matching your criteria'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
