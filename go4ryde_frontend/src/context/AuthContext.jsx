import { createContext, useContext, useState, useEffect } from 'react'
import { getProfile } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')

    return savedUser
      ? JSON.parse(savedUser)
      : null
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')

    if (token) {
      getProfile()
        .then((res) => {
          setUser(res.data)

          localStorage.setItem(
            'user',
            JSON.stringify(res.data)
          )
        })
        .catch(() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (tokens, userData) => {
    localStorage.setItem(
      'access_token',
      tokens.access
    )

    localStorage.setItem(
      'refresh_token',
      tokens.refresh
    )

    localStorage.setItem(
      'user',
      JSON.stringify(userData)
    )

    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)