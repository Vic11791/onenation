'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToastContext } from '@/components/ui/Toast';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatar?: string | null;
  tema?: string | null;
  vistaDensidad?: string | null;
  metaMes?: number | null;
  ligaAgenda?: string | null;
}

export default function PerfilClient({ usuario }: { usuario: Usuario }) {
  const { toast } = useToastContext();

  const [nombre, setNombre] = useState(usuario.nombre ?? '');
  const [email, setEmail] = useState(usuario.email ?? '');
  const [avatar, setAvatar] = useState(usuario.avatar ?? '');
  const [tema, setTema] = useState(usuario.tema ?? 'auto');
  const [vistaDensidad, setVistaDensidad] = useState(usuario.vistaDensidad ?? 'comoda');
  const [metaMes, setMetaMes] = useState(String(usuario.metaMes ?? ''));
  const [savingProfile, setSavingProfile] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          email,
          avatar,
          tema,
          vistaDensidad,
          metaMes: metaMes ? Number(metaMes) : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      toast('Perfil actualizado', 'success');
    } catch {
      toast('Error al actualizar perfil', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (!password) {
      toast('Ingresa una contraseña', 'warning');
      return;
    }
    if (password !== confirmar) {
      toast('Las contraseñas no coinciden', 'error');
      return;
    }
    setSavingPass(true);
    try {
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error();
      toast('Contraseña actualizada', 'success');
      setPassword('');
      setConfirmar('');
    } catch {
      toast('Error al cambiar contraseña', 'error');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Mi perfil</h1>
        <p className="text-sm text-[var(--muted-fg)]">
          Administra tu información y preferencias.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-[var(--fg)]">Información</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Avatar (URL)"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
            <Input
              label="Meta mensual"
              type="number"
              value={metaMes}
              onChange={(e) => setMetaMes(e.target.value)}
            />
            <Select
              label="Tema"
              options={[
                { value: 'auto', label: 'Automático' },
                { value: 'light', label: 'Claro' },
                { value: 'dark', label: 'Oscuro' },
              ]}
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            />
            <Select
              label="Densidad de vista"
              options={[
                { value: 'comoda', label: 'Cómoda' },
                { value: 'compacta', label: 'Compacta' },
              ]}
              value={vistaDensidad}
              onChange={(e) => setVistaDensidad(e.target.value)}
            />
          </div>
          <Input label="Liga de agenda" value={usuario.ligaAgenda ?? ''} disabled />
          <div>
            <Button onClick={saveProfile} loading={savingProfile}>
              Guardar cambios
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-[var(--fg)]">Cambiar contraseña</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nueva contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
            />
          </div>
          <div>
            <Button onClick={savePassword} loading={savingPass}>
              Actualizar contraseña
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
