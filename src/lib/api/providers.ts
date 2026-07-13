import { api } from '../api';

export interface Provider {
  id: number;
  name: string;
  slug: string;
  base_url: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface ProviderPayload {
  name: string;
  slug: string;
  base_url: string;
  credentials: Record<string, string>;
  status: 'active' | 'inactive';
}

export function getProviders() {
  return api.get<Provider[]>('/admin/providers');
}

export function createProvider(payload: ProviderPayload) {
  return api.post<Provider>('/admin/providers', payload);
}

export function updateProvider(id: number, payload: Partial<ProviderPayload>) {
  return api.put<Provider>(`/admin/providers/${id}`, payload);
}

export function deleteProvider(id: number) {
  return api.delete<{ message: string }>(`/admin/providers/${id}`);
}
