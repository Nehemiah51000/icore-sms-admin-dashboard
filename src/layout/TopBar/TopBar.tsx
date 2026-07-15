import { Menu } from 'lucide-react';
import { ThemeToggle } from '../../ui/ThemeToggle/ThemeToggle';
import { NotificationBell } from '../../ui/NotificationBell/NotificationBell';
import { UserMenu } from '../../ui/UserMenu/UserMenu';

export interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  return (
    <header className='sticky top-0 z-30 h-16 flex items-center justify-between gap-3 px-4 sm:px-6 bg-bg-surface border-b border-border-main'>
      <div className='flex items-center gap-3 min-w-0'>
        <button
          onClick={onMenuClick}
          className='lg:hidden text-text-muted hover:text-text-main p-1.5 rounded-lg hover:bg-bg-surface-hover cursor-pointer transition-colors shrink-0'
          aria-label='Open menu'>
          <Menu className='h-5 w-5' />
        </button>
        {title && (
          <h1 className='text-base sm:text-lg font-semibold text-text-main truncate'>
            {title}
          </h1>
        )}
      </div>

      <div className='flex items-center gap-1.5 shrink-0'>
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
