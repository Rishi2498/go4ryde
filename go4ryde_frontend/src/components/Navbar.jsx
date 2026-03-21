import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-surface/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-primary/30 transition-shadow">
              G4
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              GO4RYDE
            </span>
          </Link>

          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard">Dashboard</NavLink>
            {user.role === 'driver' && <NavLink to="/create-ride">Create Ride</NavLink>}
            <NavLink to="/search">Search Rides</NavLink>
            <NavLink to="/bookings">My Bookings</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          </div>

          {/* User section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-3">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
    >
      {children}
    </Link>
  )
}
