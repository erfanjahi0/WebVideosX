import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Layers3, Tag } from 'lucide-react';
import AdSlot from '../components/AdSlot';
import RelatedVideos from '../components/RelatedVideos';
import VideoPlayer from '../components/VideoPlayer';

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 text-sm text-zinc-400 last:border-0 last:pb-0">
      <span className="inline-flex items-center gap-2">
        <Icon size={16} className="text-rose-200" /> {label}
      </span>
      <strong className="text-right text-white">{value}</strong>
    </div>
  );
}

export default function WatchPage({ videos, settings }) {
  const { id } = useParams();
  const categoriesEnabled = settings.ui.categoriesEnabled !== false;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const video = useMemo(() => videos.find((item) => item.id === id), [id, videos]);

  if (!video) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="premium-card rounded-[2rem] p-10">
          <h1 className="text-3xl font-black text-white">Video not found</h1>
          <p className="mt-3 text-zinc-500">This video may be inactive, removed, or still loading.</p>
          <Link to="/" className="premium-button mt-6">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      <Link
        to="/"
        className="soft-button mb-4"
      >
        <ArrowLeft size={18} /> Back to videos
      </Link>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:gap-6">
        <div>
          <VideoPlayer video={video} settings={settings} />

          {settings.ads.enabled && settings.ads.watchPageBannerEnabled !== false && (
            <div className="mt-6">
              <AdSlot html={settings.ads.watchPageBannerHtml} label="Watch page advertisement" />
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {settings.ads.enabled && settings.ads.nativeBannerEnabled !== false && <AdSlot html={settings.ads.nativeBannerHtml} label="Native advertisement" compact />}

          <div className="premium-card rounded-[2rem] p-5">
            <h2 className="text-xl font-black text-white">Video details</h2>

            <div className="mt-5 grid gap-3">
              {categoriesEnabled && <DetailRow icon={Layers3} label="Category" value={video.category} />}
              <DetailRow icon={Eye} label="Views" value={video.views} />
              <DetailRow icon={Clock} label="Duration" value={video.duration} />
            </div>

            {video.tags?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs font-bold text-zinc-300">
                    <Tag size={13} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <RelatedVideos currentVideo={video} videos={videos} settings={settings} />
    </main>
  );
}
