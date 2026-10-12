import React, { createContext, useState, useEffect, useContext } from 'react'
import { login as loginApi, getMe } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('busbd_token')
    if (token) {
      getMe()
        .then(res => setUser(res.data.data.user))
        .catch(() => {
          localStorage.removeItem('busbd_token')
          localStorage.removeItem('busbd_user')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const res = await loginApi(credentials)
    const { user: loggedInUser, token } = res.data.data
    localStorage.setItem('busbd_token', token)
    localStorage.setItem('busbd_user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    return loggedInUser
  }

  const logout = () => {
    localStorage.removeItem('busbd_token')
    localStorage.removeItem('busbd_user')
    setUser(null)
  }

  const value = { user, loading, login, logout, isAuthenticated: !!user }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
