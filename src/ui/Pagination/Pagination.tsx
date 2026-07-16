import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
}: PaginationProps) {
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border-main'>
      <span className='text-xs text-text-muted order-2 sm:order-1'>
        Showing {from}–{to} of {total}
      </span>

      <div className='flex items-center gap-1 order-1 sm:order-2'>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            'h-8 w-8 flex items-center justify-center rounded-lg border border-border-main text-text-main hover:bg-bg-surface-hover transition-colors',
            currentPage <= 1
              ? 'opacity-40 cursor-not-allowed'
              : 'cursor-pointer',
          )}
          aria-label='Previous page'>
          <ChevronLeft className='h-4 w-4' />
        </button>

        <span className='text-xs text-text-muted px-2 whitespace-nowrap'>
          Page {currentPage} of {Math.max(lastPage, 1)}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className={cn(
            'h-8 w-8 flex items-center justify-center rounded-lg border border-border-main text-text-main hover:bg-bg-surface-hover transition-colors',
            currentPage >= lastPage
              ? 'opacity-40 cursor-not-allowed'
              : 'cursor-pointer',
          )}
          aria-label='Next page'>
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
}
