import { useQuery } from '@tanstack/react-query';
import { Receipt, X } from 'lucide-react';
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
import { useState } from 'react';

export function TransactionsPage() {
  const [selectedTxnId, setSelectedTxnId] = useState<number | null>(null);

  const status = useTransactionFiltersStore((s) => s.status);
  const providerId = useTransactionFiltersStore((s) => s.providerId);
  const page = useTransactionFiltersStore((s) => s.page);
  const setStatus = useTransactionFiltersStore((s) => s.setStatus);
  const setProviderId = useTransactionFiltersStore((s) => s.setProviderId);
  const setPage = useTransactionFiltersStore((s) => s.setPage);
  const clearFilters = useTransactionFiltersStore((s) => s.clear);

  const hasActiveFilters = Boolean(status || providerId);

  const { data: providers } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['transactions', { page, status, providerId }],
    queryFn: () => getTransactions({ page, status, provider_id: providerId }),
    meta: { silent: true },
  });

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-xl font-semibold text-text-main'>Transactions</h1>
        <p className='text-sm text-text-muted mt-0.5'>
          Full log of every credit-load attempt, from STK push to final outcome.
        </p>
      </div>

      <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-4'>
        <Select
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'success', label: 'Success' },
            { value: 'failed', label: 'Failed' },
          ]}
          placeholder='All statuses'
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          containerClassName='sm:max-w-[180px]'
        />
        <Select
          options={
            providers?.map((p) => ({ value: String(p.id), label: p.name })) ??
            []
          }
          placeholder='All providers'
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          containerClassName='sm:max-w-[180px]'
        />
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className='inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-text-main cursor-pointer transition-colors sm:ml-1'>
            <X className='h-3.5 w-3.5' /> Clear filters
          </button>
        )}
      </div>

      <Card>
        <CardBody className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
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
                  <div className='flex flex-col items-center gap-2'>
                    <Receipt className='h-8 w-8 text-text-muted' />
                    {hasActiveFilters
                      ? 'No transactions match your filters.'
                      : 'No transactions yet.'}
                  </div>
                </TableEmpty>
              ) : (
                data.data.map((txn) => (
                  <TableRow
                    key={txn.id}
                    className='cursor-pointer'
                    onClick={() => setSelectedTxnId(txn.id)}>
                    <TableCell className='font-medium'>#{txn.id}</TableCell>
                    <TableCell>{txn.client.name ?? txn.client.login}</TableCell>
                    <TableCell className='text-text-muted'>
                      {txn.provider.name}
                    </TableCell>
                    <TableCell>KES {txn.amount_kes}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={statusToVariant(txn.status)}
                        size='sm'>
                        {stageLabel(txn.stage)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className='text-text-muted'>
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
