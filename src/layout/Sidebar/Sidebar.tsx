import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';

export interface SidebarLink {
  to: string;
  label: string;
  icon: ReactNode;
}

export interface SidebarProps {
  links: SidebarLink[];
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ links, open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop — only rendered/interactive when the sidebar is open */}
      {open && (
        <div
          className='fixed inset-0 bg-ink-900/50 z-40 lg:hidden'
          onClick={onClose}
          aria-hidden='true'
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-navy-500 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        )}>
        <div className='flex items-center gap-2 px-5 h-16 border-b border-white/10'>
          <img
            src='/ic_frame_2.svg'
            alt='ICORE'
            className='h-8 w-8 rounded-lg'
          />
          <span className='text-white font-semibold text-sm'>ICORE Admin</span>
        </div>

        <nav className='flex-1 overflow-y-auto px-3 py-4 space-y-1'>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-navy-200 hover:bg-white/5 hover:text-white',
                )
              }>
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
