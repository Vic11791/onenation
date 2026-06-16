import { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
      {icon && (
        <div className="text-[var(--muted-fg)] mb-2 text-5xl">{icon}</div>
      )}
      <h3 className="text-base font-semibold text-[var(--fg)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--muted-fg)] max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-2">{action.label}</Button>
      )}
    </div>
  );
}
