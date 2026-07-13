import { api } from '../api';

export interface LowBalanceClient {
  id: number;
  name: string | null;
  login: string;
  provider_id: number;
  low_balance_flagged_at: string;
  provider: {
    id: number;
    name: string;
    slug: string;
  };
}

export function getLowBalanceClients() {
  return api.get<LowBalanceClient[]>('/admin/dashboard/low-balance-clients');
}
