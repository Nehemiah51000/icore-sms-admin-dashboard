import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  links,
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className='fixed inset-0 bg-ink-900/50 z-40 lg:hidden'
          onClick={onClose}
          aria-hidden='true'
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-navy-500 flex flex-col transition-all duration-200 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-20' : 'lg:w-64',
        )}>
        <div className='flex items-center gap-2 px-5 h-16 border-b border-white/10 overflow-hidden'>
          <img
            src='/ic_frame_2.svg'
            alt='ICORE'
            className='h-8 w-8 rounded-lg shrink-0'
          />
          {!collapsed && (
            <span className='text-white font-semibold text-sm whitespace-nowrap'>
              ICORE Admin
            </span>
          )}
        </div>

        <nav className='flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1'>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              title={collapsed ? link.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  collapsed && 'lg:justify-center',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-navy-200 hover:bg-white/5 hover:text-white',
                )
              }>
              <span className='shrink-0'>{link.icon}</span>
              {!collapsed && (
                <span className='whitespace-nowrap'>{link.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={onToggleCollapse}
          className={cn(
            'hidden lg:flex items-center gap-2 px-3 py-3 mx-3 mb-3 rounded-lg text-navy-200 hover:bg-white/5 hover:text-white transition-colors cursor-pointer',
            collapsed && 'justify-center',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? (
            <PanelLeftOpen className='h-4 w-4 shrink-0' />
          ) : (
            <>
              <PanelLeftClose className='h-4 w-4 shrink-0' />
              <span className='text-xs whitespace-nowrap'>Collapse</span>
            </>
          )}
        </button>
      </aside>
    </>
  );
}
