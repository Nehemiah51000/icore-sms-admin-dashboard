import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path='/' element={<DashboardPage />} />
        {/* /clients, /providers, /transactions get added as we build each */}
      </Route>
    </Routes>
  );
}

export default App;
