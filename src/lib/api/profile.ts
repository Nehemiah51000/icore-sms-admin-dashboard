import { api } from '../api';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function getProfile() {
  return api.get<Admin>('/admin/profile');
}

export function updateProfile(payload: { name: string; email: string }) {
  return api.put<Admin>('/admin/profile', payload);
}

export function updatePassword(payload: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) {
  return api.put<{ message: string }>('/admin/profile/password', payload);
}
