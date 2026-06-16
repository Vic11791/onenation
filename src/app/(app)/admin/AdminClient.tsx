'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToastContext } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface Auditoria {
  id: string;
  accion: string | null;
  entidad: string | null;
  descripcion: string | null;
  fecha: Date | string | null;
  usuario?: { nombre: string } | null;
}

interface Config {
  nombre?: string;
  moneda?: string;
  simboloMoneda?: string;
  metaMes?: number;
  horarioInicio?: number;
  horarioFin?: number;
  duracionCita?: number;
  mensajeWhatsapp?: string;
  umbralEstancado?: number;
  motivosPerdida?: string;
  metodosPago?: string;
}

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  metaMes?: number;
}

type Tab = 'config' | 'usuarios' | 'auditoria';

export default function AdminClient({ auditoria }: { auditoria: Auditoria[] }) {
  const { toast } = useToastContext();
  const [tab, setTab] = useState<Tab>('config');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Administración</h1>
        <p className="text-sm text-[var(--muted-fg)]">
          Configuración del negocio, usuarios y registro de actividad.
        </p>
      </div>

      <div className="flex gap-1 border-b border-[var(--border-color)]">
        {(
          [
            ['config', 'Configuración'],
            ['usuarios', 'Usuarios'],
            ['auditoria', 'Auditoría'],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors',
              tab === t
                ? 'border-[#e05a5a] text-[#e05a5a]'
                : 'border-transparent text-[var(--muted-fg)] hover:text-[var(--fg)]',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'config' && <ConfigTab toast={toast} />}
      {tab === 'usuarios' && <UsuariosTab toast={toast} />}
      {tab === 'auditoria' && <AuditoriaTab auditoria={auditoria} />}
    </div>
  );
}

type ToastFn = (m: string, t?: 'success' | 'error' | 'info' | 'warning') => void;

function ConfigTab({ toast }: { toast: ToastFn }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin')
      .then((r) => r.json())
      .then((d) => setConfig(d.config || {}))
      .catch(() => setConfig({}))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof Config, v: string | number) =>
    setConfig((c) => ({ ...(c || {}), [k]: v }));

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) throw new Error();
      toast('Configuración guardada', 'success');
    } catch {
      toast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  if (!config) return null;

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col gap-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nombre del negocio"
            value={config.nombre ?? ''}
            onChange={(e) => set('nombre', e.target.value)}
          />
          <Input
            label="Moneda"
            value={config.moneda ?? ''}
            onChange={(e) => set('moneda', e.target.value)}
          />
          <Input
            label="Símbolo de moneda"
            value={config.simboloMoneda ?? ''}
            onChange={(e) => set('simboloMoneda', e.target.value)}
          />
          <Input
            label="Meta mensual"
            type="number"
            value={String(config.metaMes ?? '')}
            onChange={(e) => set('metaMes', Number(e.target.value))}
          />
          <Input
            label="Horario inicio (hora)"
            type="number"
            value={String(config.horarioInicio ?? '')}
            onChange={(e) => set('horarioInicio', Number(e.target.value))}
          />
          <Input
            label="Horario fin (hora)"
            type="number"
            value={String(config.horarioFin ?? '')}
            onChange={(e) => set('horarioFin', Number(e.target.value))}
          />
          <Input
            label="Duración de cita (min)"
            type="number"
            value={String(config.duracionCita ?? '')}
            onChange={(e) => set('duracionCita', Number(e.target.value))}
          />
          <Input
            label="Umbral estancado (días)"
            type="number"
            value={String(config.umbralEstancado ?? '')}
            onChange={(e) => set('umbralEstancado', Number(e.target.value))}
          />
        </div>

        <Textarea
          label="Mensaje de WhatsApp"
          value={config.mensajeWhatsapp ?? ''}
          onChange={(v) => set('mensajeWhatsapp', v)}
        />
        <Textarea
          label="Motivos de pérdida (separados por coma)"
          value={config.motivosPerdida ?? ''}
          onChange={(v) => set('motivosPerdida', v)}
        />
        <Textarea
          label="Métodos de pago (separados por coma)"
          value={config.metodosPago ?? ''}
          onChange={(v) => set('metodosPago', v)}
        />

        <div>
          <Button onClick={save} loading={saving}>
            Guardar cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[var(--fg)]">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] text-sm bg-[var(--bg)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[#e05a5a] focus:border-[#e05a5a] transition-colors"
      />
    </div>
  );
}

function UsuariosTab({ toast }: { toast: ToastFn }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'VENDEDOR',
    metaMes: '',
  });

  const load = () => {
    setLoading(true);
    fetch('/api/usuarios')
      .then((r) => r.json())
      .then((d) => setUsuarios(d.usuarios || []))
      .catch(() => setUsuarios([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          rol: form.rol,
          metaMes: form.metaMes ? Number(form.metaMes) : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      toast('Usuario creado', 'success');
      setOpen(false);
      setForm({ nombre: '', email: '', password: '', rol: 'VENDEDOR', metaMes: '' });
      load();
    } catch {
      toast('Error al crear usuario', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col gap-4">
        <div className="flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> Nuevo usuario
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left text-[var(--muted-fg)]">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[var(--border-color)] last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--fg)]">{u.nombre}</td>
                    <td className="px-4 py-3 text-[var(--muted-fg)]">{u.email}</td>
                    <td className="px-4 py-3 text-[var(--fg)]">{u.rol}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={u.activo ? 'activo' : 'archivado'}
                        label={u.activo ? 'Activo' : 'Inactivo'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo usuario">
        <div className="flex flex-col gap-4">
          <Input
            label="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select
            label="Rol"
            options={[
              { value: 'VENDEDOR', label: 'Vendedor' },
              { value: 'ADMIN', label: 'Administrador' },
            ]}
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value })}
          />
          <Input
            label="Meta mensual"
            type="number"
            value={form.metaMes}
            onChange={(e) => setForm({ ...form, metaMes: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={create} loading={saving}>
              Crear
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function AuditoriaTab({ auditoria }: { auditoria: Auditoria[] }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-left text-[var(--muted-fg)]">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Acción</th>
                <th className="px-4 py-3 font-medium">Entidad</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {auditoria.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-[var(--border-color)] last:border-0"
                >
                  <td className="px-4 py-3 text-[var(--muted-fg)] whitespace-nowrap">
                    {formatDateTime(a.fecha)}
                  </td>
                  <td className="px-4 py-3 text-[var(--fg)]">
                    {a.usuario?.nombre ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--fg)]">{a.accion ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--muted-fg)]">{a.entidad ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--muted-fg)]">
                    {a.descripcion ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
