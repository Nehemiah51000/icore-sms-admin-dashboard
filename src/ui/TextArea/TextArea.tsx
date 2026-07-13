import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, disabled, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className='flex flex-col gap-1.5 w-full'>
        {label && (
          <label
            htmlFor={textareaId}
            className='text-sm font-medium text-text-main'>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={cn(
            'min-h-24 w-full rounded-lg border bg-bg-surface px-3 py-2 text-sm font-mono text-text-main placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-border-main focus:ring-navy-500',
            disabled && 'opacity-50 cursor-not-allowed bg-bg-base',
            className,
          )}
          {...props}
        />
        {error ? (
          <span className='text-xs text-red-600'>{error}</span>
        ) : hint ? (
          <span className='text-xs text-text-muted'>{hint}</span>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
