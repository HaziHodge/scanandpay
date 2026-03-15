import { create } from 'zustand'

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  venue: JSON.parse(localStorage.getItem('venue') || 'null'),
  setAuth: (token, venue) => {
    localStorage.setItem('token', token)
    localStorage.setItem('venue', JSON.stringify(venue))
    set({ token, venue })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('venue')
    set({ token: null, venue: null })
  }
}))

export default useAuthStore
