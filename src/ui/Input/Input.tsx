import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      id,
      disabled,
      type,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;
    const isPassword = type === 'password';
    const [revealed, setRevealed] = useState(false);

    const resolvedType = isPassword ? (revealed ? 'text' : 'password') : type;

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-main">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-text-muted pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            disabled={disabled}
            className={cn(
              'h-10 w-full rounded-lg border bg-bg-surface px-3 text-sm text-text-main placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
              leftIcon && 'pl-9',
              (rightIcon || isPassword) && 'pr-9',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-border-main focus:ring-navy-500',
              disabled && 'opacity-50 cursor-not-allowed bg-bg-base',
              className
            )}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setRevealed((r) => !r)}
              className="absolute right-3 text-text-muted hover:text-text-main transition-colors cursor-pointer"
              aria-label={revealed ? 'Hide password' : 'Show password'}
            >
              {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          ) : (
            rightIcon && (
              <span className="absolute right-3 text-text-muted pointer-events-none">
                {rightIcon}
              </span>
            )
          )}
        </div>

        {error ? (
          <span className="text-xs text-red-600">{error}</span>
        ) : hint ? (
          <span className="text-xs text-text-muted">{hint}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';