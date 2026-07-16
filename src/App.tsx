import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProvidersPage } from './pages/ProvidersPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layout/DashboardLayout';
import { ClientsPage } from './pages/ClientsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path='/' element={<DashboardPage />} />
          <Route path='/providers' element={<ProvidersPage />} />
          <Route path='/clients' element={<ClientsPage />} />
          <Route path='/transactions' element={<TransactionsPage />} />
          <Route path='/settings' element={<SettingsPage />} />
        </Route>
      </Route>
      {/* System Fallback: Catch-all Routing */}
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
