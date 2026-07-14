import { api } from '../api';

export interface Settings {
  id: number;
  company_name: string | null;
  support_email: string | null;
  support_phone: string | null;
  paybill_display_number: string | null;
  business_hours: string | null;
}

export function getSettings() {
  return api.get<Settings>('/admin/settings');
}

export function updateSettings(payload: Partial<Settings>) {
  return api.put<Settings>('/admin/settings', payload);
}
