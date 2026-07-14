import { api } from '../api';

export interface Transaction {
  id: number;
  client_id: number;
  provider_id: number;
  amount_kes: string;
  credits_requested: number;
  mpesa_checkout_request_id: string | null;
  mpesa_receipt_number: string | null;
  mpesa_phone: string;
  stage: 'stk_initiated' | 'payment_confirmed' | 'credit_loaded' | 'failed';
  status: 'pending' | 'success' | 'failed';
  failure_reason: string | null;
  provider_response: Record<string, unknown> | null;
  created_at: string;
  client: { id: number; name: string | null; login: string; phone: string };
  provider: { id: number; name: string; slug: string };
}

export interface TransactionFilters {
  status?: string;
  provider_id?: string;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export function getTransactions(filters: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.provider_id) params.set('provider_id', filters.provider_id);
  if (filters.page) params.set('page', String(filters.page));

  const query = params.toString();
  return api.get<PaginatedResponse<Transaction>>(
    `/admin/transactions${query ? `?${query}` : ''}`,
  );
}

export function getTransaction(id: number) {
  return api.get<Transaction>(`/admin/transactions/${id}`);
}
