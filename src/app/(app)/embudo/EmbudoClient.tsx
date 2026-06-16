'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { CalendarClock, GripVertical } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToastContext } from '@/components/ui/Toast'
import type { SessionUser } from '@/lib/auth'
import {
  diasSinContacto,
  formatCurrency,
  formatDateShort,
  temperaturaIcon,
} from '@/lib/utils'

const ETAPAS = ['Nuevo', 'Contactado', 'Calificado', 'Propuesta', 'Negociación']

type Cliente = {
  id: string
  nombre: string
  telefono?: string
  etapa: string
  estado?: string
  temperatura: string
  valorEstimado: number
  proximaAccion?: string | null
  proximaAccionFecha?: string | null
  ultimoContacto?: string | null
  vendedor?: { nombre: string }
}

function ClienteCard({ cliente, overlay = false }: { cliente: Cliente; overlay?: boolean }) {
  const dias = diasSinContacto(cliente.ultimoContacto)
  const accionVencida =
    cliente.proximaAccionFecha != null &&
    new Date(cliente.proximaAccionFecha).getTime() < Date.now()

  return (
    <div
      className={[
        'rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-3 text-sm',
        overlay ? 'shadow-[var(--shadow-lg)] rotate-2' : 'shadow-[var(--shadow-sm)]',
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-[var(--muted-fg)]" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span>{temperaturaIcon(cliente.temperatura)}</span>
            <Link
              href={`/clientes/${cliente.id}`}
              onPointerDown={(e) => e.stopPropagation()}
              className="truncate font-medium text-[var(--fg)] hover:text-[#e05a5a] hover:underline"
            >
              {cliente.nombre}
            </Link>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-[var(--muted-fg)]">
            <span>{formatCurrency(cliente.valorEstimado)}</span>
            <span>{dias >= 999 ? 'Sin contacto' : `${dias}d`}</span>
          </div>
          {cliente.proximaAccion && (
            <div
              className={[
                'mt-1.5 flex items-center gap-1 text-xs',
                accionVencida ? 'font-medium text-red-600' : 'text-[var(--muted-fg)]',
              ].join(' ')}
            >
              <CalendarClock className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {cliente.proximaAccion}
                {cliente.proximaAccionFecha
                  ? ` · ${formatDateShort(cliente.proximaAccionFecha)}`
                  : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DraggableCard({ cliente }: { cliente: Cliente }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: cliente.id,
    data: { etapa: cliente.etapa },
  })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-40' : ''}
    >
      <ClienteCard cliente={cliente} />
    </div>
  )
}

function Column({
  etapa,
  clientes,
}: {
  etapa: string
  clientes: Cliente[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa })
  const total = clientes.reduce((s, c) => s + (c.valorEstimado || 0), 0)
  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--fg)]">{etapa}</h3>
          <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-fg)]">
            {clientes.length}
          </span>
        </div>
        <span className="text-xs text-[var(--muted-fg)]">{formatCurrency(total)}</span>
      </div>
      <div
        ref={setNodeRef}
        className={[
          'flex min-h-[200px] flex-1 flex-col gap-2 rounded-xl border border-dashed p-2 transition-colors',
          isOver
            ? 'border-[#e05a5a] bg-[#e05a5a]/5'
            : 'border-[var(--border-color)] bg-[var(--muted)]/30',
        ].join(' ')}
      >
        {clientes.map((c) => (
          <DraggableCard key={c.id} cliente={c} />
        ))}
        {clientes.length === 0 && (
          <p className="py-6 text-center text-xs text-[var(--muted-fg)]">Vacío</p>
        )}
      </div>
    </div>
  )
}

export default function EmbudoClient({ session }: { session: SessionUser }) {
  void session
  const { toast } = useToastContext()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

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

  const grupos = useMemo(() => {
    const map: Record<string, Cliente[]> = {}
    for (const e of ETAPAS) map[e] = []
    for (const c of clientes) {
      if (map[c.etapa]) map[c.etapa].push(c)
      else (map[c.etapa] = map[c.etapa] || []).push(c)
    }
    return map
  }, [clientes])

  const activeCliente = clientes.find((c) => c.id === activeId) || null

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const id = String(active.id)
    const newEtapa = String(over.id)
    const cliente = clientes.find((c) => c.id === id)
    if (!cliente || cliente.etapa === newEtapa || !ETAPAS.includes(newEtapa)) return

    const prevEtapa = cliente.etapa
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, etapa: newEtapa } : c))
    )

    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapa: newEtapa }),
      })
      if (!res.ok) throw new Error()
      toast(`Movido a ${newEtapa}`, 'success')
    } catch {
      setClientes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, etapa: prevEtapa } : c))
      )
      toast('No se pudo mover el cliente', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (clientes.length === 0) {
    return (
      <EmptyState
        title="Embudo vacío"
        description="No hay clientes activos para mostrar."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-[var(--fg)]">Embudo de ventas</h1>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {ETAPAS.map((etapa) => (
            <Column key={etapa} etapa={etapa} clientes={grupos[etapa] ?? []} />
          ))}
        </div>
        <DragOverlay>
          {activeCliente ? <ClienteCard cliente={activeCliente} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
