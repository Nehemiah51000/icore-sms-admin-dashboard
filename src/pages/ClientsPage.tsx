import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
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

export function ClientsPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted.');
      setDeletingClient(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Could not delete client.',
      );
    },
  });

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-text-main'>Clients</h1>
          <p className='text-sm text-text-muted mt-0.5'>
            Manage client accounts and their provider assignments.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingClient(null);
            setFormOpen(true);
          }}>
          <Plus className='h-4 w-4' /> Add Client
        </Button>
      </div>

      <Card>
        <CardBody className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={4} columns={5} />
              ) : !clients?.length ? (
                <TableEmpty colSpan={5}>
                  <div className='flex flex-col items-center gap-2'>
                    <Users className='h-8 w-8 text-text-muted' />
                    No clients yet. Add your first one to get started.
                  </div>
                </TableEmpty>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className='font-medium'>
                      {client.name ?? client.login}
                    </TableCell>
                    <TableCell className='text-text-muted'>
                      {client.phone}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status='info' size='sm'>
                        {client.provider?.name ?? '—'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          client.status === 'active' ? 'success' : 'pending'
                        }>
                        {client.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-1'>
                        <button
                          onClick={() => {
                            setEditingClient(client);
                            setFormOpen(true);
                          }}
                          className='p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-surface-hover cursor-pointer transition-colors'
                          aria-label='Edit'>
                          <Pencil className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => setDeletingClient(client)}
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
        title='Delete this client?'
        description={`This will permanently remove ${deletingClient?.name ?? deletingClient?.login}. Clients with existing transaction history can't be deleted — suspend them instead.`}
      />
    </div>
  );
}
