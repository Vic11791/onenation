import { getSession } from '@/lib/auth'
import ClienteExpediente from './ClienteExpediente'

export const metadata = { title: 'Expediente de cliente' }

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) return null
  const { id } = await params
  return <ClienteExpediente clienteId={id} session={session} />
}
