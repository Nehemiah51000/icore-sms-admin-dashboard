import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getProfile } from '../lib/api/profile';
import { HydrationFallback } from '../ui/HydrationFallback/HydrationFallback';

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const admin = useAuthStore((s) => s.admin);
  const setAuth = useAuthStore((s) => s.setAuth);

  // On a fresh reload, the token survives (localStorage) but `admin` does
  // not — it only ever gets set by an explicit login/profile-update call.
  // If we have a token but no admin object, fetch it once before rendering
  // anything that depends on it (UserMenu, greetings, etc).
  const [hydrating, setHydrating] = useState(Boolean(token) && !admin);

  useEffect(() => {
    if (!token || admin) return;

    let cancelled = false;

    getProfile()
      .then((profile) => {
        if (!cancelled) setAuth(profile, token);
      })
      .catch(() => {
        // A genuine 401 here is already handled globally by api.ts (logout
        // + redirect to /login). Any other failure just leaves `admin`
        // null — UserMenu's `admin?.name ?? "Admin"` fallback covers it.
      })
      .finally(() => {
        if (!cancelled) setHydrating(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) return <Navigate to='/login' replace />;

  if (hydrating) {
    return (
      <HydrationFallback
        appName='ICORE Admin Portal'
        subtitle='Verifying admin credentials...'
      />
    );
  }

  return <Outlet />;
}
