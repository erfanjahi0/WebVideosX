import AdSlot from './AdSlot';
import VideoCard from './VideoCard';

export default function VideoGrid({ videos, settings }) {
  const itemsPerAdBreak = Number(settings.ui.itemsPerAdBreak || 8);

  if (!videos.length) {
    return (
      <div className="premium-card fade-in-up rounded-[2rem] p-10 text-center">
        <div className="mx-auto mb-5 h-16 w-16 rounded-3xl bg-white/[0.06] ring-1 ring-white/10" />
        <h2 className="text-3xl font-black text-white">No videos found</h2>
        <p className="mx-auto mt-3 max-w-md text-zinc-500">Add videos from the admin panel or try a different search/category filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
      {videos.map((video, index) => (
        <div key={video.id} className="contents">
          <VideoCard video={video} />

          {settings.ads.enabled && settings.ads.inFeedBannerHtml && (index + 1) % itemsPerAdBreak === 0 && (
            <div className="sm:col-span-2 xl:col-span-4">
              <AdSlot html={settings.ads.inFeedBannerHtml} label="In-feed advertisement" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
