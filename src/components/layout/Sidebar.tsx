'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, KanbanSquare, CalendarDays, Wallet,
  ListChecks, Trophy, XCircle, Archive, CalendarPlus, Share2,
  UserCog, ShieldCheck, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Tablero', icon: LayoutDashboard, color: '#e05a5a' },
  { href: '/clientes', label: 'Clientes', icon: Users, color: '#3b82f6' },
  { href: '/embudo', label: 'Embudo', icon: KanbanSquare, color: '#6366f1' },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays, color: '#22c55e' },
  { href: '/pagos', label: 'Pagos', icon: Wallet, color: '#10b981' },
  { href: '/seguimiento', label: 'Seguimiento', icon: ListChecks, color: '#f59e0b' },
  { href: '/completados', label: 'Completados', icon: Trophy, color: '#16a34a' },
  { href: '/perdidos', label: 'Perdidos', icon: XCircle, color: '#6b7280' },
  { href: '/archivados', label: 'Archivados', icon: Archive, color: '#78716c' },
  { href: '/mis-ligas', label: 'Mis ligas', icon: CalendarPlus, color: '#14b8a6' },
  { href: '/comparte', label: 'Comparte', icon: Share2, color: '#e05a5a' },
  { href: '/equipo', label: 'Equipo', icon: UserCog, color: '#06b6d4' },
  { href: '/admin', label: 'Admin', icon: ShieldCheck, color: '#e05a5a' },
];

interface SidebarProps {
  session?: { id: string; nombre: string; email: string; rol: string } | null
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const items = session?.rol === 'ADMIN' ? navItems : navItems.filter(i => i.href !== '/admin');

  return (
    <aside
      className={[
        'hidden md:flex flex-col h-full bg-[var(--card-bg)] border-r border-[var(--border-color)] transition-all duration-200',
        collapsed ? 'w-16' : 'w-56',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border-color)] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#e05a5a] flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">1N</span>
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-[var(--fg)] truncate">One Nation Tax</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={[
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-[var(--muted)] text-[var(--fg)]'
                  : 'text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--fg)]',
              ].join(' ')}
              style={isActive ? { color: item.color } : {}}
            >
              <Icon
                className="w-5 h-5 shrink-0"
                style={{ color: isActive ? item.color : undefined }}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-[var(--border-color)]">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-fg)] transition-colors"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
