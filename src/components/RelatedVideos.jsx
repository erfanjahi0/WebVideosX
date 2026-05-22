import VideoCard from './VideoCard';

export default function RelatedVideos({ currentVideo, videos, settings }) {
  const categoriesEnabled = settings?.ui?.categoriesEnabled !== false;
  const related = videos
    .filter((video) => video.id !== currentVideo.id)
    .filter((video) => !categoriesEnabled || video.category === currentVideo.category || videos.length < 5)
    .slice(0, 8);

  if (!related.length) return null;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-rose-200">Recommended</p>
          <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">More videos</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
        {related.map((video) => (
          <VideoCard key={video.id} video={video} showCategory={categoriesEnabled} />
        ))}
      </div>
    </section>
  );
}
