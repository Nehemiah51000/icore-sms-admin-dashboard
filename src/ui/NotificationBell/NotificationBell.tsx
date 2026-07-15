import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '../../lib/cn';

interface NotificationItem {
  id: number;
  message: string;
  time: string;
}

// Placeholder — no backend notifications endpoint exists yet. This renders
// a real, working dropdown with a correct empty state so the UI pattern is
// in place; wire it to a real feed (e.g. failed transactions, low-balance
// alerts) once that endpoint exists.
const mockNotifications: NotificationItem[] = [];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative' ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className='relative p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-surface-hover transition-colors cursor-pointer'
        aria-label='Notifications'>
        <Bell className='h-5 w-5' />
        {mockNotifications.length > 0 && (
          <span className='absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500' />
        )}
      </button>

      <div
        className={cn(
          'absolute right-0 top-full mt-2 w-72 rounded-xl border border-border-main bg-bg-surface shadow-lg origin-top-right transition-all duration-150',
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none',
        )}>
        <div className='px-4 py-3 border-b border-border-main'>
          <span className='text-sm font-semibold text-text-main'>
            Notifications
          </span>
        </div>
        <div className='max-h-64 overflow-y-auto'>
          {mockNotifications.length === 0 ? (
            <p className='px-4 py-8 text-center text-xs text-text-muted'>
              Nothing new right now.
            </p>
          ) : (
            mockNotifications.map((n) => (
              <div
                key={n.id}
                className='px-4 py-3 border-b border-border-main last:border-0 text-sm'>
                <p className='text-text-main'>{n.message}</p>
                <p className='text-xs text-text-muted mt-0.5'>{n.time}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
