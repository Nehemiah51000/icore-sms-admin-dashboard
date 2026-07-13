import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId = id || props.name;

    return (
      <div className='flex flex-col gap-1.5 w-full'>
        {label && (
          <label
            htmlFor={inputId}
            className='text-sm font-medium text-text-main'>
            {label}
          </label>
        )}

        <div className='relative flex items-center'>
          {leftIcon && (
            <span className='absolute left-3 text-text-muted pointer-events-none'>
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'h-10 w-full rounded-lg border bg-bg-surface px-3 text-sm text-text-main placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-border-main focus:ring-navy-500',
              disabled && 'opacity-50 cursor-not-allowed bg-bg-base',
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <span className='absolute right-3 text-text-muted pointer-events-none'>
              {rightIcon}
            </span>
          )}
        </div>

        {error ? (
          <span className='text-xs text-red-600'>{error}</span>
        ) : hint ? (
          <span className='text-xs text-text-muted'>{hint}</span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
