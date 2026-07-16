import { AlertCircle, RotateCcw } from 'lucide-react';

interface PageErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function PageErrorState({
  title = 'Failed to load dynamic query data',
  message = 'A network timeout occurred or the host database endpoint could not be reached.',
  onRetry,
}: PageErrorStateProps) {
  return (
    <div className='w-full py-12 px-4 flex items-center justify-center'>
      <div className='max-w-md w-full bg-bg-surface rounded-2xl border border-error-500/20 p-6 shadow-xs text-center'>
        <div className='h-12 w-12 rounded-full bg-error-500/10 text-error-500 flex items-center justify-center mx-auto mb-4'>
          <AlertCircle className='h-6 w-6' />
        </div>
        <h3 className='text-sm font-bold text-text-main mb-1'>{title}</h3>
        <p className='text-xs text-text-muted mb-5 leading-relaxed'>
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-bg-base border border-border-main text-text-main hover:bg-bg-surface-hover rounded-lg transition-colors cursor-pointer'>
            <RotateCcw className='h-3.5 w-3.5' />
            Try Reconnecting
          </button>
        )}
      </div>
    </div>
  );
}
