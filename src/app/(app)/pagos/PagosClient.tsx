'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, CheckCircle2, Wallet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToastContext } from '@/components/ui/Toast';
import { formatCurrency, formatDateShort, startOfMonth, endOfMonth } from '@/lib/utils';
import type { SessionUser } from '@/lib/auth';

interface PagosClientProps {
  session: SessionUser;
}

const TABS = [
  { key: 'todos', label: 'Todos', estatus: '' },
  { key: 'pendiente', label: 'Pendientes', estatus: 'pendiente' },
  { key: 'vencido', label: 'Vencidos', estatus: 'vencido' },
  { key: 'pagado', label: 'Pagados', estatus: 'pagado' },
] as const;

const estatusBadge: Record<string, 'ganado' | 'perdido' | 'tibio' | 'default'> = {
  pagado: 'ganado',
  vencido: 'perdido',
  pendiente: 'tibio',
};

export default function PagosClient({ session }: PagosClientProps) {
  void session;
  const { toast } = useToastContext();
  const [tab, setTab] = useState<string>('todos');
  const [pagos, setPagos] = useState<any[]>([]);
  const [allPagos, setAllPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  // Fetch the displayed tab list
  useEffect(() => {
    let active = true;
    setLoading(true);
    const estatus = TABS.find((t) => t.key === tab)?.estatus || '';
    const params = new URLSearchParams();
    if (estatus) params.set('estatus', estatus);
    fetch('/api/pagos?' + params.toString())
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data) return;
        setPagos(data.pagos || []);
      })
      .catch(() => {
        if (active) setPagos([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tab]);

  // Fetch all pagos for summary cards
  useEffect(() => {
    let active = true;
    fetch('/api/pagos')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) setAllPagos(data.pagos || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();
  const totalCobradoMes = allPagos
    .filter((p) => {
      if (p.estatus !== 'pagado' || !p.fechaPago) return false;
      const d = new Date(p.fechaPago);
      return d >= monthStart && d <= monthEnd;
    })
    .reduce((s, p) => s + (p.monto || 0), 0);
  const totalPendiente = allPagos
    .filter((p) => p.estatus === 'pendiente' || p.estatus === 'vencido')
    .reduce((s, p) => s + (p.monto || 0), 0);

  async function marcarPagado(id: string) {
    setMarking(id);
    try {
      const res = await fetch('/api/pagos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estatus: 'pagado' }),
      });
      if (!res.ok) throw new Error();
      setPagos((prev) =>
        tab === 'todos'
          ? prev.map((p) => (p.id === id ? { ...p, estatus: 'pagado', fechaPago: new Date().toISOString() } : p))
          : prev.filter((p) => p.id !== id),
      );
      setAllPagos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estatus: 'pagado', fechaPago: new Date().toISOString() } : p)),
      );
      toast('Pago marcado como pagado', 'success');
    } catch {
      toast('No se pudo marcar el pago', 'error');
    } finally {
      setMarking(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Pagos</h1>
        <p className="text-sm text-[var(--muted-fg)]">Cobranza y seguimiento de pagos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--muted-fg)]">Cobrado este mes</p>
            <p className="text-2xl font-bold text-[var(--fg)]">{formatCurrency(totalCobradoMes)}</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--muted-fg)]">Pendiente por cobrar</p>
            <p className="text-2xl font-bold text-[var(--fg)]">{formatCurrency(totalPendiente)}</p>
          </div>
        </Card>
      </div>

      <div className="flex gap-1 border-b border-[var(--border-color)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-[#e05a5a] text-[#e05a5a]'
                : 'border-transparent text-[var(--muted-fg)] hover:text-[var(--fg)]',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : pagos.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-12 h-12" />}
            title="Sin pagos"
            description="No se encontraron pagos en esta categoría."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left text-[var(--muted-fg)]">
                  <th className="px-4 py-3 font-medium">Folio</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Concepto</th>
                  <th className="px-4 py-3 font-medium">Monto</th>
                  <th className="px-4 py-3 font-medium">Método</th>
                  <th className="px-4 py-3 font-medium">Vencimiento</th>
                  <th className="px-4 py-3 font-medium">Estatus</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--muted)] transition-colors"
                  >
                    <td className="px-4 py-3 text-[var(--muted-fg)]">{p.folio || '—'}</td>
                    <td className="px-4 py-3">
                      {p.cliente ? (
                        <Link
                          href={'/clientes/' + p.cliente.id}
                          className="font-medium text-[var(--fg)] hover:text-[#e05a5a]"
                        >
                          {p.cliente.nombre}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--fg)]">{p.concepto || '—'}</td>
                    <td className="px-4 py-3 font-medium text-[var(--fg)]">
                      {formatCurrency(p.monto || 0, p.moneda || 'USD')}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-fg)] capitalize">{p.metodo || '—'}</td>
                    <td className="px-4 py-3 text-[var(--muted-fg)]">{formatDateShort(p.fechaVencimiento)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={estatusBadge[p.estatus] || 'default'} label={p.estatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.estatus !== 'pagado' && (
                        <Button
                          size="sm"
                          variant="success"
                          loading={marking === p.id}
                          onClick={() => marcarPagado(p.id)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Marcar pagado
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {!loading && pagos.length === 0 && allPagos.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-[var(--muted-fg)]">
          <AlertCircle className="w-3.5 h-3.5" />
          No hay pagos registrados.
        </div>
      )}
    </div>
  );
}
