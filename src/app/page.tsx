import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LandingClient from './LandingClient'

export const metadata = {
  title: 'ONE NATION TAX AND DOCUMENT SERVICES LLC',
  description: 'Taxes, formación de LLC y planes de negocios en Phoenix, AZ. Atención en español.',
  openGraph: {
    title: 'ONE NATION TAX — Phoenix, AZ',
    description: 'Prepara tus taxes, forma tu LLC o lanza tu plan de negocios. Atención en español.',
    type: 'website',
  },
}

export default async function HomePage() {
  const session = await getSession()
  if (session) redirect('/dashboard')
  return <LandingClient />
}
