import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function AdminDashboardPage() {
  const { user } = useAuth()

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-4">🔒 Access Denied</h2>
          <p className="text-gray-400">Admin access required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-8">⚙️ Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminCard title="Manage Users" desc="View, edit, and manage all users" icon="👥" href="/admin" />
        <AdminCard title="Driver Approvals" desc="Review pending driver applications" icon="✅" href="/admin" />
        <AdminCard title="Monitor Rides" desc="View all active and past rides" icon="🚗" href="/admin" />
        <AdminCard title="Earnings & Commission" desc="Track platform revenue" icon="💰" href="/admin" />
        <AdminCard title="Disputes" desc="Handle user complaints and issues" icon="⚖️" href="/admin" />
        <AdminCard title="Fraud Detection" desc="Review suspicious activities" icon="🛡️" href="/admin" />
      </div>

      <div className="mt-8 glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Quick Access</h3>
        <p className="text-gray-400 text-sm">
          Use the Django Admin panel at{' '}
          <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noopener" className="text-primary-light hover:underline">
            /admin/
          </a>{' '}
          for full database management — driver approvals, user management, ride monitoring, and more.
        </p>
      </div>
    </div>
  )
}

function AdminCard({ title, desc, icon, href }) {
  return (
    <Link to={href} className="glass-card p-6 group cursor-pointer">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-white group-hover:text-primary-light transition-colors">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">{desc}</p>
    </Link>
  )
}
