import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Ahora mismo'
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24)
    return `Hoy ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
  if (diffDays === 1)
    return `Ayer ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
  if (diffDays < 7)
    return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
  return d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: diffDays > 365 ? 'numeric' : undefined,
  })
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function diasSinContacto(ultimoContacto: Date | string | null | undefined): number {
  if (!ultimoContacto) return 999
  return Math.floor((Date.now() - new Date(ultimoContacto).getTime()) / 86400000)
}

export function diasEnEtapa(fecha: Date | string): number {
  return Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000)
}

export function temperaturaIcon(temp: string): string {
  if (temp === 'CALIENTE') return '🔥'
  if (temp === 'FRIO') return '🔵'
  return '🟡'
}

export function temperaturaLabel(temp: string): string {
  if (temp === 'CALIENTE') return '🔥 Caliente'
  if (temp === 'FRIO') return '🔵 Frío'
  return '🟡 Tibio'
}

export function formatWhatsApp(numero: string): string {
  const digits = numero.replace(/\D/g, '')
  if (digits.startsWith('1') && digits.length === 11) return digits
  if (digits.length === 10) return '1' + digits
  return digits
}

export function buildWhatsAppUrl(numero: string, mensaje: string): string {
  const intl = formatWhatsApp(numero)
  return `https://wa.me/${intl}?text=${encodeURIComponent(mensaje)}`
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str
  return str.slice(0, len) + '…'
}

export function mesLabel(fecha: Date | string): string {
  return new Date(fecha).toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
}

export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function startOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}
