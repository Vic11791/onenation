'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Check, Clock, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToastContext } from '@/components/ui/Toast'
import type { SessionUser } from '@/lib/auth'
import {
  buildWhatsAppUrl,
  diasSinContacto,
  formatDateShort,
  startOfDay,
  temperaturaIcon,
} from '@/lib/utils'

type Cliente = {
  id: string
  nombre: string
  telefono?: string | null
  etapa: string
  temperatura: string
  valorEstimado: number
  proximaAccion?: string | null
  proximaAccionFecha?: string | null
  ultimoContacto?: string | null
  vendedor?: { nombre: string }
}

type Tone = 'red' | 'amber' | 'blue'

const toneStyles: Record<Tone, { border: string; head: string; icon: string }> = {
  red: {
    border: 'border-red-500/40',
    head: 'text-red-600',
    icon: 'text-red-500',
  },
  amber: {
    border: 'border-amber-500/40',
    head: 'text-amber-600',
    icon: 'text-amber-500',
  },
  blue: {
    border: 'border-blue-500/40',
    head: 'text-blue-600',
    icon: 'text-blue-500',
  },
}

export default function SeguimientoClient({ session }: { session: SessionUser }) {
  void session
  const { toast } = useToastContext()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const res = await fetch('/api/clientes?estado=ACTIVO&per=100')
        const data = await res.json()
        if (!cancel) setClientes(data.clientes ?? [])
      } catch {
        if (!cancel) toast('No se pudieron cargar los clientes', 'error')
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [toast])

  const { urgentes, sinContacto, nuevos } = useMemo(() => {
    const hoy = startOfDay()
    const seen = new Set<string>()
    const urgentes: Cliente[] = []
    const sinContacto: Cliente[] = []
    const nuevos: Cliente[] = []

    for (const c of clientes) {
      if (done.has(c.id)) continue
      if (
        c.proximaAccionFecha != null &&
        startOfDay(new Date(c.proximaAccionFecha)).getTime() <= hoy.getTime()
      ) {
        urgentes.push(c)
        seen.add(c.id)
      }
    }
    for (const c of clientes) {
      if (done.has(c.id) || seen.has(c.id)) continue
      if (c.ultimoContacto && diasSinContacto(c.ultimoContacto) >= 3) {
        sinContacto.push(c)
        seen.add(c.id)
      }
    }
    for (const c of clientes) {
      if (done.has(c.id) || seen.has(c.id)) continue
      if (c.etapa === 'Nuevo' && !c.ultimoContacto) {
        nuevos.push(c)
        seen.add(c.id)
      }
    }
    return { urgentes, sinContacto, nuevos }
  }, [clientes, done])

  async function marcarHecho(c: Cliente) {
    setDone((prev) => new Set(prev).add(c.id))
    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/clientes/${c.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proximaAccionFecha: null, proximaAccion: null }),
        }),
        fetch(`/api/clientes/${c.id}/interacciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'Sistema', descripcion: 'Acción completada' }),
        }),
      ])
      if (!r1.ok || !r2.ok) throw new Error()
      toast('Acción marcada como hecha', 'success')
    } catch {
      setDone((prev) => {
        const next = new Set(prev)
        next.delete(c.id)
        return next
      })
      toast('No se pudo completar la acción', 'error')
    }
  }

  function Row({ c }: { c: Cliente }) {
    const dias = diasSinContacto(c.ultimoContacto)
    const wa = c.telefono
      ? buildWhatsAppUrl(c.telefono, `Hola ${c.nombre}, te escribo desde el equipo.`)
      : null
    return (
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border-color)] py-3 last:border-0">
        <div className="min-w-0 flex-1">
          <Link
            href={`/clientes/${c.id}`}
            className="flex items-center gap-1.5 font-medium text-[var(--fg)] hover:text-[#e05a5a] hover:underline"
          >
            <span>{temperaturaIcon(c.temperatura)}</span>
            <span className="truncate">{c.nombre}</span>
          </Link>
          <div className="mt-0.5 text-xs text-[var(--muted-fg)]">
            {dias >= 999 ? 'Sin contacto previo' : `${dias} días sin contacto`}
            {c.proximaAccion ? ` · ${c.proximaAccion}` : ''}
            {c.proximaAccionFecha ? ` (${formatDateShort(c.proximaAccionFecha)})` : ''}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </a>
          )}
          <Button size="sm" onClick={() => marcarHecho(c)}>
            <Check className="h-4 w-4" />
            Marcar hecho
          </Button>
        </div>
      </div>
    )
  }

  function Section({
    title,
    tone,
    icon,
    items,
  }: {
    title: string
    tone: Tone
    icon: React.ReactNode
    items: Cliente[]
  }) {
    if (items.length === 0) return null
    const s = toneStyles[tone]
    return (
      <div className={`rounded-xl border bg-[var(--card-bg)] ${s.border}`}>
        <div className="flex items-center gap-2 px-4 pt-4">
          <span className={s.icon}>{icon}</span>
          <h2 className={`text-sm font-semibold ${s.head}`}>{title}</h2>
          <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-fg)]">
            {items.length}
          </span>
        </div>
        <div className="px-4 pb-2">
          {items.map((c) => (
            <Row key={c.id} c={c} />
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const allClear =
    urgentes.length === 0 && sinContacto.length === 0 && nuevos.length === 0

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-[var(--fg)]">Hoy te toca</h1>
      {allClear ? (
        <EmptyState
          title="¡Todo al día!"
          description="No tienes acciones pendientes por ahora."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <Section
            title="Urgentes"
            tone="red"
            icon={<AlertTriangle className="h-4 w-4" />}
            items={urgentes}
          />
          <Section
            title="Sin contacto 3+ días"
            tone="amber"
            icon={<Clock className="h-4 w-4" />}
            items={sinContacto}
          />
          <Section
            title="Nuevos sin contacto"
            tone="blue"
            icon={<Sparkles className="h-4 w-4" />}
            items={nuevos}
          />
        </div>
      )}
    </div>
  )
}
