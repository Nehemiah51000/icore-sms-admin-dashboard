import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options,
      placeholder,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const selectId = id || props.name;

    return (
      <div className='flex flex-col gap-1.5 w-full'>
        {label && (
          <label
            htmlFor={selectId}
            className='text-sm font-medium text-text-main'>
            {label}
          </label>
        )}

        <div className='relative flex items-center'>
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            defaultValue={props.defaultValue ?? ''}
            className={cn(
              'h-10 w-full appearance-none rounded-lg border bg-bg-surface px-3 pr-9 text-sm text-text-main transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
              !props.value && !props.defaultValue && 'text-text-muted',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-border-main focus:ring-navy-500',
              disabled && 'opacity-50 cursor-not-allowed bg-bg-base',
              className,
            )}
            {...props}>
            {placeholder && (
              <option value='' disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className='absolute right-3 h-4 w-4 text-text-muted pointer-events-none' />
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

Select.displayName = 'Select';
