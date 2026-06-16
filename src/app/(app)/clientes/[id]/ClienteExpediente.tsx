'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  Trophy,
  XCircle,
  Plus,
  Paperclip,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToastContext } from '@/components/ui/Toast';
import {
  formatCurrency,
  formatDate,
  formatDateShort,
  temperaturaIcon,
  buildWhatsAppUrl,
} from '@/lib/utils';
import type { SessionUser } from '@/lib/auth';

const ETAPAS = ['Nuevo', 'Contactado', 'Calificado', 'Propuesta', 'Negociación'];
const TIPOS_INTERACCION = ['Llamada', 'WhatsApp', 'Email', 'Reunión', 'Nota', 'Sistema'];
const TABS = ['Resumen', 'Interacciones', 'Notas', 'Pagos', 'Citas', 'Archivos', 'Recordatorios'] as const;
type Tab = (typeof TABS)[number];

const estadoBadgeVariant: Record<string, any> = {
  ACTIVO: 'activo',
  GANADO: 'ganado',
  PERDIDO: 'perdido',
  ARCHIVADO: 'archivado',
};

interface Props {
  clienteId: string;
  session: SessionUser;
}

export default function ClienteExpediente({ clienteId, session }: Props) {
  const { toast } = useToastContext();
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<Tab>('Resumen');
  const [perdidoOpen, setPerdidoOpen] = useState(false);
  const [motivo, setMotivo] = useState('');

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/clientes/' + clienteId);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error('Error');
      const data = await res.json();
      setCliente(data.cliente);
    } catch {
      toast('Error al cargar el cliente', 'error');
    } finally {
      setLoading(false);
    }
  }, [clienteId, toast]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function cambiarEtapa(etapa: string) {
    try {
      const res = await fetch('/api/clientes/' + clienteId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapa }),
      });
      if (!res.ok) throw new Error();
      toast('Etapa actualizada', 'success');
      refetch();
    } catch {
      toast('No se pudo actualizar la etapa', 'error');
    }
  }

  async function cambiarEstado(estado: string, motivoTexto?: string) {
    try {
      const res = await fetch('/api/clientes/' + clienteId + '/estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, motivo: motivoTexto }),
      });
      if (!res.ok) throw new Error();
      toast('Estado actualizado', 'success');
      setPerdidoOpen(false);
      setMotivo('');
      refetch();
    } catch {
      toast('No se pudo actualizar el estado', 'error');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !cliente) {
    return (
      <EmptyState
        icon={<XCircle className="w-12 h-12" />}
        title="Cliente no encontrado"
        description="El cliente que buscas no existe o fue eliminado."
        action={{ label: 'Volver a clientes', onClick: () => (window.location.href = '/clientes') }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-fg)] hover:text-[var(--fg)]"
      >
        <ArrowLeft className="w-4 h-4" />
        Clientes
      </Link>

      {/* Header */}
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[var(--fg)]">{cliente.nombre}</h1>
              <Badge variant={estadoBadgeVariant[cliente.estado] || 'default'} />
              <span className="text-xl" title={cliente.temperatura}>
                {temperaturaIcon(cliente.temperatura)}
              </span>
            </div>
            <div className="flex items-center gap-4 flex-wrap text-sm text-[var(--muted-fg)]">
              {cliente.telefono && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {cliente.telefono}
                </span>
              )}
              {cliente.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {cliente.email}
                </span>
              )}
            </div>
          </div>
          {cliente.telefono && (
            <a
              href={buildWhatsAppUrl(cliente.telefono, 'Hola ' + cliente.nombre)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="success" size="sm">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
            </a>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 pt-2 border-t border-[var(--border-color)]">
          <div className="w-full sm:w-56">
            <Select
              label="Etapa"
              options={ETAPAS.map((e) => ({ value: e, label: e }))}
              value={cliente.etapa || ''}
              onChange={(e) => cambiarEtapa(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="success" size="sm" onClick={() => cambiarEstado('GANADO')}>
              <Trophy className="w-4 h-4" />
              Marcar GANADO
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setPerdidoOpen(true)}>
              <XCircle className="w-4 h-4" />
              Marcar PERDIDO
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-[var(--border-color)]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-[#e05a5a] text-[#e05a5a]'
                : 'border-transparent text-[var(--muted-fg)] hover:text-[var(--fg)]',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        {tab === 'Resumen' && <ResumenTab cliente={cliente} />}
        {tab === 'Interacciones' && (
          <InteraccionesTab cliente={cliente} clienteId={clienteId} refetch={refetch} />
        )}
        {tab === 'Notas' && <NotasTab cliente={cliente} clienteId={clienteId} refetch={refetch} />}
        {tab === 'Pagos' && <PagosTab cliente={cliente} clienteId={clienteId} refetch={refetch} />}
        {tab === 'Citas' && <CitasTab cliente={cliente} clienteId={clienteId} refetch={refetch} />}
        {tab === 'Archivos' && (
          <ArchivosTab cliente={cliente} clienteId={clienteId} refetch={refetch} />
        )}
        {tab === 'Recordatorios' && (
          <RecordatoriosTab cliente={cliente} clienteId={clienteId} refetch={refetch} />
        )}
      </div>

      <Modal open={perdidoOpen} onClose={() => setPerdidoOpen(false)} title="Marcar como PERDIDO">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--fg)]">Motivo</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="¿Por qué se perdió este cliente?"
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#e05a5a]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPerdidoOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => cambiarEstado('PERDIDO', motivo)}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-[var(--fg)] mb-3">{children}</h2>;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-[var(--muted-fg)]">{label}</dt>
      <dd className="text-sm text-[var(--fg)] mt-0.5">{value || '—'}</dd>
    </div>
  );
}

function ResumenTab({ cliente }: { cliente: any }) {
  return (
    <Card className="p-5">
      <SectionTitle>Información del cliente</SectionTitle>
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="Teléfono" value={cliente.telefono} />
        <Field label="Email" value={cliente.email} />
        <Field label="Origen" value={cliente.origen} />
        <Field label="Etapa" value={cliente.etapa} />
        <Field label="Vendedor" value={cliente.vendedor?.nombre} />
        <Field
          label="Valor estimado"
          value={cliente.valorEstimado != null ? formatCurrency(cliente.valorEstimado) : null}
        />
        <Field
          label="Fecha de creación"
          value={cliente.fechaCreacion ? formatDate(cliente.fechaCreacion) : null}
        />
        <Field
          label="Último contacto"
          value={cliente.ultimoContacto ? formatDate(cliente.ultimoContacto) : null}
        />
        <Field label="Próxima acción" value={cliente.proximaAccion} />
        <Field
          label="Fecha próxima acción"
          value={cliente.proximaAccionFecha ? formatDateShort(cliente.proximaAccionFecha) : null}
        />
      </dl>
      {cliente.notas && (
        <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
          <dt className="text-xs text-[var(--muted-fg)] mb-1">Notas</dt>
          <p className="text-sm text-[var(--fg)] whitespace-pre-wrap">{cliente.notas}</p>
        </div>
      )}
    </Card>
  );
}

function InteraccionesTab({
  cliente,
  clienteId,
  refetch,
}: {
  cliente: any;
  clienteId: string;
  refetch: () => void;
}) {
  const { toast } = useToastContext();
  const [tipo, setTipo] = useState('Llamada');
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);
  const lista: any[] = cliente.interacciones || [];

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!descripcion.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/clientes/' + clienteId + '/interacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, descripcion }),
      });
      if (!res.ok) throw new Error();
      toast('Interacción registrada', 'success');
      setDescripcion('');
      refetch();
    } catch {
      toast('No se pudo registrar', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <SectionTitle>Registrar interacción</SectionTitle>
        <form onSubmit={add} className="flex flex-col gap-3">
          <Select
            options={TIPOS_INTERACCION.map((t) => ({ value: t, label: t }))}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          />
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder="Describe la interacción..."
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#e05a5a]"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={saving}>
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <SectionTitle>Historial</SectionTitle>
        {lista.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)]">Sin interacciones aún.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {lista.map((i) => (
              <li key={i.id} className="flex gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-[#e05a5a] shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--fg)]">{i.tipo}</span>
                    <span className="text-xs text-[var(--muted-fg)]">{formatDate(i.fecha)}</span>
                  </div>
                  <p className="text-sm text-[var(--fg)] whitespace-pre-wrap">{i.descripcion}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function NotasTab({
  cliente,
  clienteId,
  refetch,
}: {
  cliente: any;
  clienteId: string;
  refetch: () => void;
}) {
  const { toast } = useToastContext();
  const [contenido, setContenido] = useState('');
  const [saving, setSaving] = useState(false);
  const lista: any[] = cliente.notas_ || [];

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!contenido.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/clientes/' + clienteId + '/notas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido }),
      });
      if (!res.ok) throw new Error();
      toast('Nota agregada', 'success');
      setContenido('');
      refetch();
    } catch {
      toast('No se pudo agregar la nota', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <SectionTitle>Nueva nota</SectionTitle>
        <form onSubmit={add} className="flex flex-col gap-3">
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            rows={3}
            placeholder="Escribe una nota..."
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#e05a5a]"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={saving}>
              <Plus className="w-4 h-4" />
              Agregar nota
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <SectionTitle>Notas</SectionTitle>
        {lista.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)]">Sin notas aún.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {lista.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-[var(--border-color)] p-3 bg-[var(--bg)]"
              >
                <p className="text-sm text-[var(--fg)] whitespace-pre-wrap">{n.contenido}</p>
                <span className="text-xs text-[var(--muted-fg)]">
                  {formatDate(n.fechaCreacion || n.fecha)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function pagoBadgeVariant(estatus: string): any {
  if (estatus === 'pagado') return 'ganado';
  if (estatus === 'vencido') return 'perdido';
  return 'tibio';
}

function PagosTab({
  cliente,
  clienteId,
  refetch,
}: {
  cliente: any;
  clienteId: string;
  refetch: () => void;
}) {
  const { toast } = useToastContext();
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('');
  const [concepto, setConcepto] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [saving, setSaving] = useState(false);
  const lista: any[] = cliente.pagos || [];

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!monto) {
      toast('El monto es obligatorio', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/clientes/' + clienteId + '/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto: parseFloat(monto),
          metodo,
          concepto,
          fechaVencimiento: fechaVencimiento || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast('Pago agregado', 'success');
      setMonto('');
      setMetodo('');
      setConcepto('');
      setFechaVencimiento('');
      refetch();
    } catch {
      toast('No se pudo agregar el pago', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <SectionTitle>Agregar pago</SectionTitle>
        <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Monto"
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
          />
          <Input
            label="Método"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
            placeholder="Efectivo, transferencia..."
          />
          <Input
            label="Concepto"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Concepto del pago"
          />
          <Input
            label="Fecha de vencimiento"
            type="date"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
          />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" size="sm" loading={saving}>
              <Plus className="w-4 h-4" />
              Agregar pago
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <SectionTitle>Pagos</SectionTitle>
        {lista.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)]">Sin pagos registrados.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {lista.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border-color)] p-3 bg-[var(--bg)]"
              >
                <div>
                  <div className="text-sm font-medium text-[var(--fg)]">
                    {formatCurrency(p.monto)}
                  </div>
                  <div className="text-xs text-[var(--muted-fg)]">
                    {p.concepto || 'Sin concepto'}
                    {p.fechaVencimiento && ' · vence ' + formatDateShort(p.fechaVencimiento)}
                  </div>
                </div>
                <Badge variant={pagoBadgeVariant(p.estatus)} label={p.estatus} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function CitasTab({
  cliente,
  clienteId,
  refetch,
}: {
  cliente: any;
  clienteId: string;
  refetch: () => void;
}) {
  const { toast } = useToastContext();
  const [titulo, setTitulo] = useState('');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);
  const lista: any[] = cliente.citas || [];

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !inicio) {
      toast('Título e inicio son obligatorios', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/clientes/' + clienteId + '/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          inicio: new Date(inicio).toISOString(),
          fin: fin ? new Date(fin).toISOString() : null,
          notas,
        }),
      });
      if (!res.ok) throw new Error();
      toast('Cita agendada', 'success');
      setTitulo('');
      setInicio('');
      setFin('');
      setNotas('');
      refetch();
    } catch {
      toast('No se pudo agendar la cita', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <SectionTitle>Agendar cita</SectionTitle>
        <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título de la cita"
            />
          </div>
          <Input
            label="Inicio"
            type="datetime-local"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
          <Input
            label="Fin"
            type="datetime-local"
            value={fin}
            onChange={(e) => setFin(e.target.value)}
          />
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--fg)]">Notas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#e05a5a]"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" size="sm" loading={saving}>
              <Plus className="w-4 h-4" />
              Agendar
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <SectionTitle>Citas</SectionTitle>
        {lista.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)]">Sin citas agendadas.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {lista.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-[var(--border-color)] p-3 bg-[var(--bg)]"
              >
                <div className="text-sm font-medium text-[var(--fg)]">{c.titulo}</div>
                <div className="text-xs text-[var(--muted-fg)]">
                  {formatDate(c.inicio)}
                  {c.fin && ' — ' + formatDate(c.fin)}
                </div>
                {c.notas && (
                  <p className="text-sm text-[var(--fg)] mt-1 whitespace-pre-wrap">{c.notas}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function ArchivosTab({
  cliente,
  clienteId,
  refetch,
}: {
  cliente: any;
  clienteId: string;
  refetch: () => void;
}) {
  const { toast } = useToastContext();
  const [uploading, setUploading] = useState(false);
  const lista: any[] = cliente.archivos || [];

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const datos = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1] || '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/clientes/' + clienteId + '/archivos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: file.name,
          tipo: file.type,
          tamano: file.size,
          datos,
          etiqueta: 'Otro',
        }),
      });
      if (!res.ok) throw new Error();
      toast('Archivo subido', 'success');
      refetch();
    } catch {
      toast('No se pudo subir el archivo', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <SectionTitle>Subir archivo</SectionTitle>
        <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-[var(--fg)]">
          <span className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[var(--border-color)] hover:bg-[var(--muted)]">
            {uploading ? <Spinner size="sm" /> : <Paperclip className="w-4 h-4" />}
            {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
          </span>
          <input type="file" className="hidden" onChange={onFile} disabled={uploading} />
        </label>
      </Card>

      <Card className="p-5">
        <SectionTitle>Archivos</SectionTitle>
        {lista.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)]">Sin archivos.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {lista.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border-color)] p-3 bg-[var(--bg)]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="w-4 h-4 text-[var(--muted-fg)] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-[var(--fg)] truncate">{a.nombre}</div>
                    <div className="text-xs text-[var(--muted-fg)]">{a.etiqueta || a.tipo}</div>
                  </div>
                </div>
                {a.url && (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--muted-fg)] hover:text-[#e05a5a]"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function RecordatoriosTab({
  cliente,
  clienteId,
  refetch,
}: {
  cliente: any;
  clienteId: string;
  refetch: () => void;
}) {
  const { toast } = useToastContext();
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [saving, setSaving] = useState(false);
  const lista: any[] = cliente.recordatorios || [];

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !fecha) {
      toast('Título y fecha son obligatorios', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/clientes/' + clienteId + '/recordatorios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, fecha: new Date(fecha).toISOString() }),
      });
      if (!res.ok) throw new Error();
      toast('Recordatorio creado', 'success');
      setTitulo('');
      setFecha('');
      refetch();
    } catch {
      toast('No se pudo crear el recordatorio', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <SectionTitle>Nuevo recordatorio</SectionTitle>
        <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Recordatorio"
          />
          <Input
            label="Fecha"
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" size="sm" loading={saving}>
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <SectionTitle>Recordatorios</SectionTitle>
        {lista.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)]">Sin recordatorios.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {lista.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border-color)] p-3 bg-[var(--bg)]"
              >
                <span className="text-sm text-[var(--fg)]">{r.titulo}</span>
                <span className="text-xs text-[var(--muted-fg)]">{formatDate(r.fecha)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
