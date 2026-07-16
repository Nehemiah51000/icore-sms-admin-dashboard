import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getProviders,
  deleteProvider,
  type Provider,
} from '../lib/api/providers';
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
import { StatusBadge } from '../ui/StatusBadge/StatusBadge';
import { Button } from '../ui/Button/Button';
import { Card, CardBody } from '../ui/Card/Card';
import { ProviderFormModal } from '../ui/ProviderFormModal/ProviderFormModal';
import { ConfirmDeleteModal } from '../ui/ConfirmDeleteModal/ConfirmDeleteModal';
import { QueryErrorState } from '../ui/QueryErrorState/QueryErrorState';

export function ProvidersPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<Provider | null>(
    null,
  );

  const {
    data: providers,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
    meta: { silent: true }, // has its own inline error state below
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast.success('Provider deleted.');
      setDeletingProvider(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Could not delete provider.',
      );
    },
  });

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-text-main'>Providers</h1>
          <p className='text-sm text-text-muted mt-0.5'>
            Manage the SMS reseller platforms clients buy credit from.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProvider(null);
            setFormOpen(true);
          }}>
          <Plus className='h-4 w-4' /> Add Provider
        </Button>
      </div>

      <Card>
        <CardBody className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Base URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isError ? (
                <TableEmpty colSpan={5}>
                  <QueryErrorState
                    message={
                      error instanceof ApiError ? error.message : undefined
                    }
                    onRetry={() => refetch()}
                  />
                </TableEmpty>
              ) : isLoading ? (
                <TableSkeleton rows={3} columns={5} />
              ) : !providers?.length ? (
                <TableEmpty colSpan={5}>
                  <div className='flex flex-col items-center gap-2'>
                    <Building2 className='h-8 w-8 text-text-muted' />
                    No providers yet. Add your first one to get started.
                  </div>
                </TableEmpty>
              ) : (
                providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className='font-medium'>
                      {provider.name}
                    </TableCell>
                    <TableCell className='text-text-muted'>
                      {provider.slug}
                    </TableCell>
                    <TableCell className='text-text-muted max-w-xs truncate'>
                      {provider.base_url}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          provider.status === 'active' ? 'success' : 'pending'
                        }>
                        {provider.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-1'>
                        <button
                          onClick={() => {
                            setEditingProvider(provider);
                            setFormOpen(true);
                          }}
                          className='p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-surface-hover cursor-pointer transition-colors'
                          aria-label='Edit'>
                          <Pencil className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => setDeletingProvider(provider)}
                          className='p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-500/10 cursor-pointer transition-colors'
                          aria-label='Delete'>
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <ProviderFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        provider={editingProvider}
      />

      <ConfirmDeleteModal
        open={Boolean(deletingProvider)}
        onClose={() => setDeletingProvider(null)}
        onConfirm={() =>
          deletingProvider && deleteMutation.mutate(deletingProvider.id)
        }
        loading={deleteMutation.isPending}
        title='Delete this provider?'
        description={`This will permanently remove ${deletingProvider?.name}. Providers with clients assigned to them can't be deleted — remove or reassign those clients first.`}
      />
    </div>
  );
}
