'use client';

import { Search, Bell, HelpCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const pageTitles: Record<string, string> = {
  '/': 'Tablero',
  '/clientes': 'Clientes',
  '/embudo': 'Embudo de Ventas',
  '/agenda': 'Agenda',
  '/pagos': 'Pagos',
  '/seguimiento': 'Seguimiento',
  '/completados': 'Completados',
  '/perdidos': 'Perdidos',
  '/archivados': 'Archivados',
  '/mis-ligas': 'Mis Ligas',
  '/comparte': 'Comparte',
  '/equipo': 'Equipo',
  '/admin': 'Administración',
};

interface TopBarProps {
  session?: { id: string; nombre: string; email: string; rol: string } | null
}

export function TopBar({ session }: TopBarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitles[pathname] || 'One Nation Tax';
  const [alertCount, setAlertCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/alertas/count').then(r => r.json()).then(d => setAlertCount(d.count || 0)).catch(() => {});
  }, [pathname]);

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const initials = session?.nombre?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

  return (
    <header className="h-16 flex items-center gap-3 px-4 md:px-6 border-b border-[var(--border-color)] bg-[var(--card-bg)] shrink-0 relative">
      <h1 className="text-base font-semibold text-[var(--fg)] flex-1 truncate">{title}</h1>
      <div className="flex items-center gap-1">
        <IconBtn label="Buscar (Ctrl+K)"><Search className="w-5 h-5" /></IconBtn>
        <div className="relative">
          <IconBtn label="Notificaciones"><Bell className="w-5 h-5" /></IconBtn>
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e05a5a] text-white text-[10px] flex items-center justify-center font-bold">{alertCount > 9 ? '9+' : alertCount}</span>
          )}
        </div>
        <IconBtn label="Ayuda"><HelpCircle className="w-5 h-5" /></IconBtn>
        <IconBtn label="Cambiar tema" onClick={toggleTheme}>
          {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </IconBtn>
        <div className="relative ml-1">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-8 h-8 rounded-full bg-[#e05a5a] flex items-center justify-center text-white text-xs font-bold hover:bg-[#c94e4e] transition"
            aria-label="Menú de usuario"
          >
            {initials}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-lg py-1 z-50">
              <div className="px-3 py-2 text-xs text-[var(--muted-fg)] border-b border-[var(--border-color)]">
                <div className="font-medium text-[var(--fg)] truncate">{session?.nombre}</div>
                <div className="truncate">{session?.email}</div>
              </div>
              <button onClick={() => { setMenuOpen(false); router.push('/perfil'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--muted)] text-[var(--fg)]">Mi Perfil</button>
              {session?.rol === 'ADMIN' && <button onClick={() => { setMenuOpen(false); router.push('/admin'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--muted)] text-[var(--fg)]">Configuración</button>}
              <hr className="my-1 border-[var(--border-color)]" />
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--muted)] text-red-500">Cerrar sesión</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--fg)] transition-colors"
    >
      {children}
    </button>
  );
}
