import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      login: (user: User, token: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true, isLoading: false });
      },
      
      logout: () => {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear cart data
        const { useCartStore } = require('../store/useCartStore');
        if (useCartStore && useCartStore.getState) {
          useCartStore.getState().resetCart();
        }
        
        set({ user: null, isAuthenticated: false });
      },
      
      checkAuth: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({ user, isAuthenticated: true, isLoading: false });
          } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } else {
          set({ isAuthenticated: false, isLoading: false });
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);