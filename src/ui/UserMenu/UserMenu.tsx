import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/cn';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const admin = useAuthStore((s) => s.admin);
  const logout = useAuthStore((s) => s.logout);

  // Legitimate effect: subscribing to an external system (document clicks)
  // to detect "outside" clicks, with proper cleanup on unmount. Contrast
  // this with syncing React state from React state, which never needs one.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = admin?.name
    ? admin.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div className='relative' ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className='flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-bg-surface-hover transition-colors cursor-pointer'
        aria-label='Account menu'>
        <div className='h-8 w-8 rounded-full bg-navy-500 text-white flex items-center justify-center text-xs font-semibold shrink-0'>
          {initials}
        </div>
        <span className='hidden sm:block text-sm font-medium text-text-main'>
          {admin?.name ?? 'Admin'}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-text-muted transition-transform duration-150',
            open && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'absolute right-0 top-full mt-2 w-52 rounded-xl border border-border-main bg-bg-surface shadow-lg py-1.5 origin-top-right transition-all duration-150',
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none',
        )}>
        <div className='px-3 py-2 border-b border-border-main mb-1'>
          <p className='text-sm font-medium text-text-main truncate'>
            {admin?.name}
          </p>
          <p className='text-xs text-text-muted truncate'>{admin?.email}</p>
        </div>

        <button
          onClick={() => {
            setOpen(false);
            navigate('/settings');
          }}
          className='w-full flex items-center gap-2 px-3 py-2 text-sm text-text-main hover:bg-bg-surface-hover transition-colors cursor-pointer'>
          <Settings className='h-4 w-4 text-text-muted' /> Settings
        </button>

        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer'>
          <LogOut className='h-4 w-4' /> Log Out
        </button>
      </div>
    </div>
  );
}
