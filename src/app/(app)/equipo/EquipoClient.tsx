'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils';
import { Users } from 'lucide-react';

interface Miembro {
  id: string;
  nombre: string;
  email: string;
  avatar?: string | null;
  clientesActivos: number;
  ganadosMes: number;
  ingresosMes: number;
  pctMeta: number;
  metaMes: number;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function EquipoClient() {
  const [equipo, setEquipo] = useState<Miembro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/equipo')
      .then((r) => r.json())
      .then((d) => setEquipo(d.equipo || []))
      .catch(() => setEquipo([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (equipo.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-12 h-12" />}
        title="Sin vendedores"
        description="Aún no hay miembros en el equipo."
      />
    );
  }

  const podium = [...equipo].sort((a, b) => b.ingresosMes - a.ingresosMes).slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Equipo</h1>
        <p className="text-sm text-[var(--muted-fg)]">Desempeño del mes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {podium.map((m, i) => (
          <Card
            key={m.id}
            variant="elevated"
            className="p-5 flex flex-col items-center text-center gap-2"
            style={{ borderTop: `3px solid #e05a5a` }}
          >
            <span className="text-4xl">{MEDALS[i]}</span>
            {m.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.avatar}
                alt={m.nombre}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[var(--muted)] flex items-center justify-center text-lg font-semibold text-[var(--fg)]">
                {m.nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="font-semibold text-[var(--fg)]">{m.nombre}</div>
            <div className="text-xl font-bold text-[#e05a5a]">
              {formatCurrency(m.ingresosMes)}
            </div>
            <div className="text-xs text-[var(--muted-fg)]">
              {m.ganadosMes} ganados este mes
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-left text-[var(--muted-fg)]">
                <th className="px-4 py-3 font-medium">Vendedor</th>
                <th className="px-4 py-3 font-medium">Clientes activos</th>
                <th className="px-4 py-3 font-medium">Ganados este mes</th>
                <th className="px-4 py-3 font-medium">Ingresos este mes</th>
                <th className="px-4 py-3 font-medium">% de meta</th>
              </tr>
            </thead>
            <tbody>
              {equipo.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-[var(--border-color)] last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {m.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.avatar}
                          alt={m.nombre}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-semibold text-[var(--fg)]">
                          {m.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-[var(--fg)]">{m.nombre}</div>
                        <div className="text-xs text-[var(--muted-fg)]">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--fg)]">{m.clientesActivos}</td>
                  <td className="px-4 py-3 text-[var(--fg)]">{m.ganadosMes}</td>
                  <td className="px-4 py-3 font-medium text-[var(--fg)]">
                    {formatCurrency(m.ingresosMes)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="flex-1 h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#e05a5a]"
                          style={{ width: `${Math.min(100, Math.max(0, m.pctMeta))}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--muted-fg)] w-10 text-right">
                        {Math.round(m.pctMeta)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
