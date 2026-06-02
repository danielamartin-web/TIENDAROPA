import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from '@/lib/constants';

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  username: string | null;
  customerName: string | null;
  token: string | null;
  tokenExpiresAt: number | null;
  loginError: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  customerLogin: (name: string) => void;
  logout: () => void;
  checkSession: () => void;
}

function isExpired(expiresAt: number | null): boolean {
  if (!expiresAt) return true;
  return Date.now() >= expiresAt;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isAdmin: false,
      isCustomer: false,
      username: null,
      customerName: null,
      token: null,
      tokenExpiresAt: null,
      loginError: null,

      login: async (username, password) => {
        set({ loginError: null });
        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          if (!res.ok) {
            const msg = res.status === 401 ? 'Usuario o contrasena incorrectos' : 'Error al iniciar sesion';
            set({ loginError: msg });
            return false;
          }

          const data = (await res.json()) as { token: string; username: string };
          set({
            isAuthenticated: true,
            isAdmin: true,
            isCustomer: false,
            username: data.username,
            customerName: null,
            token: data.token,
            tokenExpiresAt: Date.now() + TOKEN_TTL_MS,
            loginError: null,
          });
          return true;
        } catch {
          set({ loginError: 'No se pudo conectar con el servidor' });
          return false;
        }
      },

      customerLogin: (name: string) => {
        set({
          isAuthenticated: true,
          isAdmin: false,
          isCustomer: true,
          username: null,
          customerName: name,
          token: null,
          tokenExpiresAt: Date.now() + TOKEN_TTL_MS,
          loginError: null,
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
          tokenExpiresAt: null,
          loginError: null,
        }),

      checkSession: () => {
        const { tokenExpiresAt, isAuthenticated } = get();
        if (isAuthenticated && isExpired(tokenExpiresAt)) {
          get().logout();
        }
      },
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
        tokenExpiresAt: state.tokenExpiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.tokenExpiresAt && isExpired(state.tokenExpiresAt)) {
          state.logout();
        }
      },
    }
  )
);
