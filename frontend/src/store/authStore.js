import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      venue: null,
      isAuthenticated: false,
      login: (token, venue) => set({ token, venue, isAuthenticated: true }),
      logout: () => set({ token: null, venue: null, isAuthenticated: false }),
    }),
    {
      name: 'scanpay-auth-storage',
    }
  )
);
