'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, MessageCircle, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  formatDateShort,
  diasSinContacto,
  temperaturaIcon,
  buildWhatsAppUrl,
} from '@/lib/utils';
import type { SessionUser } from '@/lib/auth';
import NewClientModal from './NewClientModal';

const ETAPAS = ['Nuevo', 'Contactado', 'Calificado', 'Propuesta', 'Negociación'];

interface ClientesClientProps {
  session: SessionUser;
}

export default function ClientesClient({ session }: ClientesClientProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [etapa, setEtapa] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);

  const [clientes, setClientes] = useState<any[]>([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [etapa, temperatura, estado]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (etapa) params.set('etapa', etapa);
    if (temperatura) params.set('temperatura', temperatura);
    if (estado) params.set('estado', estado);
    params.set('page', String(page));

    fetch('/api/clientes?' + params.toString())
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data) return;
        setClientes(data.clientes || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      })
      .catch(() => {
        if (active) setClientes([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedSearch, etapa, temperatura, estado, page]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Clientes</h1>
          <p className="text-sm text-[var(--muted-fg)]">{total} en total</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Nuevo cliente
        </Button>
      </div>

      <Card className="p-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-fg)] z-10" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o email..."
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            options={ETAPAS.map((et) => ({ value: et, label: et }))}
            placeholder="Todas las etapas"
            value={etapa}
            onChange={(e) => setEtapa(e.target.value)}
          />
          <Select
            options={[
              { value: 'CALIENTE', label: 'Caliente' },
              { value: 'TIBIO', label: 'Tibio' },
              { value: 'FRIO', label: 'Frío' },
            ]}
            placeholder="Toda temperatura"
            value={temperatura}
            onChange={(e) => setTemperatura(e.target.value)}
          />
          <Select
            options={[
              { value: 'ACTIVO', label: 'Activo' },
              { value: 'GANADO', label: 'Ganado' },
              { value: 'PERDIDO', label: 'Perdido' },
              { value: 'ARCHIVADO', label: 'Archivado' },
            ]}
            placeholder="Todos los estados"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : clientes.length === 0 ? (
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="Sin clientes"
            description="No se encontraron clientes con los filtros actuales."
            action={{ label: 'Nuevo cliente', onClick: () => setModalOpen(true) }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left text-[var(--muted-fg)]">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Etapa</th>
                  <th className="px-4 py-3 font-medium">Temp.</th>
                  <th className="px-4 py-3 font-medium">Próxima acción</th>
                  <th className="px-4 py-3 font-medium">Días sin contacto</th>
                  <th className="px-4 py-3 font-medium">Vendedor</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
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
                      {c.telefono && (
                        <div className="text-xs text-[var(--muted-fg)]">{c.telefono}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.etapa && <Badge label={c.etapa} />}
                    </td>
                    <td className="px-4 py-3">
                      <span title={c.temperatura} className="text-lg">
                        {temperaturaIcon(c.temperatura)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.proximaAccion ? (
                        <div>
                          <div className="text-[var(--fg)]">{c.proximaAccion}</div>
                          {c.proximaAccionFecha && (
                            <div className="text-xs text-[var(--muted-fg)]">
                              {formatDateShort(c.proximaAccionFecha)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--muted-fg)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.ultimoContacto ? (
                        <span className="text-[var(--fg)]">
                          {diasSinContacto(c.ultimoContacto)} días
                        </span>
                      ) : (
                        <span className="text-[var(--muted-fg)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-fg)]">
                      {c.vendedor?.nombre || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.telefono && (
                        <a
                          href={buildWhatsAppUrl(c.telefono, 'Hola ' + c.nombre)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {!loading && clientes.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--muted-fg)]">
            Página {page} de {pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <NewClientModal open={modalOpen} onClose={() => setModalOpen(false)} session={session} />
    </div>
  );
}
