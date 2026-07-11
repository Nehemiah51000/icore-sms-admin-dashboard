import { api } from '../api';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LoginResponse {
  admin: Admin;
  token: string;
}

export function loginAdmin(email: string, password: string) {
  return api.post<LoginResponse>('/admin/login', { email, password });
}
