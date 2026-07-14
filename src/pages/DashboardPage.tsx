import { useQuery } from '@tanstack/react-query';
import { Building2, Users, AlertTriangle } from 'lucide-react';
import { getProviders } from '../lib/api/providers';
import { getLowBalanceClients } from '../lib/api/dashboard';
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
import { getClients } from '../lib/api/clients';

export function DashboardPage() {
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
  });

  const { data: lowBalanceClients, isLoading: lowBalanceLoading } = useQuery({
    queryKey: ['dashboard', 'low-balance-clients'],
    queryFn: getLowBalanceClients,
  });

  const activeProviders =
    providers?.filter((p) => p.status === 'active').length ?? 0;

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

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
              {lowBalanceLoading ? (
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
