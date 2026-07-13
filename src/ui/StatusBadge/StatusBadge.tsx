import { cva, type VariantProps } from 'class-variance-authority';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/cn';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
  {
    variants: {
      status: {
        success: 'bg-success-500/10 text-success-600',
        error: 'bg-error-500/10 text-error-600',
        warning: 'bg-warning-500/10 text-warning-600',
        pending: 'bg-muted-400/15 text-muted-600',
        info: 'bg-navy-500/10 text-navy-500',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'sm',
    },
  },
);

const statusIcons: Record<string, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  pending: Clock,
  info: AlertCircle,
};

export interface StatusBadgeProps extends VariantProps<
  typeof statusBadgeVariants
> {
  children: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status = 'pending',
  size,
  showIcon = true,
  children,
  className,
}: StatusBadgeProps) {
  const Icon = statusIcons[status ?? 'pending'];

  return (
    <span className={cn(statusBadgeVariants({ status, size, className }))}>
      {showIcon && (
        <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      )}
      {children}
    </span>
  );
}
