import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, AlertTriangle, Wallet } from 'lucide-react';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type NotificationItem,
} from '../../lib/api/notifications';
import { cn } from '../../lib/cn';

const iconForType: Record<string, typeof AlertTriangle> = {
  transaction_failed: AlertTriangle,
  low_balance: Wallet,
};

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Polls every 30s for a near-real-time badge without needing websockets.
  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
    meta: { silent: true },
  });

  // Only fetched once the dropdown is actually opened — no point loading
  // the full list on every page load.
  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: getNotifications,
    enabled: open,
    meta: { silent: true },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const items: NotificationItem[] = notifications?.data ?? [];
  const hasUnread = (unread?.count ?? 0) > 0;

  return (
    <div className='relative' ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className='relative p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-surface-hover transition-colors cursor-pointer'
        aria-label='Notifications'>
        <Bell className='h-5 w-5' />
        {hasUnread && (
          <span className='absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500' />
        )}
      </button>

      <div
        className={cn(
          'absolute right-0 top-full mt-2 w-80 rounded-xl border border-border-main bg-bg-surface shadow-lg origin-top-right transition-all duration-150',
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none',
        )}>
        <div className='px-4 py-3 border-b border-border-main flex items-center justify-between'>
          <span className='text-sm font-semibold text-text-main'>
            Notifications
          </span>
          {hasUnread && (
            <button
              onClick={() => markAllMutation.mutate()}
              className='text-xs text-navy-500 hover:text-navy-600 cursor-pointer'>
              Mark all read
            </button>
          )}
        </div>
        <div className='max-h-80 overflow-y-auto'>
          {items.length === 0 ? (
            <p className='px-4 py-8 text-center text-xs text-text-muted'>
              Nothing new right now.
            </p>
          ) : (
            items.map((n) => {
              const Icon = iconForType[n.type] ?? Bell;
              const isUnread = !n.read_at;
              return (
                <button
                  key={n.id}
                  onClick={() => isUnread && markOneMutation.mutate(n.id)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 border-b border-border-main last:border-0 text-left hover:bg-bg-surface-hover transition-colors cursor-pointer',
                    isUnread && 'bg-navy-500/5',
                  )}>
                  <div
                    className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                      isUnread
                        ? 'bg-navy-500/10 text-navy-500'
                        : 'bg-bg-base text-text-muted',
                    )}>
                    <Icon className='h-4 w-4' />
                  </div>
                  <div className='min-w-0'>
                    <p
                      className={cn(
                        'text-sm',
                        isUnread
                          ? 'text-text-main font-medium'
                          : 'text-text-muted',
                      )}>
                      {n.data.message}
                    </p>
                    <p className='text-xs text-text-muted mt-0.5'>
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
