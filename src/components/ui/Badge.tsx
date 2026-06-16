import { HTMLAttributes } from 'react';

type StatusVariant = 'activo' | 'ganado' | 'perdido' | 'archivado' | 'caliente' | 'tibio' | 'frio' | 'default';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  label?: string;
}

const variantConfig: Record<StatusVariant, { classes: string; icon: string; text: string }> = {
  activo:    { classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: '●', text: 'Activo' },
  ganado:    { classes: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: '✓', text: 'Ganado' },
  perdido:   { classes: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: '✕', text: 'Perdido' },
  archivado: { classes: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: '◼', text: 'Archivado' },
  caliente:  { classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: '🔥', text: 'Caliente' },
  tibio:     { classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: '🟡', text: 'Tibio' },
  frio:      { classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '🔵', text: 'Frío' },
  default:   { classes: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: '●', text: '' },
};

export function Badge({ variant = 'default', label, className = '', ...props }: BadgeProps) {
  const config = variantConfig[variant];
  const text = label ?? config.text;
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.classes,
        className,
      ].join(' ')}
      {...props}
    >
      <span>{config.icon}</span>
      {text && <span>{text}</span>}
    </span>
  );
}
