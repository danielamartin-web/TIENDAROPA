import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '@/lib/constants';

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  username: string | null;
  token: string | null;
  login: (username: string, password: string) => boolean;
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
      username: null,
      token: null,

      login: (username, password) => {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          const token = generateToken(username);
          set({
            isAuthenticated: true,
            isAdmin: true,
            username,
            token,
          });
          return true;
        }
        return false;
      },

      logout: () =>
        set({
          isAuthenticated: false,
          isAdmin: false,
          username: null,
          token: null,
        }),
    }),
    {
      name: 'marda-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        username: state.username,
        token: state.token,
      }),
    }
  )
);
