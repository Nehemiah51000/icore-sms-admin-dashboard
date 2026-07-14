import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Receipt,
  Settings,
} from 'lucide-react';
import { AppShell } from './AppShell/AppShell';

const navLinks = [
  {
    to: '/',
    label: 'Dashboard',
    icon: <LayoutDashboard className='h-4 w-4' />,
  },
  { to: '/clients', label: 'Clients', icon: <Users className='h-4 w-4' /> },
  {
    to: '/providers',
    label: 'Providers',
    icon: <Building2 className='h-4 w-4' />,
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: <Receipt className='h-4 w-4' />,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: <Settings className='h-4 w-4' />,
  },
];

export function DashboardLayout() {
  return (
    <AppShell links={navLinks}>
      <Outlet />
    </AppShell>
  );
}
