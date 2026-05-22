import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Menu, Search, Sparkles, X } from 'lucide-react';

function CategoryChips({ categories, category, setCategory, onPick }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
      {categories.map((item) => {
        const active = item === category;
        return (
          <button
            key={item}
            type="button"
            onClick={() => {
              setCategory(item);
              onPick?.();
            }}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition active:scale-[0.98] ${
              active
                ? 'border-rose-300/50 bg-rose-500 text-white shadow-glow'
                : 'border-white/10 bg-white/[0.055] text-zinc-400 hover:bg-white/[0.09] hover:text-white'
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export default function Header({ settings, query, setQuery, category, setCategory }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const categories = settings.ui.categories || ['All'];
  const showCategories = settings.ui.categoriesEnabled !== false;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const SearchBox = ({ compact = false }) => (
    <label className={`group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.065] px-4 text-zinc-400 shadow-soft backdrop-blur-xl transition focus-within:border-rose-300/60 focus-within:bg-white/[0.09] focus-within:ring-4 focus-within:ring-rose-500/10 ${compact ? 'py-3' : 'py-3.5'}`}>
      <Search size={18} className="shrink-0 transition group-focus-within:text-rose-200" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search videos, tags, categories..."
        className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-600"
      />
    </label>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/55 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:gap-5 lg:py-4">
        <Link to="/" className="group flex min-w-0 items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 font-black text-white shadow-glow ring-1 ring-white/20 sm:h-14 sm:w-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.36),transparent_38%)]" />
            {settings.brand.logoUrl ? (
              <img src={settings.brand.logoUrl} alt={settings.brand.name} className="relative h-full w-full object-cover" />
            ) : (
              <span className="relative">{settings.brand.shortName}</span>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-black leading-none text-white sm:text-lg">{settings.brand.name}</p>
            <p className="mt-1 hidden max-w-xs truncate text-xs font-semibold text-zinc-500 sm:block">{settings.brand.tagline}</p>
          </div>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
          <div className="min-w-[280px] flex-1">
            <SearchBox />
          </div>
          {showCategories && (
            <div className="max-w-[460px]">
              <CategoryChips categories={categories} category={category} setCategory={setCategory} />
            </div>
          )}
        </div>

        <Link
          to="/legal"
          className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-300 transition hover:bg-white/[0.09] hover:text-white lg:inline-flex"
        >
          <Sparkles size={16} /> Legal
        </Link>

        <button
          onClick={() => setOpen((value) => !value)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.065] text-white shadow-soft transition hover:bg-white/[0.1] active:scale-[0.98] lg:hidden"
          aria-label="Open menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 px-3 pb-4 pt-3 sm:px-4 lg:hidden">
          <div className="mx-auto max-w-7xl space-y-3">
            <SearchBox compact />
            {showCategories && <CategoryChips categories={categories} category={category} setCategory={setCategory} onPick={() => setOpen(false)} />}
            <Link
              to="/legal"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-black text-zinc-200"
            >
              Legal and contact <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
