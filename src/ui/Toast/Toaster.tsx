import { Toaster as SonnerToaster } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
} from 'lucide-react';

export function Toaster() {
  return (
    <SonnerToaster
      position='top-right'
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'relative flex items-start gap-3 w-full rounded-xl border border-border-main bg-bg-surface pl-4 pr-9 py-3 shadow-lg text-sm text-text-main',
          title: 'font-medium text-text-main',
          description: 'text-text-muted text-xs mt-0.5',
          actionButton:
            'bg-navy-500 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg cursor-pointer',
          cancelButton:
            'bg-bg-base text-text-muted text-xs font-medium px-2.5 py-1.5 rounded-lg cursor-pointer',
          closeButton:
            '!absolute !right-2 !top-2 !left-auto !translate-x-0 !translate-y-0 h-6 w-6 flex items-center justify-center rounded-full !border-none !bg-transparent text-text-muted hover:text-text-main hover:!bg-bg-surface-hover cursor-pointer transition-colors',
          success: 'border-l-4 !border-l-success-500',
          error: 'border-l-4 !border-l-error-500',
          warning: 'border-l-4 !border-l-warning-500',
          info: 'border-l-4 !border-l-navy-500',
        },
      }}
      icons={{
        success: <CheckCircle2 className='h-5 w-5 text-success-500 shrink-0' />,
        error: <XCircle className='h-5 w-5 text-error-500 shrink-0' />,
        warning: <AlertCircle className='h-5 w-5 text-warning-500 shrink-0' />,
        info: <Info className='h-5 w-5 text-navy-500 shrink-0' />,
        loading: (
          <Loader2 className='h-5 w-5 text-text-muted shrink-0 animate-spin' />
        ),
      }}
      closeButton
    />
  );
}
