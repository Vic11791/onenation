'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { useToastContext } from '@/components/ui/Toast'
import type { SessionUser } from '@/lib/auth'
import { isSameDay, startOfDay } from '@/lib/utils'

type Cita = {
  id: string
  titulo: string
  inicio: string
  fin: string
  estado?: string
  notas?: string | null
  cliente?: { id: string; nombre: string; telefono?: string | null }
}

type ClienteOpt = { id: string; nombre: string }

function weekStart(d: Date): Date {
  const s = startOfDay(d)
  s.setDate(s.getDate() - s.getDay()) // Sunday start
  return s
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AgendaClient({ session }: { session: SessionUser }) {
  void session
  const { toast } = useToastContext()
  const [week, setWeek] = useState<Date>(() => weekStart(new Date()))
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Cita | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [clienteOpts, setClienteOpts] = useState<ClienteOpt[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    clienteId: '',
    titulo: '',
    inicio: '',
    fin: '',
    notas: '',
  })

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(week, i)),
    [week]
  )

  const loadCitas = useCallback(async () => {
    setLoading(true)
    try {
      const desde = week.toISOString()
      const hasta = addDays(week, 7).toISOString()
      const res = await fetch(
        `/api/citas?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`
      )
      const data = await res.json()
      setCitas(data.citas ?? [])
    } catch {
      toast('No se pudieron cargar las citas', 'error')
    } finally {
      setLoading(false)
    }
  }, [week, toast])

  useEffect(() => {
    loadCitas()
  }, [loadCitas])

  async function openForm() {
    setForm({ clienteId: '', titulo: '', inicio: '', fin: '', notas: '' })
    setFormOpen(true)
    if (clienteOpts.length === 0) {
      try {
        const res = await fetch('/api/clientes?per=100')
        const data = await res.json()
        setClienteOpts(
          (data.clientes ?? []).map((c: any) => ({ id: c.id, nombre: c.nombre }))
        )
      } catch {
        toast('No se pudieron cargar los clientes', 'error')
      }
    }
  }

  async function submitCita() {
    if (!form.clienteId || !form.titulo || !form.inicio || !form.fin) {
      toast('Completa los campos requeridos', 'warning')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: form.clienteId,
          titulo: form.titulo,
          inicio: new Date(form.inicio).toISOString(),
          fin: new Date(form.fin).toISOString(),
          notas: form.notas || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      toast('Cita agendada', 'success')
      setFormOpen(false)
      await loadCitas()
    } catch {
      toast('No se pudo agendar la cita', 'error')
    } finally {
      setSaving(false)
    }
  }

  const today = new Date()
  const rangeLabel = `${days[0].toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  })} – ${days[6].toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[var(--fg)]">Agenda</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeek((w) => addDays(w, -7))}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeek(weekStart(new Date()))}>
            Hoy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeek((w) => addDays(w, 7))}
            aria-label="Semana siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 hidden text-sm text-[var(--muted-fg)] sm:inline">
            {rangeLabel}
          </span>
          <Button size="sm" onClick={openForm}>
            <CalendarPlus className="h-4 w-4" />
            Agendar cita
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
          {days.map((day) => {
            const dayCitas = citas
              .filter((c) => isSameDay(c.inicio, day))
              .sort(
                (a, b) =>
                  new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
              )
            const isToday = isSameDay(day, today)
            return (
              <div
                key={day.toISOString()}
                className={[
                  'flex min-h-[160px] flex-col rounded-xl border bg-[var(--card-bg)] p-2',
                  isToday ? 'border-[#e05a5a]' : 'border-[var(--border-color)]',
                ].join(' ')}
              >
                <div className="mb-2 flex items-baseline justify-between px-1">
                  <span className="text-xs font-medium text-[var(--muted-fg)]">
                    {DAY_NAMES[day.getDay()]}
                  </span>
                  <span
                    className={[
                      'text-sm font-semibold',
                      isToday ? 'text-[#e05a5a]' : 'text-[var(--fg)]',
                    ].join(' ')}
                  >
                    {day.getDate()}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {dayCitas.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className="rounded-lg border border-[#e05a5a]/30 bg-[#e05a5a]/10 px-2 py-1.5 text-left text-xs transition-colors hover:bg-[#e05a5a]/20"
                    >
                      <div className="font-medium text-[var(--fg)]">
                        {fmtTime(c.inicio)}
                      </div>
                      <div className="truncate text-[var(--muted-fg)]">
                        {c.titulo}
                      </div>
                    </button>
                  ))}
                  {dayCitas.length === 0 && (
                    <span className="px-1 text-xs text-[var(--muted-fg)]">—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.titulo}
      >
        {selected && (
          <div className="space-y-3 px-6 pb-6 text-sm">
            <div>
              <span className="text-[var(--muted-fg)]">Cliente: </span>
              <span className="font-medium text-[var(--fg)]">
                {selected.cliente?.nombre ?? '—'}
              </span>
            </div>
            <div>
              <span className="text-[var(--muted-fg)]">Horario: </span>
              <span className="text-[var(--fg)]">
                {fmtTime(selected.inicio)} – {fmtTime(selected.fin)}
              </span>
            </div>
            {selected.estado && (
              <div className="flex items-center gap-2">
                <span className="text-[var(--muted-fg)]">Estado:</span>
                <Badge label={selected.estado} />
              </div>
            )}
            {selected.notas && (
              <div>
                <span className="text-[var(--muted-fg)]">Notas: </span>
                <span className="text-[var(--fg)]">{selected.notas}</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Agendar cita">
        <div className="space-y-3 px-6 pb-6">
          <Select
            label="Cliente"
            placeholder="Selecciona un cliente"
            options={clienteOpts.map((c) => ({ value: c.id, label: c.nombre }))}
            value={form.clienteId}
            onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value }))}
          />
          <Input
            label="Título"
            value={form.titulo}
            onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
          />
          <Input
            label="Inicio"
            type="datetime-local"
            value={form.inicio}
            onChange={(e) => setForm((f) => ({ ...f, inicio: e.target.value }))}
          />
          <Input
            label="Fin"
            type="datetime-local"
            value={form.fin}
            onChange={(e) => setForm((f) => ({ ...f, fin: e.target.value }))}
          />
          <Input
            label="Notas"
            value={form.notas}
            onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submitCita} loading={saving}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
