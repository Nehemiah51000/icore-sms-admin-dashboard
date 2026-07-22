import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Search,
  X,
  Building2,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { getClients, deleteClient, type Client } from '../lib/api/clients';
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
import { ClientFormModal } from '../ui/ClientFormModal/ClientFormModal';
import { ConfirmDeleteModal } from '../ui/ConfirmDeleteModal/ConfirmDeleteModal';
import { QueryErrorState } from '../ui/QueryErrorState/QueryErrorState';

type StatusFilter = 'all' | 'active' | 'suspended';

export function ClientsPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const {
    data: clients,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
    meta: { silent: true },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client account deleted.');
      setDeletingClient(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Could not delete client.',
      );
    },
  });

  // Client-side filtering logic
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter((client) => {
      const nameMatch = (client.name ?? client.login)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const phoneMatch = client.phone
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const providerMatch = client.provider?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesSearch = nameMatch || phoneMatch || providerMatch;
      const matchesStatus =
        statusFilter === 'all' || client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  // Derived Stats
  const activeCount = clients?.filter((c) => c.status === 'active').length ?? 0;
  const flaggedCount =
    clients?.filter((c) => c.low_balance_flagged_at).length ?? 0;

  return (
    <div className='space-y-6 animate-page-in'>
      {/* --- Top Header & Main CTA --- */}
      <div className='bg-bg-surface border border-border-main/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-xl font-bold text-text-main tracking-tight'>
            Client Management
          </h1>
          <p className='text-xs text-text-muted mt-1'>
            Provision SMS credit client accounts and manage gateway routing
            assignments.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingClient(null);
            setFormOpen(true);
          }}
          className='hover:scale-[1.02] active:scale-[0.98] transition-transform text-xs shadow-xs shrink-0'>
          <Plus className='h-4 w-4 mr-1.5' /> Add New Client
        </Button>
      </div>

      {/* --- Quick Metrics & Search Bar Header --- */}
      <div className='bg-bg-surface border border-border-main rounded-2xl p-4 shadow-xs space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          {/* Search Input */}
          <div className='relative flex-1 min-w-60 max-w-md'>
            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by name, login, phone, or provider...'
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
            {(['all', 'active', 'suspended'] as StatusFilter[]).map((tab) => (
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
            <Users className='h-3.5 w-3.5 text-navy-500 dark:text-navy-300' />
            <span>
              Total Registered:{' '}
              <strong className='text-text-main'>{clients?.length ?? 0}</strong>
            </span>
          </div>
          <span className='text-border-main'>•</span>
          <div className='flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-success-500' />
            <span>
              Active Accounts:{' '}
              <strong className='text-text-main'>{activeCount}</strong>
            </span>
          </div>
          {flaggedCount > 0 && (
            <>
              <span className='text-border-main'>•</span>
              <div className='flex items-center gap-1.5 text-warning-600 dark:text-warning-500 font-semibold'>
                <AlertTriangle className='h-3.5 w-3.5' />
                <span>
                  Low Balance Flagged: <strong>{flaggedCount}</strong>
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- Data Table --- */}
      <Card className='shadow-xs border-border-main overflow-hidden'>
        <CardBody className='p-0'>
          <Table>
            <TableHeader>
              <TableRow className='bg-bg-base/50'>
                <TableHead className='pl-6'>Client Profile</TableHead>
                <TableHead>Phone Contact</TableHead>
                <TableHead>Assigned Provider</TableHead>
                <TableHead>Account Status</TableHead>
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
                <TableSkeleton rows={5} columns={5} />
              ) : !filteredClients.length ? (
                <TableEmpty colSpan={5}>
                  <div className='flex flex-col items-center justify-center py-10 gap-2'>
                    <Users className='h-8 w-8 text-text-muted' />
                    <p className='text-sm font-semibold text-text-main'>
                      {searchQuery || statusFilter !== 'all'
                        ? 'No clients match your search criteria.'
                        : 'No client accounts found.'}
                    </p>
                    <p className='text-xs text-text-muted'>
                      {searchQuery || statusFilter !== 'all'
                        ? 'Try clearing your filters or search term.'
                        : 'Click "Add New Client" above to get started.'}
                    </p>
                  </div>
                </TableEmpty>
              ) : (
                filteredClients.map((client) => {
                  const displayName = client.name ?? client.login;
                  return (
                    <TableRow
                      key={client.id}
                      className='hover:bg-bg-surface-hover/80 transition-colors'>
                      <TableCell className='pl-6 font-medium'>
                        <div className='flex items-center gap-3'>
                          <div className='h-8 w-8 rounded-lg bg-navy-500/10 text-text-main flex items-center justify-center font-bold text-xs shrink-0'>
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className='text-xs font-bold text-text-main leading-tight'>
                              {displayName}
                            </p>
                            <p className='text-[11px] text-text-muted font-mono mt-0.5'>
                              @{client.login}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className='text-xs font-mono text-text-muted'>
                        <div className='flex items-center gap-1.5'>
                          <Phone className='h-3 w-3 text-text-muted shrink-0' />
                          {client.phone || '—'}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className='flex items-center gap-1.5'>
                          <Building2 className='h-3.5 w-3.5 text-text-muted shrink-0' />
                          <StatusBadge
                            status='info'
                            size='sm'
                            className='text-text-main'>
                            {client.provider?.name ?? 'Unassigned'}
                          </StatusBadge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          status={
                            client.status === 'active' ? 'success' : 'pending'
                          }
                          size='sm'>
                          {client.status}
                        </StatusBadge>
                      </TableCell>

                      <TableCell className='text-right pr-6'>
                        <div className='flex justify-end items-center gap-1'>
                          <button
                            onClick={() => {
                              setEditingClient(client);
                              setFormOpen(true);
                            }}
                            className='p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-surface-hover cursor-pointer transition-colors'
                            title='Edit Account Details'
                            aria-label='Edit'>
                            <Pencil className='h-3.5 w-3.5' />
                          </button>
                          <button
                            onClick={() => setDeletingClient(client)}
                            className='p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-500/10 cursor-pointer transition-colors'
                            title='Delete Account'
                            aria-label='Delete'>
                            <Trash2 className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* --- Modals --- */}
      <ClientFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        client={editingClient}
      />

      <ConfirmDeleteModal
        open={Boolean(deletingClient)}
        onClose={() => setDeletingClient(null)}
        onConfirm={() =>
          deletingClient && deleteMutation.mutate(deletingClient.id)
        }
        loading={deleteMutation.isPending}
        title='Delete Client Account?'
        description={`This action will permanently delete ${deletingClient?.name ?? deletingClient?.login}. Note: Clients with active transaction history should be suspended instead.`}
      />
    </div>
  );
}
