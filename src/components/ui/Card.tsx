import { HTMLAttributes, forwardRef } from 'react';

type Variant = 'default' | 'glass' | 'elevated';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-[var(--card-bg)] border border-[var(--border-color)]',
  glass: 'glass',
  elevated: 'bg-[var(--card-bg)] border border-[var(--border-color)] shadow-[var(--shadow-md)]',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={['rounded-xl', variantClasses[variant], className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export const CardHeader = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={['px-6 pt-6 pb-4', className].join(' ')} {...props}>{children}</div>
);

export const CardContent = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={['px-6 pb-6', className].join(' ')} {...props}>{children}</div>
);

export const CardFooter = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={['px-6 pb-6 pt-0 flex items-center', className].join(' ')} {...props}>{children}</div>
);
