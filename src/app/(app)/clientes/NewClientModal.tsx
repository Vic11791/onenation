'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToastContext } from '@/components/ui/Toast';
import type { SessionUser } from '@/lib/auth';

interface NewClientModalProps {
  open: boolean;
  onClose: () => void;
  session: SessionUser;
}

const ETAPAS = ['Nuevo', 'Contactado', 'Calificado', 'Propuesta', 'Negociación'];
const ORIGENES = ['Referido', 'Facebook', 'Instagram', 'TikTok', 'Google', 'WhatsApp', 'Otro'];
const TEMPERATURAS = [
  { value: 'FRIO', label: 'Frío' },
  { value: 'TIBIO', label: 'Tibio' },
  { value: 'CALIENTE', label: 'Caliente' },
];

export default function NewClientModal({ open, onClose, session }: NewClientModalProps) {
  const router = useRouter();
  const { toast } = useToastContext();
  const isAdmin = session.rol === 'ADMIN';

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [origen, setOrigen] = useState('');
  const [temperatura, setTemperatura] = useState('TIBIO');
  const [etapa, setEtapa] = useState('Nuevo');
  const [notas, setNotas] = useState('');
  const [vendedorId, setVendedorId] = useState('');
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && isAdmin && usuarios.length === 0) {
      fetch('/api/usuarios')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setUsuarios(Array.isArray(data) ? data : data.usuarios || []);
        })
        .catch(() => {});
    }
  }, [open, isAdmin, usuarios.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) {
      toast('Nombre y teléfono son obligatorios', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const body: any = { nombre, telefono, email, origen, temperatura, etapa, notas };
      if (isAdmin && vendedorId) body.vendedorId = vendedorId;
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error al crear cliente');
      const data = await res.json();
      toast('Cliente creado', 'success');
      onClose();
      router.push('/clientes/' + data.cliente.id);
    } catch (err: any) {
      toast(err.message || 'Error al crear cliente', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo cliente" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre *"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre completo"
          required
        />
        <Input
          label="Teléfono *"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="+52 ..."
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Origen"
            options={ORIGENES.map((o) => ({ value: o, label: o }))}
            placeholder="Selecciona origen"
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
          />
          <Select
            label="Temperatura"
            options={TEMPERATURAS}
            value={temperatura}
            onChange={(e) => setTemperatura(e.target.value)}
          />
        </div>
        <Select
          label="Etapa"
          options={ETAPAS.map((et) => ({ value: et, label: et }))}
          value={etapa}
          onChange={(e) => setEtapa(e.target.value)}
        />
        {isAdmin && (
          <Select
            label="Vendedor"
            options={usuarios.map((u) => ({ value: u.id, label: u.nombre }))}
            placeholder="Asignar vendedor"
            value={vendedorId}
            onChange={(e) => setVendedorId(e.target.value)}
          />
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[var(--fg)]">Notas</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Notas iniciales..."
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#e05a5a] focus:border-[#e05a5a]"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            Crear cliente
          </Button>
        </div>
      </form>
    </Modal>
  );
}
