'use client';

import { useState } from 'react';
import { CheckCircle2, Calendar, Clock } from 'lucide-react';

interface Slot {
  inicio: string;
  fin: string;
  disponible: boolean;
}

interface Props {
  slug: string;
  vendedor: { nombre: string; avatar?: string | null };
}

function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function PublicBooking({ slug, vendedor }: Props) {
  const [fecha, setFecha] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selected, setSelected] = useState<Slot | null>(null);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const loadSlots = async (f: string) => {
    setFecha(f);
    setSelected(null);
    setSlots([]);
    setError('');
    if (!f) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/agenda/${slug}/slots?fecha=${f}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar horarios');
      setSlots(data.slots || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingSlots(false);
    }
  };

  const book = async () => {
    if (!nombre || !telefono) {
      setError('Nombre y teléfono son obligatorios');
      return;
    }
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/agenda/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          telefono,
          email,
          inicio: selected.inicio,
          fin: selected.fin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo agendar');
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden">
        <div className="h-2 bg-[#e05a5a]" />
        <div className="p-6 flex flex-col gap-5">
          {done ? (
            <div className="flex flex-col items-center text-center gap-3 py-6">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
              <h1 className="text-xl font-bold text-[var(--fg)]">
                ¡Listo! Tu cita quedó agendada
              </h1>
              <p className="text-sm text-[var(--muted-fg)]">
                {selected && (
                  <>
                    {new Date(selected.inicio).toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}{' '}
                    a las {fmtTime(selected.inicio)}
                  </>
                )}
              </p>
              <p className="text-sm text-[var(--muted-fg)]">
                {vendedor.nombre} se pondrá en contacto contigo.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {vendedor.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vendedor.avatar}
                    alt={vendedor.nombre}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#e05a5a] text-white flex items-center justify-center text-lg font-semibold">
                    {vendedor.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-bold text-[var(--fg)]">Agenda tu cita</h1>
                  <p className="text-sm text-[var(--muted-fg)]">con {vendedor.nombre}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--fg)] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Elige una fecha
                </label>
                <input
                  type="date"
                  min={todayStr()}
                  value={fecha}
                  onChange={(e) => loadSlots(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] text-sm bg-[var(--bg)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[#e05a5a] focus:border-[#e05a5a]"
                />
              </div>

              {fecha && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[var(--fg)] flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Horarios disponibles
                  </span>
                  {loadingSlots ? (
                    <p className="text-sm text-[var(--muted-fg)]">Cargando horarios…</p>
                  ) : slots.filter((s) => s.disponible).length === 0 ? (
                    <p className="text-sm text-[var(--muted-fg)]">
                      No hay horarios disponibles para este día.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots
                        .filter((s) => s.disponible)
                        .map((s) => (
                          <button
                            key={s.inicio}
                            onClick={() => setSelected(s)}
                            className={[
                              'h-9 rounded-lg border text-sm font-medium transition-colors',
                              selected?.inicio === s.inicio
                                ? 'bg-[#e05a5a] text-white border-[#e05a5a]'
                                : 'border-[var(--border-color)] text-[var(--fg)] hover:bg-[var(--muted)]',
                            ].join(' ')}
                          >
                            {fmtTime(s.inicio)}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {selected && (
                <div className="flex flex-col gap-3 pt-1 border-t border-[var(--border-color)]">
                  <span className="text-sm font-medium text-[var(--fg)] mt-3">Tus datos</span>
                  <Field
                    label="Nombre *"
                    value={nombre}
                    onChange={setNombre}
                    placeholder="Tu nombre"
                  />
                  <Field
                    label="Teléfono *"
                    value={telefono}
                    onChange={setTelefono}
                    placeholder="10 dígitos"
                    type="tel"
                  />
                  <Field
                    label="Email"
                    value={email}
                    onChange={setEmail}
                    placeholder="opcional"
                    type="email"
                  />
                  <button
                    onClick={book}
                    disabled={submitting}
                    className="h-11 rounded-lg bg-[#e05a5a] text-white font-medium hover:bg-[#c94e4e] transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Agendando…' : 'Confirmar cita'}
                  </button>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[var(--fg)]">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg border border-[var(--border-color)] text-sm bg-[var(--bg)] text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-[#e05a5a] focus:border-[#e05a5a]"
      />
    </div>
  );
}
