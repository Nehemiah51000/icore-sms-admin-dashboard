import { api } from '../api';

export interface Client {
  id: number;
  name: string | null;
  email: string | null;
  phone: string;
  login: string;
  provider_id: number;
  provider_login_name: string;
  status: 'active' | 'suspended';
  low_balance_threshold: number | null;
  low_balance_flagged_at: string | null;
  created_at: string;
  provider?: { id: number; name: string; slug: string };
}

export interface ClientPayload {
  name?: string;
  email?: string;
  phone: string;
  login: string;
  password?: string;
  provider_id: number;
  provider_login_name: string;
  status: 'active' | 'suspended';
  low_balance_threshold?: number | null;
}

export function getClients() {
  return api.get<Client[]>('/admin/clients');
}

export function createClient(payload: ClientPayload) {
  return api.post<Client>('/admin/clients', payload);
}

export function updateClient(id: number, payload: Partial<ClientPayload>) {
  return api.put<Client>(`/admin/clients/${id}`, payload);
}

export function deleteClient(id: number) {
  return api.delete<{ message: string }>(`/admin/clients/${id}`);
}
