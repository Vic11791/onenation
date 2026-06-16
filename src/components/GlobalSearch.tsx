'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Clock, Users, KanbanSquare, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const PLACEHOLDER_RESULTS = [
  { type: 'cliente', label: 'María García', sub: 'Declaración de impuestos', href: '/clientes/1' },
  { type: 'cliente', label: 'Carlos Hernández', sub: 'Renovación ITIN', href: '/clientes/2' },
  { type: 'oportunidad', label: 'Tax Return 2024', sub: '$450 - Activo', href: '/embudo' },
  { type: 'oportunidad', label: 'Notarización de documentos', sub: '$80 - Tibio', href: '/embudo' },
];

const typeIcon = {
  cliente: <Users className="w-4 h-4 text-blue-500" />,
  oportunidad: <KanbanSquare className="w-4 h-4 text-indigo-500" />,
};

const typeLabel = { cliente: 'Clientes', oportunidad: 'Oportunidades' };

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      setRecentSearches(stored);
    } catch {}
  }, []);

  const openSearch = useCallback(() => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const closeSearch = () => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') closeSearch();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openSearch]);

  const filtered = query.trim()
    ? PLACEHOLDER_RESULTS.filter(r =>
        r.label.toLowerCase().includes(query.toLowerCase()) ||
        r.sub.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const grouped = filtered.reduce<Record<string, typeof PLACEHOLDER_RESULTS>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  const flatResults = Object.values(grouped).flat();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, flatResults.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && flatResults[activeIndex]) {
      addRecent(query);
      window.location.href = flatResults[activeIndex].href;
      closeSearch();
    }
  };

  const addRecent = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  let flatIndex = 0;

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSearch}
            />
            <motion.div
              className="relative w-full max-w-xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden z-10"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]">
                <Search className="w-5 h-5 text-[var(--muted-fg)] shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar clientes, oportunidades..."
                  className="flex-1 bg-transparent text-sm text-[var(--fg)] placeholder:text-[var(--muted-fg)] outline-none"
                />
                <button onClick={closeSearch} className="text-[var(--muted-fg)] hover:text-[var(--fg)]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {!query && recentSearches.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1 text-xs font-medium text-[var(--muted-fg)] uppercase tracking-wider">Recientes</p>
                    {recentSearches.map(s => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-[var(--muted)] text-sm text-[var(--fg)] text-left"
                      >
                        <Clock className="w-4 h-4 text-[var(--muted-fg)]" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {query && flatResults.length === 0 && (
                  <div className="py-12 text-center text-sm text-[var(--muted-fg)]">
                    Sin resultados para "{query}"
                  </div>
                )}

                {Object.entries(grouped).map(([type, results]) => (
                  <div key={type} className="p-2">
                    <p className="px-2 py-1 text-xs font-medium text-[var(--muted-fg)] uppercase tracking-wider">
                      {typeLabel[type as keyof typeof typeLabel]}
                    </p>
                    {results.map(r => {
                      const idx = flatIndex++;
                      const isActive = idx === activeIndex;
                      return (
                        <a
                          key={r.href + r.label}
                          href={r.href}
                          onClick={() => { addRecent(query); closeSearch(); }}
                          className={[
                            'flex items-center gap-3 px-2 py-2 rounded-lg text-sm',
                            isActive ? 'bg-[var(--muted)]' : 'hover:bg-[var(--muted)]',
                          ].join(' ')}
                        >
                          {typeIcon[type as keyof typeof typeIcon]}
                          <div>
                            <p className="font-medium text-[var(--fg)]">{r.label}</p>
                            <p className="text-xs text-[var(--muted-fg)]">{r.sub}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 border-t border-[var(--border-color)] flex items-center gap-4 text-xs text-[var(--muted-fg)]">
                <span><kbd className="px-1 py-0.5 rounded bg-[var(--muted)] font-mono">↑↓</kbd> navegar</span>
                <span><kbd className="px-1 py-0.5 rounded bg-[var(--muted)] font-mono">Enter</kbd> abrir</span>
                <span><kbd className="px-1 py-0.5 rounded bg-[var(--muted)] font-mono">Esc</kbd> cerrar</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
