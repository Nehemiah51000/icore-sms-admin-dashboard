import { Link } from 'react-router-dom';
import { ShieldQuestion, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className='min-h-screen bg-bg-base text-text-main flex flex-col items-center justify-center p-4 text-center'>
      <div className='max-w-md w-full p-8 bg-bg-surface rounded-2xl border border-border-main shadow-lg'>
        <div className='w-16 h-16 bg-error-500/10 text-error-500 rounded-2xl flex items-center justify-center mx-auto mb-6'>
          <ShieldQuestion className='h-8 w-8' />
        </div>
        <h1 className='text-3xl font-extrabold text-text-main tracking-tight mb-2'>
          404
        </h1>
        <h2 className='text-base font-bold text-text-main mb-3'>
          Resource Unresolved
        </h2>
        <p className='text-xs text-text-muted leading-relaxed mb-6'>
          The view or client portal configuration you are trying to access does
          not exist or has been shifted under active admin updates.
        </p>
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Link
            to='/'
            className='px-4 py-2 text-xs font-bold bg-navy-500 hover:bg-navy-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer'>
            <Home className='h-4 w-4' />
            Back to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className='px-4 py-2 text-xs font-bold text-text-main bg-bg-base border border-border-main hover:bg-bg-surface-hover rounded-lg transition-colors cursor-pointer'>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
