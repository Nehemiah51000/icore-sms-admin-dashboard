import { type ReactNode } from 'react';
import { Card, CardBody } from '../Card/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  loading?: boolean;
}

export function StatCard({ label, value, icon, loading }: StatCardProps) {
  return (
    <Card>
      <CardBody className='flex items-center gap-4'>
        <div className='h-11 w-11 rounded-xl bg-navy-500/10 text-navy-500 flex items-center justify-center shrink-0'>
          {icon}
        </div>
        <div>
          <p className='text-xs text-text-muted'>{label}</p>
          {loading ? (
            <div className='h-6 w-16 rounded bg-bg-base animate-pulse mt-1' />
          ) : (
            <p className='text-xl font-semibold text-text-main'>{value}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
