import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { Button } from '../ui/Button/Button';

export function NotFoundPage() {
  return (
    <div className='min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-center animate-page-in'>
      <div className='h-20 w-20 rounded-3xl bg-navy-500/10 border border-navy-500/20 text-navy-500 flex items-center justify-center mb-6 shadow-xs hover:scale-105 transition-transform'>
        <SearchX className='h-10 w-10' />
      </div>
      <h1 className='text-xl font-bold text-text-main mb-2 tracking-tight'>
        Page not found
      </h1>
      <p className='text-sm text-text-muted mb-8 max-w-xs leading-relaxed'>
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to='/'>
        <Button className='px-6 py-2.5 hover:scale-[1.02] active:scale-[0.98] transition-transform'>
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
