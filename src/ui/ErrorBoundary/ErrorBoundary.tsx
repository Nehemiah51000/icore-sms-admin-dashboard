import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../Button/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Centralized hook — pipe to a real error-tracking service later.
    console.error('Uncaught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen bg-bg-base text-text-main flex flex-col items-center justify-center p-4 text-center'>
          <div className='max-w-md w-full p-8 bg-bg-surface rounded-2xl border border-border-main shadow-lg'>
            <div className='w-16 h-16 bg-error-500/10 text-error-500 rounded-2xl flex items-center justify-center mx-auto mb-6'>
              <AlertTriangle className='h-8 w-8' />
            </div>
            <h1 className='text-lg font-bold text-text-main mb-2'>
              Something went wrong
            </h1>
            <p className='text-xs text-text-muted leading-relaxed mb-6'>
              An unexpected error occurred. Try reloading the page — if this
              keeps happening, let the development team know.
            </p>
            <Button onClick={() => window.location.reload()} fullWidth>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
