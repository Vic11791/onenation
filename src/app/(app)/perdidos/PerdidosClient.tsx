'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateShort } from '@/lib/utils';

interface PerdidosClientProps {
  clientes: any[];
}

export default function PerdidosClient({ clientes }: PerdidosClientProps) {
  const [motivo, setMotivo] = useState('');

  const motivos = useMemo(() => {
    const set = new Set<string>();
    clientes.forEach((c) => {
      if (c.motivoPerdida) set.add(c.motivoPerdida);
    });
    return Array.from(set);
  }, [clientes]);

  const filtered = useMemo(
    () => (motivo ? clientes.filter((c) => c.motivoPerdida === motivo) : clientes),
    [clientes, motivo],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Perdidos</h1>
          <p className="text-sm text-[var(--muted-fg)]">{filtered.length} clientes</p>
        </div>
        <div className="w-full sm:w-64">
          <Select
            options={motivos.map((m) => ({ value: m, label: m }))}
            placeholder="Todos los motivos"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<XCircle className="w-12 h-12" />}
            title="Sin perdidos"
            description="No se encontraron clientes perdidos con este filtro."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left text-[var(--muted-fg)]">
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Fecha perdido</th>
                  <th className="px-4 py-3 font-medium">Motivo</th>
                  <th className="px-4 py-3 font-medium">Vendedor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
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
                    <td className="px-4 py-3 text-[var(--muted-fg)]">{formatDateShort(c.fechaPerdido)}</td>
                    <td className="px-4 py-3 text-[var(--fg)]">{c.motivoPerdida || '—'}</td>
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
