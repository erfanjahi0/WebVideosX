import { Link } from 'react-router-dom';
import { Clock, Eye, Play, Sparkles } from 'lucide-react';
import { buildGradientFromText } from '../utils/format';

export default function VideoCard({ video }) {
  const gradient = buildGradientFromText(video.title);

  return (
    <Link
      to={`/watch/${video.id}`}
      className="group premium-card block rounded-[1.65rem] transition duration-300 hover:-translate-y-1 hover:border-rose-300/45 hover:shadow-glow"
    >
      <div className="relative aspect-video overflow-hidden rounded-t-[1.65rem] bg-zinc-900">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.32),transparent_28%),linear-gradient(180deg,transparent,rgba(0,0,0,0.22))]" />
            <div className="relative rounded-full bg-black/25 p-5 text-white shadow-soft backdrop-blur-md ring-1 ring-white/20 transition group-hover:scale-110">
              <Play fill="currentColor" />
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white shadow-soft backdrop-blur-md ring-1 ring-white/15">
          <Sparkles size={13} /> {video.category}
        </div>

        <div className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1.5 text-xs font-black text-white backdrop-blur-md ring-1 ring-white/15">
          {video.duration}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
          <div className="rounded-full bg-white/15 p-5 text-white backdrop-blur-md ring-1 ring-white/30">
            <Play fill="currentColor" size={28} />
          </div>
        </div>
      </div>

      <div className="relative p-4 sm:p-5">
        <h3 className="line-clamp-2 min-h-12 text-base font-black leading-snug text-white sm:text-[17px]">{video.title}</h3>

        <div className="mt-4 flex items-center justify-between gap-3 text-xs font-bold text-zinc-500">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.045] px-3 py-1.5">
            <Eye size={15} /> {video.views}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.045] px-3 py-1.5">
            <Clock size={15} /> {video.duration}
          </span>
        </div>
      </div>
    </Link>
  );
}
