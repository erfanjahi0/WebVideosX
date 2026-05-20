import { Flame, Film, Search, Sparkles } from 'lucide-react';
import AdSlot from '../components/AdSlot';
import VideoGrid from '../components/VideoGrid';

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-200 ring-1 ring-rose-300/20">
          <Icon size={19} />
        </div>
        <div>
          <p className="text-lg font-black text-white">{value}</p>
          <p className="text-xs font-semibold text-zinc-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="premium-card shimmer h-72 rounded-[1.65rem]" />
      ))}
    </div>
  );
}

export default function HomePage({ videos, allVideos = [], loading, settings, category, query }) {
  const hasFilters = category !== 'All' || query.trim();

  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      <section className="premium-card fade-in-up rounded-[2.25rem] p-5 sm:p-8 lg:p-10">
        <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-rose-100">
              <Sparkles size={15} /> Premium video hub
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-7xl">
              Smooth previews for every screen.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              {settings.brand.tagline || 'A fast, responsive video landing experience with clean cards, custom filters, and a polished admin workflow.'}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Stat icon={Film} label="Available" value={allVideos.length || videos.length} />
              <Stat icon={Flame} label="Showing" value={videos.length} />
              <Stat icon={Search} label="Filter" value={hasFilters ? 'Active' : 'All'} />
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="float-slow aspect-[4/5] rounded-[2rem] border border-white/10 bg-gradient-to-br from-rose-500/30 via-fuchsia-500/20 to-indigo-500/20 p-4 shadow-glow">
              <div className="h-full rounded-[1.5rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-rose-500 via-fuchsia-500 to-indigo-500 shadow-soft" />
                <div className="mt-4 h-4 w-3/4 rounded-full bg-white/20" />
                <div className="mt-3 h-3 w-1/2 rounded-full bg-white/10" />
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="h-24 rounded-2xl bg-white/10" />
                  <div className="h-24 rounded-2xl bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {settings.ads.enabled && (
        <div className="my-5">
          <AdSlot html={settings.ads.topBannerHtml} label="Top advertisement" enabled />
        </div>
      )}

      <div className="mb-4 mt-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-rose-200">Browse</p>
          <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">{hasFilters ? 'Filtered videos' : 'Latest videos'}</h2>
        </div>
        <p className="text-sm font-semibold text-zinc-500">{loading ? 'Loading...' : `${videos.length} item${videos.length === 1 ? '' : 's'}`}</p>
      </div>

      {loading ? <HomeSkeleton /> : <VideoGrid videos={videos} settings={settings} />}
    </main>
  );
}
