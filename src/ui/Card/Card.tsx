import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-bg-surface border border-border-main rounded-xl overflow-hidden flex flex-col shadow-xs ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardSectionProps) {
  return (
    <div className={`px-4 py-3 border-b border-border-main ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: CardSectionProps) {
  return <div className={`px-4 py-4 flex-1 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardSectionProps) {
  return (
    <div
      className={`px-4 py-3 border-t border-border-main bg-bg-base/40 ${className}`}>
      {children}
    </div>
  );
}
