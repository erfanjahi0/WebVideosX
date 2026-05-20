import { ExternalLink, Play, ShieldCheck } from 'lucide-react';
import { safeExternalOpen } from '../utils/format';

export default function VideoPlayer({ video, settings }) {
  const activeButtons = [
    ...(settings.ads.directButtons || []).filter((button) => button.enabled && button.url),
    video.directLink ? { label: 'Open Video Link', url: video.directLink, enabled: true } : null
  ].filter(Boolean);

  return (
    <section className="premium-card overflow-hidden rounded-[2rem]">
      <div className="relative aspect-video bg-black">
        <div className="absolute inset-0 z-10 pointer-events-none rounded-t-[2rem] ring-1 ring-inset ring-white/10" />
        {video.embedUrl ? (
          <iframe
            src={video.embedUrl}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.15),transparent_36%),#050505] text-zinc-500">
            <div className="rounded-full bg-white/[0.06] p-6 text-rose-200 ring-1 ring-white/10">
              <Play size={44} />
            </div>
            <p className="text-sm font-bold">No embed URL added yet</p>
          </div>
        )}
      </div>

      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-rose-200">
          <span className="status-pill border-rose-300/20 bg-rose-500/10 text-rose-100">{video.category}</span>
          <span className="status-pill">{video.duration}</span>
          <span className="status-pill">{video.views} views</span>
        </div>

        <h1 className="mt-4 text-2xl font-black leading-tight text-white md:text-4xl">{video.title}</h1>

        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-400">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-rose-200" />
          <p>Use the official embed/direct links provided by the content host. External buttons open in a new tab.</p>
        </div>

        {activeButtons.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-3">
            {activeButtons.map((button, index) => (
              <button
                key={`${button.label}-${index}`}
                onClick={() => safeExternalOpen(button.url)}
                className={index === 0 ? 'premium-button' : 'soft-button'}
              >
                {button.label} <ExternalLink size={17} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
