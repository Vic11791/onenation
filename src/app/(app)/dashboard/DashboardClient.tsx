'use client'

import Link from 'next/link'
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, DollarSign, Users, Calendar, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { SessionUser } from '@/lib/auth'

type DashData = {
  ganadosEstesMes: number
  ganadosMesAnterior: number
  ingresosMes: number
  ingresosMesAnterior: number
  nuevosLeads: number
  nuevosLeadsMesAnterior: number
  citasMes: number
  pagosVencidos: number
  pagosVencidosMonto: number
  accionesVencidas: number
  sinAccion: number
  embudo: { etapa: string; _count: { id: number } }[]
  historico: { mes: string; ingresos: number; clientes: number }[]
  origenes: { origen: string; count: number }[]
  metaMes: number
}

const ETAPAS = ['Nuevo', 'Contactado', 'Calificado', 'Propuesta', 'Negociación']

function Delta({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous
  if (diff === 0) return <span className="inline-flex items-center text-xs text-[var(--muted-fg)]"><Minus className="w-3 h-3" /></span>
  const up = diff > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{diff}
    </span>
  )
}

function StatCard({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: string; delta?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[var(--muted-fg)]">{icon}</div>
        {delta}
      </div>
      <p className="text-2xl font-bold text-[var(--fg)]">{value}</p>
      <p className="text-xs text-[var(--muted-fg)] mt-1">{label}</p>
    </Card>
  )
}

export default function DashboardClient({ data, session }: { data: DashData; session: SessionUser }) {
  const meta = data.metaMes || 15
  const pct = Math.min(100, Math.round((data.ganadosEstesMes / meta) * 100))

  const chartData = data.historico.map((h) => ({ mes: h.mes, ganados: h.clientes, ingresos: h.ingresos }))
  const embudoMap = new Map(data.embudo.map((e) => [e.etapa, e._count.id]))
  const totalOrigenes = data.origenes.reduce((s, o) => s + o.count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Hola, {session.nombre.split(' ')[0]} 👋</h1>
        <p className="text-sm text-[var(--muted-fg)]">Este es tu resumen del mes.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Trophy className="w-5 h-5" />} label={`Ganados este mes (meta ${meta})`} value={String(data.ganadosEstesMes)} delta={<Delta current={data.ganadosEstesMes} previous={data.ganadosMesAnterior} />} />
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Ingresos del mes" value={formatCurrency(data.ingresosMes)} delta={<Delta current={data.ingresosMes} previous={data.ingresosMesAnterior} />} />
        <StatCard icon={<Users className="w-5 h-5" />} label="Nuevos leads" value={String(data.nuevosLeads)} delta={<Delta current={data.nuevosLeads} previous={data.nuevosLeadsMesAnterior} />} />
        <StatCard icon={<Calendar className="w-5 h-5" />} label="Citas del mes" value={String(data.citasMes)} />
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-[var(--fg)]">Meta del mes</p>
          <p className="text-sm text-[var(--muted-fg)]">{data.ganadosEstesMes} / {meta}</p>
        </div>
        <div className="h-3 rounded-full bg-[var(--muted)] overflow-hidden">
          <div className="h-full bg-[#e05a5a] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </Card>

      {(data.pagosVencidos > 0 || data.accionesVencidas > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.pagosVencidos > 0 && (
            <Link href="/pagos">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">{data.pagosVencidos} pagos vencidos</p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80">{formatCurrency(data.pagosVencidosMonto)} por cobrar</p>
                </div>
              </div>
            </Link>
          )}
          {data.accionesVencidas > 0 && (
            <Link href="/seguimiento">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">{data.accionesVencidas} acciones vencidas</p>
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Requieren tu seguimiento hoy</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      <Card className="p-4">
        <p className="text-sm font-medium text-[var(--fg)] mb-4">Últimos 6 meses</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--muted-fg)' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: 'var(--muted-fg)' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: 'var(--muted-fg)' }} />
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
              <Legend />
              <Bar yAxisId="left" dataKey="ganados" name="Ganados" fill="#e05a5a" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-sm font-medium text-[var(--fg)] mb-4">Embudo activo</p>
          <div className="space-y-3">
            {ETAPAS.map((etapa) => {
              const count = embudoMap.get(etapa) || 0
              const max = Math.max(1, ...ETAPAS.map((e) => embudoMap.get(e) || 0))
              return (
                <div key={etapa}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--fg)]">{etapa}</span>
                    <span className="text-[var(--muted-fg)]">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                    <div className="h-full bg-[#e05a5a]/70 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium text-[var(--fg)] mb-4">De dónde llegan</p>
          {data.origenes.length === 0 ? (
            <p className="text-sm text-[var(--muted-fg)]">Sin leads nuevos este mes.</p>
          ) : (
            <div className="space-y-3">
              {data.origenes.map((o) => {
                const p = totalOrigenes ? Math.round((o.count / totalOrigenes) * 100) : 0
                return (
                  <div key={o.origen}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--fg)]">{o.origen}</span>
                      <span className="text-[var(--muted-fg)]">{o.count} · {p}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                      <div className="h-full bg-blue-500/70 rounded-full" style={{ width: `${p}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
