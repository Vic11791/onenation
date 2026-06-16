type SkeletonVariant = 'line' | 'card' | 'table-row' | 'circle';

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

function SkeletonBase({ className = '' }: { className?: string }) {
  return <div className={['rounded skeleton-shimmer', className].join(' ')} />;
}

export function Skeleton({ variant = 'line', className = '' }: SkeletonProps) {
  if (variant === 'circle') {
    return <SkeletonBase className={['w-10 h-10 rounded-full', className].join(' ')} />;
  }
  if (variant === 'card') {
    return (
      <div className={['rounded-xl border border-[var(--border-color)] p-4 space-y-3', className].join(' ')}>
        <SkeletonBase className="h-4 w-3/4" />
        <SkeletonBase className="h-3 w-full" />
        <SkeletonBase className="h-3 w-5/6" />
      </div>
    );
  }
  if (variant === 'table-row') {
    return (
      <div className={['flex items-center gap-3 py-3', className].join(' ')}>
        <SkeletonBase className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-3 w-1/2" />
          <SkeletonBase className="h-3 w-1/3" />
        </div>
        <SkeletonBase className="h-6 w-16 rounded-full" />
      </div>
    );
  }
  // line
  return <SkeletonBase className={['h-4 w-full', className].join(' ')} />;
}
