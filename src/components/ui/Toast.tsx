'use client';

import { createContext, useContext, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast, Toast as ToastType, ToastType as TType } from '@/hooks/useToast';

interface ToastContextValue {
  toast: (message: string, type?: TType, undoAction?: () => void) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToastContext() {
  return useContext(ToastContext);
}

const iconMap: Record<TType, ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
};

const borderMap: Record<TType, string> = {
  success: 'border-green-500',
  error: 'border-red-500',
  info: 'border-blue-500',
  warning: 'border-amber-500',
};

function ToastItem({ toast, onDismiss }: { toast: ToastType; onDismiss: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      className={[
        'flex items-start gap-3 w-80 bg-[var(--card-bg)] border border-l-4 rounded-lg px-4 py-3 shadow-[var(--shadow-lg)]',
        borderMap[toast.type],
      ].join(' ')}
    >
      {iconMap[toast.type]}
      <p className="flex-1 text-sm text-[var(--fg)]">{toast.message}</p>
      {toast.undoAction && (
        <button
          onClick={() => { toast.undoAction?.(); onDismiss(toast.id); }}
          className="text-xs font-medium text-[#e05a5a] hover:underline shrink-0"
        >
          Deshacer
        </button>
      )}
      <button onClick={() => onDismiss(toast.id)} className="text-[var(--muted-fg)] hover:text-[var(--fg)]">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, toast, dismiss } = useToast();
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
