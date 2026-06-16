'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastContext } from '@/components/ui/Toast';
import type { SessionUser } from '@/lib/auth';
import { Copy, ExternalLink, Share2, MessageCircle, Camera, Globe } from 'lucide-react';

interface Props {
  session: SessionUser;
}

export default function ComparteClient({ }: Props) {
  const { toast } = useToastContext();
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || ''
    );
  }, []);

  const base = `${origin}/landing`;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast('Copiado', 'success'));
  };

  const preset = [
    {
      label: 'Facebook',
      icon: <Globe className="w-4 h-4" />,
      url: `${base}?utm_source=facebook&utm_medium=social`,
    },
    {
      label: 'Instagram',
      icon: <Camera className="w-4 h-4" />,
      url: `${base}?utm_source=instagram&utm_medium=social`,
    },
    {
      label: 'TikTok',
      icon: <Share2 className="w-4 h-4" />,
      url: `${base}?utm_source=tiktok&utm_medium=social`,
    },
    {
      label: 'WhatsApp',
      icon: <MessageCircle className="w-4 h-4" />,
      url: `${base}?utm_source=whatsapp&utm_medium=social`,
    },
  ];

  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');

  const customUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (source) params.set('utm_source', source);
    if (medium) params.set('utm_medium', medium);
    if (campaign) params.set('utm_campaign', campaign);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [base, source, medium, campaign]);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Comparte</h1>
        <p className="text-sm text-[var(--muted-fg)]">
          Herramientas de marketing y enlaces rastreables.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-[var(--fg)]">Landing page</h2>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <code className="flex-1 text-sm text-[var(--fg)] bg-[var(--muted)] rounded-lg px-3 py-2 truncate">
            {base}
          </code>
          <a href={base} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4" /> Abrir
            </Button>
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-[var(--fg)]">Enlaces por canal</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {preset.map((p) => (
            <div key={p.label} className="flex items-center gap-3">
              <span className="flex items-center gap-2 w-28 text-sm font-medium text-[var(--fg)]">
                {p.icon} {p.label}
              </span>
              <code className="flex-1 text-xs text-[var(--muted-fg)] bg-[var(--muted)] rounded-lg px-3 py-2 truncate">
                {p.url}
              </code>
              <Button size="sm" variant="outline" onClick={() => copy(p.url)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-[var(--fg)]">
            Constructor de enlaces UTM
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="utm_source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="google"
            />
            <Input
              label="utm_medium"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="cpc"
            />
            <Input
              label="utm_campaign"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="verano2026"
            />
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-xs text-[var(--fg)] bg-[var(--muted)] rounded-lg px-3 py-2 truncate">
              {customUrl}
            </code>
            <Button onClick={() => copy(customUrl)}>
              <Copy className="w-4 h-4" /> Copiar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
