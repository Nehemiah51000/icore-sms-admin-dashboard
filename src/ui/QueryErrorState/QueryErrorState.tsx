import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../Button/Button';

interface QueryErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryErrorState({ message, onRetry }: QueryErrorStateProps) {
  return (
    <div className='flex flex-col items-center gap-3 py-12 text-center'>
      <div className='h-10 w-10 rounded-full bg-error-500/10 text-error-500 flex items-center justify-center'>
        <AlertCircle className='h-5 w-5' />
      </div>
      <div>
        <p className='text-sm font-medium text-text-main'>
          Couldn't load this data
        </p>
        <p className='text-xs text-text-muted mt-0.5'>
          {message ?? 'Something went wrong. Please try again.'}
        </p>
      </div>
      {onRetry && (
        <Button variant='secondary' size='sm' onClick={onRetry}>
          <RefreshCw className='h-3.5 w-3.5' /> Retry
        </Button>
      )}
    </div>
  );
}
