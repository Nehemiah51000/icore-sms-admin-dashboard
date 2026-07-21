import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Search,
  X,
  Globe,
  Radio,
  ExternalLink,
} from 'lucide-react';
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

type StatusFilter = 'all' | 'active' | 'inactive';

export function ProvidersPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<Provider | null>(
    null,
  );

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const {
    data: providers,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
    meta: { silent: true },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast.success('Provider gateway deleted.');
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

  // Client-side filtering logic
  const filteredProviders = useMemo(() => {
    if (!providers) return [];
    return providers.filter((provider) => {
      const nameMatch = provider.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const slugMatch = provider.slug
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const urlMatch = provider.base_url
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesSearch = nameMatch || slugMatch || urlMatch;
      const matchesStatus =
        statusFilter === 'all' || provider.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [providers, searchQuery, statusFilter]);

  // Derived Summary Counts
  const activeCount =
    providers?.filter((p) => p.status === 'active').length ?? 0;

  return (
    <div className='space-y-6 animate-page-in'>
      {/* --- Top Header & Main Action --- */}
      <div className='bg-bg-surface border border-border-main/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-xl font-bold text-text-main tracking-tight'>
            Gateway Providers
          </h1>
          <p className='text-xs text-text-muted mt-1'>
            Configure SMS reseller platforms, base endpoint URLs, and routing
            integrations.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingProvider(null);
            setFormOpen(true);
          }}
          className='hover:scale-[1.02] active:scale-[0.98] transition-transform text-xs shadow-xs shrink-0'>
          <Plus className='h-4 w-4 mr-1.5' /> Add Provider Gateway
        </Button>
      </div>

      {/* --- Quick Metrics & Search Filter Bar --- */}
      <div className='bg-bg-surface border border-border-main rounded-2xl p-4 shadow-xs space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          {/* Search Bar Input */}
          <div className='relative flex-1 min-w-60 max-w-md'>
            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by provider name, slug, or base URL...'
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

          {/* Quick Status Filter Tabs */}
          <div className='flex items-center gap-1 bg-bg-base p-1 rounded-xl border border-border-main text-xs font-medium'>
            {(['all', 'active', 'inactive'] as StatusFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-navy-500 text-white shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text-main'
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Counter Summary Pills */}
        <div className='pt-3 border-t border-border-main/60 flex flex-wrap items-center gap-4 text-xs text-text-muted'>
          <div className='flex items-center gap-1.5'>
            <Building2 className='h-3.5 w-3.5 text-navy-500 dark:text-navy-300' />
            <span>
              Total Configured:{' '}
              <strong className='text-text-main'>
                {providers?.length ?? 0}
              </strong>
            </span>
          </div>
          <span className='text-border-main'>•</span>
          <div className='flex items-center gap-1.5'>
            <Radio className='h-3.5 w-3.5 text-success-500' />
            <span>
              Active Gateways:{' '}
              <strong className='text-text-main'>{activeCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* --- Data Table --- */}
      <Card className='shadow-xs border-border-main overflow-hidden'>
        <CardBody className='p-0'>
          <Table>
            <TableHeader>
              <TableRow className='bg-bg-base/50'>
                <TableHead className='pl-6'>Provider Name</TableHead>
                <TableHead>Identifier Slug</TableHead>
                <TableHead>Base Endpoint URL</TableHead>
                <TableHead>Gateway Status</TableHead>
                <TableHead className='text-right pr-6'>Actions</TableHead>
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
                <TableSkeleton rows={4} columns={5} />
              ) : !filteredProviders.length ? (
                <TableEmpty colSpan={5}>
                  <div className='flex flex-col items-center justify-center py-10 gap-2'>
                    <Building2 className='h-8 w-8 text-text-muted' />
                    <p className='text-sm font-semibold text-text-main'>
                      {searchQuery || statusFilter !== 'all'
                        ? 'No provider gateways match your filters.'
                        : 'No provider gateways added yet.'}
                    </p>
                    <p className='text-xs text-text-muted'>
                      {searchQuery || statusFilter !== 'all'
                        ? 'Try clearing your search query or switching tabs.'
                        : 'Click "Add Provider Gateway" above to establish a new connection.'}
                    </p>
                  </div>
                </TableEmpty>
              ) : (
                filteredProviders.map((provider) => (
                  <TableRow
                    key={provider.id}
                    className='hover:bg-bg-surface-hover/80 transition-colors'>
                    <TableCell className='pl-6 font-medium'>
                      <div className='flex items-center gap-3'>
                        <div className='h-8 w-8 rounded-lg bg-navy-500/10 text-navy-500 dark:text-navy-300 flex items-center justify-center font-bold text-xs shrink-0'>
                          {provider.name.charAt(0).toUpperCase()}
                        </div>
                        <span className='font-bold text-xs text-text-main'>
                          {provider.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className='text-xs font-mono text-text-muted'>
                      <span className='px-2 py-0.5 rounded-md bg-bg-base border border-border-main/60'>
                        {provider.slug}
                      </span>
                    </TableCell>

                    <TableCell className='text-xs font-mono text-text-muted max-w-xs truncate'>
                      <div className='flex items-center gap-1.5 group'>
                        <Globe className='h-3.5 w-3.5 text-text-muted shrink-0' />
                        <a
                          href={provider.base_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='truncate hover:text-navy-500 dark:hover:text-navy-300 hover:underline inline-flex items-center gap-1'>
                          {provider.base_url}
                          <ExternalLink className='h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity' />
                        </a>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={
                          provider.status === 'active' ? 'success' : 'pending'
                        }
                        size='sm'>
                        {provider.status}
                      </StatusBadge>
                    </TableCell>

                    <TableCell className='text-right pr-6'>
                      <div className='flex justify-end items-center gap-1'>
                        <button
                          onClick={() => {
                            setEditingProvider(provider);
                            setFormOpen(true);
                          }}
                          className='p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-surface-hover cursor-pointer transition-colors'
                          title='Edit Gateway Settings'
                          aria-label='Edit'>
                          <Pencil className='h-3.5 w-3.5' />
                        </button>
                        <button
                          onClick={() => setDeletingProvider(provider)}
                          className='p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-500/10 cursor-pointer transition-colors'
                          title='Delete Provider Gateway'
                          aria-label='Delete'>
                          <Trash2 className='h-3.5 w-3.5' />
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

      {/* --- Modals --- */}
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
        title='Delete Provider Gateway?'
        description={`This action will permanently remove ${deletingProvider?.name}. Providers with clients currently assigned to them cannot be deleted — reassign those clients first.`}
      />
    </div>
  );
}
