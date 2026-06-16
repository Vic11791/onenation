'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Archive, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToastContext } from '@/components/ui/Toast';
import { formatDateShort } from '@/lib/utils';

interface ArchivadosClientProps {
  clientes: any[];
}

export default function ArchivadosClient({ clientes }: ArchivadosClientProps) {
  const { toast } = useToastContext();
  const [rows, setRows] = useState<any[]>(clientes);
  const [reactivating, setReactivating] = useState<string | null>(null);

  async function reactivar(id: string) {
    setReactivating(id);
    try {
      const res = await fetch('/api/clientes/' + id + '/estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'ACTIVO' }),
      });
      if (!res.ok) throw new Error();
      setRows((prev) => prev.filter((c) => c.id !== id));
      toast('Cliente reactivado', 'success');
    } catch {
      toast('No se pudo reactivar el cliente', 'error');
    } finally {
      setReactivating(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Archivados</h1>
        <p className="text-sm text-[var(--muted-fg)]">{rows.length} clientes</p>
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon={<Archive className="w-12 h-12" />}
            title="Sin archivados"
            description="No hay clientes archivados."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left text-[var(--muted-fg)]">
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Fecha archivado</th>
                  <th className="px-4 py-3 font-medium">Etapa previa</th>
                  <th className="px-4 py-3 font-medium">Vendedor</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
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
                    <td className="px-4 py-3 text-[var(--muted-fg)]">{formatDateShort(c.fechaArchivado)}</td>
                    <td className="px-4 py-3 text-[var(--fg)]">{c.etapaPreviaArchivado || '—'}</td>
                    <td className="px-4 py-3 text-[var(--muted-fg)]">{c.vendedor?.nombre || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        loading={reactivating === c.id}
                        onClick={() => reactivar(c.id)}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reactivar
                      </Button>
                    </td>
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
