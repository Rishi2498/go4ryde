import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sendOTP, verifyOTP } from '../services/authService'

export default function LoginPage() {
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = { email }
      if (isNewUser) {
        data.name = name
        data.phone_number = phone
      }
      await sendOTP(data)
      setStep('otp')
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send OTP'
      if (msg.includes('Phone number and Name are required')) {
        setIsNewUser(true)
        setError('New user — please fill in your name and phone number.')
      } else {
        setError(msg)
      }
    }
    setLoading(false)
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await verifyOTP({ email, otp })
      login({ access: res.data.access, refresh: res.data.refresh }, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-xl animate-pulse-glow">
            <span className="text-2xl font-black text-white">G4</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
            GO4RYDE
          </h1>
          <p className="text-gray-400 mt-2">Smart Carpooling for Indian Cities</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {step === 'email' ? 'Welcome Back' : 'Enter OTP'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {isNewUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                    <input
                      id="name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
                    <input
                      id="phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </>
              )}

              <button id="send-otp-btn" type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>

              {!isNewUser && (
                <p className="text-center text-sm text-gray-400">
                  New user?{' '}
                  <button type="button" onClick={() => setIsNewUser(true)} className="text-primary-light hover:underline">
                    Register here
                  </button>
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <p className="text-sm text-gray-400 mb-3">
                OTP sent to <span className="text-primary-light font-medium">{email}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">OTP Code</label>
                <input
                  id="otp-input"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field text-center text-2xl tracking-[0.5em]"
                  placeholder="------"
                  maxLength={6}
                  required
                />
              </div>
              <button id="verify-otp-btn" type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                className="btn-secondary w-full"
              >
                ← Back
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Check your terminal console for the OTP (dev mode)
        </p>
      </div>
    </div>
  )
}
