import { forwardRef, type ChangeEvent } from 'react';
import { cn } from '../../lib/cn';

export interface PhoneInputProps {
  label?: string;
  error?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  containerClassName?: string;
}

// Kenya-only by design (matches the app's target market) — a full
// multi-country picker would be real overkill here. Strips whatever the
// user typed (07..., +254..., 254..., spaces) down to the local 9-digit
// number, so the visible input only ever holds that.
function normalizeLocalPart(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('254')) digits = digits.slice(3);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 9);
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      label,
      error,
      hint,
      value,
      onChange,
      onBlur,
      placeholder,
      containerClassName,
    },
    ref,
  ) => {
    const localPart = value.startsWith('254') ? value.slice(3) : value;

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      const local = normalizeLocalPart(e.target.value);
      onChange(local ? `254${local}` : '');
    }

    return (
      <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
        {label && (
          <label className='text-sm font-medium text-text-main'>{label}</label>
        )}
        <div
          className={cn(
            'flex items-center rounded-lg border bg-bg-surface overflow-hidden transition-colors focus-within:ring-2',
            error
              ? 'border-red-500 focus-within:ring-red-500'
              : 'border-border-main focus-within:ring-navy-500',
          )}>
          <span className='pl-3 pr-2 py-2.5 text-sm font-medium text-text-muted border-r border-border-main bg-bg-base shrink-0'>
            +254
          </span>
          <input
            ref={ref}
            type='tel'
            inputMode='numeric'
            value={localPart}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={placeholder ?? '791234567'}
            className='flex-1 min-w-0 h-10 px-3 text-sm bg-transparent text-text-main placeholder:text-text-muted focus:outline-none'
          />
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

PhoneInput.displayName = 'PhoneInput';
