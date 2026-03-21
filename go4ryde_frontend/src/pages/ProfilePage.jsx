import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { registerDriver } from '../services/authService'

export default function ProfilePage() {
  const { user } = useAuth()
  const [showDriverForm, setShowDriverForm] = useState(false)
  const [driverForm, setDriverForm] = useState({
    vehicle_type: 'car',
    vehicle_model_name: '',
    fuel_type: 'petrol',
    mileage: '',
    capacity: 4,
  })
  const [dlFile, setDlFile] = useState(null)
  const [rcFile, setRcFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const handleDriverSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMsg('')
    setLoading(true)

    const formData = new FormData()
    Object.entries(driverForm).forEach(([k, v]) => formData.append(k, v))
    if (dlFile) formData.append('dl_document', dlFile)
    if (rcFile) formData.append('rc_document', rcFile)

    try {
      await registerDriver(formData)
      setMsg('Driver registration submitted! Awaiting admin approval.')
      setShowDriverForm(false)
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">👤 My Profile</h1>

      {/* User info */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-gray-400">{user?.email}</p>
            <p className="text-gray-400">{user?.phone_number}</p>
          </div>
        </div>
        <span className={`badge ${user?.role === 'driver' ? 'badge-success' : user?.role === 'admin' ? 'badge-danger' : 'badge-info'}`}>
          {user?.role}
        </span>
      </div>

      {/* Become a driver */}
      {user?.role === 'passenger' && !showDriverForm && (
        <button onClick={() => setShowDriverForm(true)} className="btn-primary w-full mb-6">
          🚗 Become a Driver
        </button>
      )}

      {msg && <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm">{msg}</div>}
      {error && <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">{error}</div>}

      {showDriverForm && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Driver Registration</h3>
          <form onSubmit={handleDriverSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Vehicle Type</label>
                <select value={driverForm.vehicle_type} onChange={(e) => setDriverForm(f => ({ ...f, vehicle_type: e.target.value }))} className="input-field">
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Fuel Type</label>
                <select value={driverForm.fuel_type} onChange={(e) => setDriverForm(f => ({ ...f, fuel_type: e.target.value }))} className="input-field">
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Vehicle Model & Name</label>
              <input value={driverForm.vehicle_model_name} onChange={(e) => setDriverForm(f => ({ ...f, vehicle_model_name: e.target.value }))} className="input-field" placeholder="e.g. Maruti Swift ZXI" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mileage (km/l)</label>
                <input type="number" step="0.1" value={driverForm.mileage} onChange={(e) => setDriverForm(f => ({ ...f, mileage: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Capacity (seats)</label>
                <input type="number" min="1" value={driverForm.capacity} onChange={(e) => setDriverForm(f => ({ ...f, capacity: e.target.value }))} className="input-field" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Driving License (DL)</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => setDlFile(e.target.files[0])} className="input-field file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary/20 file:text-primary-light file:cursor-pointer" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Registration Certificate (RC)</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => setRcFile(e.target.files[0])} className="input-field file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary/20 file:text-primary-light file:cursor-pointer" required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Submitting...' : 'Submit Driver Registration'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
