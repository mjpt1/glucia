import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  phone: string;
  fullName?: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
        }
      },
      setUser: (user) => set({ user }),
      logout: () => {
        if (typeof window !== 'undefined') localStorage.clear();
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    { name: 'glucia-auth', partialize: (state) => ({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken }) },
  ),
);
