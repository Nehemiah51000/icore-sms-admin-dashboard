import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }
    function handleOffline() {
      setOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className='fixed top-0 inset-x-0 z-[100] bg-warning-500 text-ink-900 text-xs font-medium py-1.5 px-4 flex items-center justify-center gap-2'>
      <WifiOff className='h-3.5 w-3.5' />
      You're offline — changes won't save until your connection is back.
    </div>
  );
}
