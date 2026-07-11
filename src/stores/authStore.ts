import { create } from 'zustand';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  admin: Admin | null;
  token: string | null;
  setAuth: (admin: Admin, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  token: localStorage.getItem('icore_admin_token'),
  setAuth: (admin, token) => {
    localStorage.setItem('icore_admin_token', token);
    set({ admin, token });
  },
  logout: () => {
    localStorage.removeItem('icore_admin_token');
    set({ admin: null, token: null });
  },
}));
