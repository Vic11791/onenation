'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, KanbanSquare, ListChecks, Plus } from 'lucide-react';

const items = [
  { href: '/', label: 'Tablero', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/embudo', label: 'Embudo', icon: KanbanSquare },
  { href: '/seguimiento', label: 'Seguimiento', icon: ListChecks },
];

export function BottomNav({ onNew }: { onNew?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--card-bg)] border-t border-[var(--border-color)] flex items-center justify-around h-16 px-2">
      {items.map((item, i) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        // Insert "+" button in the middle
        const showPlus = i === 2;
        return (
          <div key={item.href} className="flex items-center gap-2">
            {showPlus && (
              <button
                onClick={onNew}
                aria-label="Crear nuevo"
                className="w-12 h-12 -mt-6 rounded-full bg-[#e05a5a] flex items-center justify-center text-white shadow-lg"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
            <Link
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1"
            >
              <Icon className={['w-5 h-5', isActive ? 'text-[#e05a5a]' : 'text-[var(--muted-fg)]'].join(' ')} />
              <span className={['text-[10px]', isActive ? 'text-[#e05a5a] font-medium' : 'text-[var(--muted-fg)]'].join(' ')}>
                {item.label}
              </span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
