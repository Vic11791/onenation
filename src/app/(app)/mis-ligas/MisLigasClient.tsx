'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToastContext } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/utils';
import type { SessionUser } from '@/lib/auth';
import { Copy, Calendar, LinkIcon } from 'lucide-react';

interface Cita {
  id: string;
  titulo: string;
  inicio: string;
  cliente?: { nombre: string } | null;
}

interface Props {
  liga: string | null;
  session: SessionUser;
}

export default function MisLigasClient({ liga }: Props) {
  const { toast } = useToastContext();
  const [origin, setOrigin] = useState('');
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOrigin(
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || ''
    );
  }, []);

  useEffect(() => {
    fetch('/api/citas')
      .then((r) => r.json())
      .then((d) => {
        const now = new Date();
        const next = (d.citas || []).filter(
          (c: Cita) => new Date(c.inicio) >= now
        );
        setCitas(next);
      })
      .catch(() => setCitas([]))
      .finally(() => setLoading(false));
  }, []);

  if (!liga) {
    return (
      <EmptyState
        icon={<LinkIcon className="w-12 h-12" />}
        title="Sin liga de agenda"
        description="Tu cuenta aún no tiene una liga pública asignada."
      />
    );
  }

  const url = `${origin}/agenda/${liga}`;

  const copy = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => toast('Copiado', 'success'));
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Mi liga de agenda</h1>
        <p className="text-sm text-[var(--muted-fg)]">
          Comparte este enlace para que tus clientes agenden citas contigo.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1">
              <Input label="Enlace de reservación" value={url} readOnly />
            </div>
            <Button onClick={copy}>
              <Copy className="w-4 h-4" /> Copiar
            </Button>
          </div>
          <div className="flex flex-col items-center gap-2 pt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                url
              )}`}
              alt="Código QR"
              width={180}
              height={180}
              className="rounded-lg border border-[var(--border-color)] bg-white p-2"
            />
            <span className="text-xs text-[var(--muted-fg)]">
              Escanea para abrir la agenda
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-[var(--fg)] flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Próximas citas
          </h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : citas.length === 0 ? (
            <p className="text-sm text-[var(--muted-fg)] py-4">
              No tienes citas próximas.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--border-color)]">
              {citas.map((c) => (
                <li key={c.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-[var(--fg)]">{c.titulo}</div>
                    <div className="text-xs text-[var(--muted-fg)]">
                      {c.cliente?.nombre ?? 'Sin cliente'}
                    </div>
                  </div>
                  <span className="text-xs text-[var(--muted-fg)] whitespace-nowrap">
                    {formatDateTime(c.inicio)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
