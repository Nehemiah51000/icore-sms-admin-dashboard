import { useQuery } from '@tanstack/react-query';
import { Building2, Users, AlertTriangle } from 'lucide-react';
import { getProviders } from '../lib/api/providers';
import { getClients } from '../lib/api/clients';
import { getLowBalanceClients } from '../lib/api/dashboard';
import { ApiError } from '../lib/api';
import { StatCard } from '../ui/StatCard/StatCard';
import { Card, CardHeader, CardBody } from '../ui/Card/Card';
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
import { QueryErrorState } from '../ui/QueryErrorState/QueryErrorState';

export function DashboardPage() {
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const {
    data: lowBalanceClients,
    isLoading: lowBalanceLoading,
    isError: lowBalanceError,
    error: lowBalanceErrorObj,
    refetch: refetchLowBalance,
  } = useQuery({
    queryKey: ['dashboard', 'low-balance-clients'],
    queryFn: getLowBalanceClients,
    meta: { silent: true },
  });

  const activeProviders =
    providers?.filter((p) => p.status === 'active').length ?? 0;

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-xl font-semibold text-text-main'>Dashboard</h1>
        <p className='text-sm text-text-muted mt-0.5'>
          Overview of ICORE's SMS credit system
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        <StatCard
          label='Active Providers'
          value={activeProviders}
          icon={<Building2 className='h-5 w-5' />}
          loading={providersLoading}
        />
        <StatCard
          label='Low Balance Alerts'
          value={lowBalanceClients?.length ?? 0}
          icon={<AlertTriangle className='h-5 w-5' />}
          loading={lowBalanceLoading}
        />
        <StatCard
          label='Total Clients'
          value={clients?.length ?? 0}
          icon={<Users className='h-5 w-5' />}
          loading={clientsLoading}
        />
      </div>

      <Card>
        <CardHeader className='flex items-center justify-between'>
          <span className='text-sm font-semibold text-text-main'>
            Low Balance Clients
          </span>
          <span className='text-xs text-text-muted'>Needs attention</span>
        </CardHeader>
        <CardBody className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Flagged</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowBalanceError ? (
                <TableEmpty colSpan={3}>
                  <QueryErrorState
                    message={
                      lowBalanceErrorObj instanceof ApiError
                        ? lowBalanceErrorObj.message
                        : undefined
                    }
                    onRetry={() => refetchLowBalance()}
                  />
                </TableEmpty>
              ) : lowBalanceLoading ? (
                <TableSkeleton rows={3} columns={3} />
              ) : !lowBalanceClients?.length ? (
                <TableEmpty colSpan={3}>
                  No clients currently flagged for low balance.
                </TableEmpty>
              ) : (
                lowBalanceClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className='font-medium'>
                      {client.name ?? client.login}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status='warning' size='sm'>
                        {client.provider.name}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className='text-text-muted'>
                      {new Date(
                        client.low_balance_flagged_at,
                      ).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
