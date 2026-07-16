import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt } from 'lucide-react';
import { getTransactions } from '../lib/api/transactions';
import { getProviders } from '../lib/api/providers';
import { statusToVariant, stageLabel } from '../lib/statusMappings';
import { ApiError } from '../lib/api';
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

export function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [providerId, setProviderId] = useState('');
  const [selectedTxnId, setSelectedTxnId] = useState<number | null>(null);

  const { data: providers } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['transactions', { page, status, providerId }],
    queryFn: () => getTransactions({ page, status, provider_id: providerId }),
    meta: { silent: true },
  });

  function handleFilterChange(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(1); // reset to page 1 whenever a filter changes
  }

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-xl font-semibold text-text-main'>Transactions</h1>
        <p className='text-sm text-text-muted mt-0.5'>
          Full log of every credit-load attempt, from STK push to final outcome.
        </p>
      </div>

      <div className='flex flex-col sm:flex-row gap-3 mb-4'>
        <Select
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'success', label: 'Success' },
            { value: 'failed', label: 'Failed' },
          ]}
          placeholder='All statuses'
          value={status}
          onChange={(e) => handleFilterChange(setStatus, e.target.value)}
          containerClassName='sm:max-w-[180px]'
        />
        <Select
          options={
            providers?.map((p) => ({ value: String(p.id), label: p.name })) ??
            []
          }
          placeholder='All providers'
          value={providerId}
          onChange={(e) => handleFilterChange(setProviderId, e.target.value)}
          containerClassName='sm:max-w-[180px]'
        />
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
                    No transactions match your filters.
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
