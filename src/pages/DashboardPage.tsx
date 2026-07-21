import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { getProviders } from '../lib/api/providers';
import { getClients } from '../lib/api/clients';
import { getLowBalanceClients } from '../lib/api/dashboard';
import { ApiError } from '../lib/api';
import { StatCard } from '../ui/StatCard/StatCard';
import { Card, CardHeader, CardBody } from '../ui/Card/Card';
import { Button } from '../ui/Button/Button';
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
  const navigate = useNavigate();

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
    <div className='space-y-6 animate-page-in'>
      {/* --- Top Welcome Banner & Quick Actions --- */}
      <div className='bg-bg-surface border border-border-main/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-bold text-text-main tracking-tight'>
              System Overview
            </h1>
            <span className='inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-success-500/10 text-success-600 dark:text-success-500 border border-success-500/20'>
              <span className='h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse' />
              Live Operational
            </span>
          </div>
          <p className='text-xs text-text-muted mt-1'>
            Real-time monitoring for ICORE SMS client allocations and provider
            gateway connections.
          </p>
        </div>

        <div className='flex items-center gap-2.5 shrink-0'>
          <Button
            variant='secondary'
            onClick={() => navigate('/transactions')}
            className='hover:scale-[1.02] active:scale-[0.98] transition-transform text-xs shadow-xs'>
            View Transactions
          </Button>
          <Button
            onClick={() => navigate('/clients')}
            className='hover:scale-[1.02] active:scale-[0.98] transition-transform text-xs shadow-xs'>
            <Plus className='h-3.5 w-3.5 mr-1' /> Add Client
          </Button>
        </div>
      </div>

      {/* --- Key Metrics Grid --- */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className='transition-all duration-200 hover:-translate-y-0.5'>
          <StatCard
            label='Active Providers'
            value={activeProviders}
            icon={<Building2 className='h-5 w-5 text-text-main' />}
            loading={providersLoading}
          />
        </div>

        <div className='transition-all duration-200 hover:-translate-y-0.5'>
          <StatCard
            label='Low Balance Alerts'
            value={lowBalanceClients?.length ?? 0}
            icon={<AlertTriangle className='h-5 w-5 text-warning-500' />}
            loading={lowBalanceLoading}
          />
        </div>

        <div className='transition-all duration-200 hover:-translate-y-0.5'>
          <StatCard
            label='Total Registered Clients'
            value={clients?.length ?? 0}
            icon={
              <Users className='h-5 w-5 text-text-main dark:text-navy-300' />
            }
            loading={clientsLoading}
          />
        </div>
      </div>

      {/* --- Low Balance Alerts Table Card --- */}
      <Card className='shadow-xs border-border-main overflow-hidden'>
        <CardHeader className='bg-bg-base/40 border-b border-border-main/60 px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='p-2 rounded-lg bg-warning-500/10 text-warning-600 dark:text-warning-500'>
              <ShieldAlert className='h-4 w-4' />
            </div>
            <div>
              <h2 className='text-sm font-bold text-text-main'>
                Low Balance Accounts
              </h2>
              <p className='text-[11px] text-text-muted'>
                Clients requiring immediate credit top-up
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => refetchLowBalance()}
              className='p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-surface-hover transition-colors'
              title='Refresh Table'>
              <RefreshCw className='h-3.5 w-3.5' />
            </button>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => navigate('/clients')}
              className='text-xs'>
              Manage Clients <ArrowRight className='h-3 w-3 ml-1' />
            </Button>
          </div>
        </CardHeader>

        <CardBody className='p-0'>
          <Table>
            <TableHeader>
              <TableRow className='bg-bg-base/50'>
                <TableHead className='pl-6'>Client Account</TableHead>
                <TableHead>Assigned Provider</TableHead>
                <TableHead>Flagged Date</TableHead>
                <TableHead className='text-right pr-6'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowBalanceError ? (
                <TableEmpty colSpan={4}>
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
                <TableSkeleton rows={3} columns={4} />
              ) : !lowBalanceClients?.length ? (
                <TableEmpty colSpan={4}>
                  <div className='flex flex-col items-center justify-center py-10 gap-2'>
                    <div className='p-3 rounded-full bg-success-500/10 text-success-600 dark:text-success-500 mb-1'>
                      <TrendingUp className='h-6 w-6' />
                    </div>
                    <p className='text-sm font-semibold text-text-main'>
                      All client balances are healthy!
                    </p>
                    <p className='text-xs text-text-muted'>
                      No clients currently flagged for credit threshold
                      warnings.
                    </p>
                  </div>
                </TableEmpty>
              ) : (
                lowBalanceClients.map((client) => (
                  <TableRow
                    key={client.id}
                    className='hover:bg-bg-surface-hover/80 transition-colors'>
                    <TableCell className='pl-6 font-semibold text-text-main'>
                      {client.name ?? client.login}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status='warning' size='sm'>
                        {client.provider.name}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className='text-text-muted text-xs font-mono'>
                      {new Date(
                        client.low_balance_flagged_at,
                      ).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className='text-right pr-6'>
                      <Button
                        size='sm'
                        variant='secondary'
                        onClick={() => navigate(`/clients?id=${client.id}`)}
                        className='text-xs hover:bg-bg-surface-hover'>
                        View Details
                      </Button>
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
