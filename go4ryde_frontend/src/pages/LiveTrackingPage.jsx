import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LiveTrackingPage() {
  const { rideId } = useParams()
  const { user } = useAuth()
  const [location, setLocation] = useState(null)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/tracking/${rideId}/`)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setLocation({ lat: data.lat, lng: data.lng })
    }

    return () => ws.close()
  }, [rideId])

  // Driver sends location
  useEffect(() => {
    if (user?.role !== 'driver' || !connected) return

    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        const msg = JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        wsRef.current?.send(msg)
      })
    }, 3000)

    return () => clearInterval(intervalId)
  }, [user, connected])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">📍 Live Tracking — Ride #{rideId}</h1>

      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-danger'}`} />
          <span className="text-sm text-gray-300">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>

        {location ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Latitude</p>
                <p className="text-xl font-mono text-white">{location.lat.toFixed(6)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Longitude</p>
                <p className="text-xl font-mono text-white">{location.lng.toFixed(6)}</p>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="w-full h-64 rounded-xl bg-surface-light border border-white/10 flex items-center justify-center">
              <p className="text-gray-400 text-sm">
                🗺️ Map integration available — add your Google Maps API key to enable
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Waiting for location updates...</p>
        )}

        {user?.role === 'driver' && (
          <p className="text-sm text-gray-400 mt-4">
            📡 Your location is being shared with passengers every 3 seconds.
          </p>
        )}
      </div>
    </div>
  )
}
