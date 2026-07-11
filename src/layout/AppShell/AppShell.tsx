import { useState, type ReactNode } from 'react';
import { Sidebar, type SidebarLink } from '../Sidebar/Sidebar';
import { TopBar } from '../TopBar/Topbar';

export interface AppShellProps {
  links: SidebarLink[];
  title?: string;
  children: ReactNode;
}

export function AppShell({ links, title, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen bg-bg-base flex'>
      <Sidebar
        links={links}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className='flex-1 flex flex-col min-w-0'>
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className='flex-1 p-4 sm:p-6'>{children}</main>
      </div>
    </div>
  );
}
