import { Link } from 'react-router-dom'

export default function RideCard({ ride }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="glass-card p-5 animate-fade-in" id={`ride-card-${ride.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <h3 className="text-white font-semibold text-lg">{ride.source_name}</h3>
          </div>
          <div className="ml-1 border-l-2 border-dashed border-gray-600 h-4" />
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-danger" />
            <h3 className="text-white font-semibold text-lg">{ride.destination_name}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-light">₹{ride.price_per_seat}</p>
          <p className="text-xs text-gray-400">per seat</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="badge badge-info">{ride.ride_type || 'Local'}</span>
        {ride.women_only && <span className="badge badge-warning">Women Only</span>}
        <span className="badge badge-success">{ride.available_seats} seats left</span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDate(ride.departure_time)}
        </div>
        <Link to={`/rides/${ride.id}`} className="btn-primary text-sm py-2 px-4">
          View Details →
        </Link>
      </div>
    </div>
  )
}
