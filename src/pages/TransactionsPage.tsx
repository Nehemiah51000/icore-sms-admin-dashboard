import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt, Search, Calendar, X } from 'lucide-react';
import { getTransactions } from '../lib/api/transactions';
import { getProviders } from '../lib/api/providers';
import { statusToVariant, stageLabel } from '../lib/statusMappings';
import { ApiError } from '../lib/api';
import { useTransactionFiltersStore } from '../stores/transactionFiltersStore';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  TableSkeleton,
} from '../ui/Table/Table';
import { Pagination } from '../ui/Pagination/Pagination';
import { StatusBadge } from '../ui/StatusBadge/StatusBadge';
import { Select } from '../ui/Select/Select';
import { Card, CardBody } from '../ui/Card/Card';
import { TransactionDetailModal } from '../ui/TransactionDetailModal/TransactionDetailModal';
import { QueryErrorState } from '../ui/QueryErrorState/QueryErrorState';

type DatePreset = 'all' | '7d' | '30d' | 'custom';

export function TransactionsPage() {
  const [selectedTxnId, setSelectedTxnId] = useState<number | null>(null);

  // Stubs for search & date range filters (To be wired to backend params)
  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const status = useTransactionFiltersStore((s) => s.status);
  const providerId = useTransactionFiltersStore((s) => s.providerId);
  const page = useTransactionFiltersStore((s) => s.page);
  const setStatus = useTransactionFiltersStore((s) => s.setStatus);
  const setProviderId = useTransactionFiltersStore((s) => s.setProviderId);
  const setPage = useTransactionFiltersStore((s) => s.setPage);
  const clearFilters = useTransactionFiltersStore((s) => s.clear);

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const today = new Date();

    if (preset === '7d') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === '30d') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleClearAll = () => {
    clearFilters();
    setSearchQuery('');
    handleDatePresetChange('all');
  };

  const hasActiveFilters = Boolean(
    status || providerId || searchQuery || startDate || endDate,
  );

  const { data: providers } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
  });

  // Pass filter stubs in query key so updating them triggers server re-fetch once wired
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      'transactions',
      { page, status, providerId, searchQuery, startDate, endDate },
    ],
    queryFn: () => getTransactions({ page, status, provider_id: providerId }),
    meta: { silent: true },
  });

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-xl font-bold text-text-main tracking-tight'>
            Transactions
          </h1>
          <p className='text-sm text-text-muted mt-0.5'>
            Full log of every credit-load attempt, from STK push to final
            outcome.
          </p>
        </div>
      </div>

      {/* --- Filter Bar Header --- */}
      <div className='bg-bg-surface border border-border-main rounded-2xl p-4 shadow-xs space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          {/* Search Input Stub */}
          <div className='relative flex-1 min-w-60 max-w-md'>
            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by Client Name or Transaction ID...'
              className='w-full bg-bg-base border border-border-main rounded-xl pl-10 pr-4 py-2 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-navy-500/20 transition-all'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main'>
                <X className='h-3.5 w-3.5' />
              </button>
            )}
          </div>

          {/* Quick Date Presets */}
          <div className='flex items-center gap-1 bg-bg-base p-1 rounded-xl border border-border-main text-xs font-medium'>
            {(['all', '7d', '30d', 'custom'] as DatePreset[]).map((type) => (
              <button
                key={type}
                onClick={() => handleDatePresetChange(type)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  datePreset === type
                    ? 'bg-navy-500 text-white shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text-main'
                }`}>
                {type === 'all'
                  ? 'All Time'
                  : type === '7d'
                    ? '7 Days'
                    : type === '30d'
                      ? '30 Days'
                      : 'Custom Range'}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns & Custom Date Selectors */}
        <div className='pt-3 border-t border-border-main/60 flex flex-wrap items-center gap-3'>
          <Select
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'success', label: 'Success' },
              { value: 'failed', label: 'Failed' },
            ]}
            placeholder='All Statuses'
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            containerClassName='sm:max-w-[160px]'
          />

          <Select
            options={
              providers?.map((p) => ({ value: String(p.id), label: p.name })) ??
              []
            }
            placeholder='All Providers'
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            containerClassName='sm:max-w-[160px]'
          />

          {datePreset === 'custom' && (
            <div className='flex items-center gap-2 animate-page-in'>
              <div className='flex items-center gap-2 bg-bg-base border border-border-main px-3 py-1.5 rounded-xl text-xs'>
                <Calendar className='h-3.5 w-3.5 text-text-muted' />
                <span className='text-text-muted'>From:</span>
                <input
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className='bg-transparent text-text-main focus:outline-none'
                />
              </div>
              <div className='flex items-center gap-2 bg-bg-base border border-border-main px-3 py-1.5 rounded-xl text-xs'>
                <Calendar className='h-3.5 w-3.5 text-text-muted' />
                <span className='text-text-muted'>To:</span>
                <input
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className='bg-transparent text-text-main focus:outline-none'
                />
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className='inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 cursor-pointer transition-colors ml-auto'>
              <X className='h-3.5 w-3.5' /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* --- Data Table --- */}
      <Card className='shadow-xs border-border-main overflow-hidden'>
        <CardBody className='p-0'>
          <Table>
            <TableHeader>
              <TableRow className='bg-bg-base/50'>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isError ? (
                <TableEmpty colSpan={6}>
                  <QueryErrorState
                    message={
                      error instanceof ApiError ? error.message : undefined
                    }
                    onRetry={() => refetch()}
                  />
                </TableEmpty>
              ) : isLoading ? (
                <TableSkeleton rows={6} columns={6} />
              ) : !data?.data.length ? (
                <TableEmpty colSpan={6}>
                  <div className='flex flex-col items-center gap-2 py-8'>
                    <Receipt className='h-8 w-8 text-text-muted' />
                    <p className='text-sm font-medium text-text-main'>
                      {hasActiveFilters
                        ? 'No transactions match your filters.'
                        : 'No transactions logged yet.'}
                    </p>
                  </div>
                </TableEmpty>
              ) : (
                data.data.map((txn) => (
                  <TableRow
                    key={txn.id}
                    className='cursor-pointer hover:bg-bg-surface-hover/80 transition-colors'
                    onClick={() => setSelectedTxnId(txn.id)}>
                    <TableCell className='font-mono text-xs font-semibold text-text-main'>
                      #{txn.id}
                    </TableCell>
                    <TableCell className='font-medium text-text-main'>
                      {txn.client.name ?? txn.client.login}
                    </TableCell>
                    <TableCell className='text-text-muted'>
                      {txn.provider.name}
                    </TableCell>
                    <TableCell className='font-semibold text-text-main'>
                      KES {Number(txn.amount_kes).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={statusToVariant(txn.status)}
                        size='sm'
                        className='text-text-main'>
                        {stageLabel(txn.stage)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className='text-text-muted text-xs font-mono'>
                      {new Date(txn.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && data.total > 0 && (
            <Pagination
              currentPage={data.current_page}
              lastPage={data.last_page}
              total={data.total}
              perPage={data.per_page}
              onPageChange={setPage}
            />
          )}
        </CardBody>
      </Card>

      <TransactionDetailModal
        transactionId={selectedTxnId}
        onClose={() => setSelectedTxnId(null)}
      />
    </div>
  );
}
