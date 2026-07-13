import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        // Click on the ::backdrop lands directly on the <dialog> element itself
        if (e.target === dialogRef.current) onClose();
      }}
      className={cn(
        'm-auto w-[calc(100%-2rem)] rounded-xl border border-border-main bg-bg-surface p-0 text-text-main backdrop:bg-ink-900/50 backdrop:backdrop-blur-none',
        sizeClasses[size],
      )}>
      {title && (
        <div className='flex items-center justify-between px-5 py-4 border-b border-border-main'>
          <h2 className='text-base font-semibold text-text-main'>{title}</h2>
          <button
            onClick={onClose}
            className='text-text-muted hover:text-text-main cursor-pointer rounded-lg p-1 hover:bg-bg-surface-hover transition-colors'
            aria-label='Close'>
            <X className='h-4 w-4' />
          </button>
        </div>
      )}

      <div className='px-5 py-4'>{children}</div>

      {footer && (
        <div className='flex items-center justify-end gap-2 px-5 py-4 border-t border-border-main bg-bg-base/40'>
          {footer}
        </div>
      )}
    </dialog>
  );
}
