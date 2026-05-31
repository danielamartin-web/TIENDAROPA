import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '@/lib/constants';

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  username: string | null;
  customerName: string | null;
  token: string | null;
  login: (username: string, password: string) => boolean;
  customerLogin: (name: string) => void;
  logout: () => void;
}

// Simple JWT-like token generation (for demo purposes)
function generateToken(username: string): string {
  const payload = {
    username,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  return btoa(JSON.stringify(payload));
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isAdmin: false,
      isCustomer: false,
      username: null,
      customerName: null,
      token: null,

      login: (username, password) => {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          const token = generateToken(username);
          set({
            isAuthenticated: true,
            isAdmin: true,
            isCustomer: false,
            username,
            customerName: null,
            token,
          });
          return true;
        }
        return false;
      },

      customerLogin: (name: string) => {
        const token = generateToken(`customer-${name}`);
        set({
          isAuthenticated: true,
          isAdmin: false,
          isCustomer: true,
          username: null,
          customerName: name,
          token,
        });
      },

      logout: () =>
        set({
          isAuthenticated: false,
          isAdmin: false,
          isCustomer: false,
          username: null,
          customerName: null,
          token: null,
        }),
    }),
    {
      name: 'marda-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isCustomer: state.isCustomer,
        username: state.username,
        customerName: state.customerName,
        token: state.token,
      }),
    }
  )
);
