'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Building2, BarChart3, CheckCircle, Star, Phone, MapPin, Clock, ArrowRight, MessageCircle } from 'lucide-react'

export default function LandingClient() {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', mensaje: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre || !form.telefono) return
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/leads/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) { setError(data.error || 'Error al enviar. Intenta de nuevo.'); setStatus('error'); return }
      setStatus('success')
    } catch {
      setError('Error de conexión. Por favor intenta de nuevo.')
      setStatus('error')
    }
  }

  const waUrl = `https://wa.me/16025551234?text=${encodeURIComponent('Hola, me interesa información sobre sus servicios.')}`

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#e05a5a] flex items-center justify-center">
              <span className="text-white text-sm font-bold">1N</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm hidden sm:block">ONE NATION TAX</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-700">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400">Acceso CRM</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-[#e05a5a] text-sm font-medium px-4 py-2 rounded-full mb-6">
          <CheckCircle className="w-4 h-4" /> Atención en español · Phoenix, AZ
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
          Prepara tus Taxes,<br className="hidden sm:block" />
          <span className="text-[#e05a5a]"> Forma tu LLC</span> o<br className="hidden sm:block" />
          Lanza tu Plan de Negocios
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          ONE NATION TAX AND DOCUMENT SERVICES te acompaña en cada paso. Expertos en servicios para la comunidad latina en Phoenix, AZ.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#agendar" className="inline-flex items-center gap-2 bg-[#e05a5a] hover:bg-[#c94e4e] text-white font-semibold px-8 py-4 rounded-xl text-lg transition shadow-lg shadow-red-200 dark:shadow-none">
            Agenda tu cita <ArrowRight className="w-5 h-5" />
          </a>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition">
            <MessageCircle className="w-5 h-5" /> WhatsApp
          </a>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-[#e05a5a] py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8 text-center text-white">
          {[['500+', 'Clientes atendidos'], ['10', 'Años de experiencia'], ['100%', 'Satisfacción']].map(([n, l]) => (
            <div key={l}>
              <div className="text-3xl font-bold">{n}</div>
              <div className="text-red-100 text-sm mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">¿Qué ofrecemos?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: FileText, title: 'Llenado de Taxes', desc: 'Declaración de impuestos federal y estatal. Individual y de negocio. Maximizamos tu reembolso.' },
            { icon: Building2, title: 'Formación de LLC', desc: 'Registra tu empresa en Arizona de forma rápida y correcta. Protege tu patrimonio personal.' },
            { icon: BarChart3, title: 'Planes de Negocios', desc: 'Planea el futuro de tu empresa con un plan profesional que te abra puertas a financiamiento.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-[#e05a5a]" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Lo que dicen nuestros clientes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Rosa M.', text: 'Excelente servicio. Me ayudaron con mis taxes y me explicaron todo en español. ¡Muy recomendados!', rating: 5 },
              { name: 'Miguel A.', text: 'Formé mi LLC con ellos y fue muy fácil. Rápidos, profesionales y precios justos. Los recomiendo 100%.', rating: 5 },
              { name: 'Lucía T.', text: 'Necesitaba un plan de negocios para el banco y me lo hicieron perfecto. Muy atentos y profesionales.', rating: 5 },
            ].map(t => (
              <div key={t.name} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex gap-1 mb-3">{[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">"{t.text}"</p>
                <span className="font-semibold text-gray-900 dark:text-white">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking form */}
      <section id="agendar" className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Agenda tu cita gratis</h2>
          <p className="text-gray-500 dark:text-gray-400">Uno de nuestros asesores te contactará en menos de 24 horas.</p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¡Listo! Te contactamos pronto</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Te contactaremos en menos de 24 horas. ¿Quieres atención inmediata?</p>
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition">
              <MessageCircle className="w-5 h-5" /> Escríbenos por WhatsApp ahora
            </a>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre completo <span className="text-[#e05a5a]">*</span></label>
                  <input required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Tu nombre"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e05a5a] transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp / Teléfono <span className="text-[#e05a5a]">*</span></label>
                  <input required value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} placeholder="(602) 555-1234" type="tel"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e05a5a] transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo electrónico (opcional)</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@correo.com" type="email"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e05a5a] transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">¿En qué te podemos ayudar?</label>
                <textarea value={form.mensaje} onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))} placeholder="Taxes, LLC, plan de negocios..." rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e05a5a] transition resize-none" />
              </div>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                  <button type="button" onClick={() => setStatus('idle')} className="text-red-600 text-sm underline mt-1">Reintentar</button>
                </div>
              )}
              <button type="submit" disabled={status === 'loading'}
                className="w-full h-12 bg-[#e05a5a] hover:bg-[#c94e4e] disabled:opacity-60 text-white font-semibold rounded-xl transition text-lg flex items-center justify-center gap-2">
                {status === 'loading' ? (
                  <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Enviando...</>
                ) : <><ArrowRight className="w-5 h-5" /> Quiero que me contacten</>}
              </button>
            </form>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#e05a5a] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1N</span>
                </div>
                <span className="text-white font-semibold">ONE NATION TAX</span>
              </div>
              <p className="text-sm">Servicios profesionales para la comunidad latina en Phoenix, Arizona.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Contacto</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> (602) 555-1234</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Phoenix, AZ 85001</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Lun–Vie 10am–6pm</div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Servicios</h3>
              <ul className="space-y-1 text-sm">
                <li>Llenado de Taxes</li>
                <li>Formación de LLC</li>
                <li>Planes de Negocios</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs">
            © {new Date().getFullYear()} ONE NATION TAX AND DOCUMENT SERVICES LLC · Phoenix, AZ
          </div>
        </div>
      </footer>
    </div>
  )
}
