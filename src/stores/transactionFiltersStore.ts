import { create } from 'zustand';

interface TransactionFiltersState {
  status: string;
  providerId: string;
  page: number;
  setStatus: (status: string) => void;
  setProviderId: (providerId: string) => void;
  setPage: (page: number) => void;
  clear: () => void;
}

export const useTransactionFiltersStore = create<TransactionFiltersState>(
  (set) => ({
    status: '',
    providerId: '',
    page: 1,
    // Changing either filter resets to page 1 — avoids landing on a page
    // number that doesn't exist in the newly-filtered result set.
    setStatus: (status) => set({ status, page: 1 }),
    setProviderId: (providerId) => set({ providerId, page: 1 }),
    setPage: (page) => set({ page }),
    clear: () => set({ status: '', providerId: '', page: 1 }),
  }),
);
