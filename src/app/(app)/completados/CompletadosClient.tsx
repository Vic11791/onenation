'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDateShort } from '@/lib/utils';

interface CompletadosClientProps {
  clientes: any[];
  total: number;
  count: number;
}

const CONFETTI_COLORS = ['#e05a5a', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.8 + Math.random() * 1.4,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
    })),
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -40, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

export default function CompletadosClient({ clientes, total, count }: CompletadosClientProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
  }, [count]);

  return (
    <div className="flex flex-col gap-4">
      {showConfetti && <Confetti />}

      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Completados</h1>
        <p className="text-sm text-[var(--muted-fg)]">Clientes ganados</p>
      </div>

      <Card className="p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-sm text-[var(--muted-fg)]">Negocios ganados</p>
            <p className="text-2xl font-bold text-[var(--fg)]">{count}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-[var(--muted-fg)]">Ingresos totales</p>
            <p className="text-2xl font-bold text-[var(--fg)]">{formatCurrency(total)}</p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {clientes.length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-12 h-12" />}
            title="Sin completados"
            description="Aún no hay clientes ganados."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left text-[var(--muted-fg)]">
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Fecha ganado</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Vendedor</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--muted)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={'/clientes/' + c.id}
                        className="font-medium text-[var(--fg)] hover:text-[#e05a5a]"
                      >
                        {c.nombre}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-fg)]">{formatDateShort(c.fechaGanado)}</td>
                    <td className="px-4 py-3 font-medium text-[var(--fg)]">{formatCurrency(c.valorEstimado || 0)}</td>
                    <td className="px-4 py-3 text-[var(--muted-fg)]">{c.vendedor?.nombre || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
