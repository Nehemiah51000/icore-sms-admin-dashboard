import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar, type SidebarLink } from '../Sidebar/Sidebar';
import { TopBar } from '../TopBar/TopBar';

export interface AppShellProps {
  links: SidebarLink[];
  title?: string;
  children: ReactNode;
}

const COLLAPSE_KEY = 'icore_sidebar_collapsed';

export function AppShell({ links, title, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === 'true',
  );
  const location = useLocation();

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  }

  return (
    <div className='min-h-screen bg-bg-base flex'>
      <Sidebar
        links={links}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div className='flex-1 flex flex-col min-w-0'>
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} />
        {/* Keyed by pathname so the entrance animation replays on every
            route change, not just on first mount. */}
        <main
          key={location.pathname}
          className='flex-1 p-4 sm:p-6 animate-page-in'>
          {children}
        </main>
      </div>
    </div>
  );
}
