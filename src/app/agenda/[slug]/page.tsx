import { prisma } from '@/lib/prisma'
import PublicBooking from './PublicBooking'

export const metadata = { title: 'Agendar cita' }

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const vendedor = await prisma.usuario.findUnique({
    where: { ligaAgenda: slug },
    select: { id: true, nombre: true, avatar: true },
  })

  if (!vendedor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[var(--fg)]">Liga no encontrada</h1>
          <p className="text-sm text-[var(--muted-fg)] mt-1">
            El enlace de agenda no es válido o ya no está disponible.
          </p>
        </div>
      </div>
    )
  }

  return <PublicBooking slug={slug} vendedor={{ nombre: vendedor.nombre, avatar: vendedor.avatar }} />
}
