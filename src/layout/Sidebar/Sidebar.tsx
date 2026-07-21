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
          className='fixed inset-0 bg-ink-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity'
          onClick={onClose}
          aria-hidden='true'
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-bg-surface border-r border-border-main flex flex-col transition-all duration-200 lg:translate-x-0 lg:static lg:z-auto shadow-xs',
          open ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-20' : 'lg:w-64',
        )}>
        {/* Brand Header */}
        <div className='flex items-center gap-3 px-5 h-16 border-b border-border-main overflow-hidden shrink-0'>
          <img
            src='/ic_frame_2.svg'
            alt='ICORE'
            className='h-8 w-auto shrink-0'
          />
          {!collapsed && (
            <span className='text-text-main font-bold text-sm tracking-tight whitespace-nowrap'>
              ICORE SMS Admin
            </span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className='flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1.5'>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              title={collapsed ? link.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  collapsed && 'lg:justify-center',
                  isActive
                    ? 'bg-navy-500 text-white dark:bg-navy-600 dark:text-white shadow-xs font-semibold'
                    : 'text-text-muted hover:bg-bg-surface-hover hover:text-text-main',
                )
              }>
              <span className='shrink-0'>{link.icon}</span>
              {!collapsed && (
                <span className='whitespace-nowrap'>{link.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse Controls */}
        <button
          onClick={onToggleCollapse}
          className={cn(
            'hidden lg:flex items-center gap-2 px-3 py-2.5 mx-3 mb-3 rounded-xl border border-border-main/60 text-text-muted hover:text-text-main hover:bg-bg-surface-hover transition-colors cursor-pointer',
            collapsed && 'justify-center',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? (
            <PanelLeftOpen className='h-4 w-4 shrink-0' />
          ) : (
            <>
              <PanelLeftClose className='h-4 w-4 shrink-0' />
              <span className='text-xs font-medium whitespace-nowrap'>
                Collapse Menu
              </span>
            </>
          )}
        </button>
      </aside>
    </>
  );
}
