import React, { useState } from 'react';
import { VideoNews } from '../../types';
import { Play, Video, X, Eye, Clock } from 'lucide-react';

interface VideoSectionProps {
  videos: VideoNews[];
  onNavigateToVideos: () => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ videos, onNavigateToVideos }) => {
  const [activeVideo, setActiveVideo] = useState<VideoNews | null>(null);

  if (!videos || videos.length === 0) return null;

  return (
    <section className="my-8 bg-slate-900 text-white rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-6 bg-red-600 rounded-xs"></span>
          <Video className="w-6 h-6 text-red-500" />
          <h2 className="font-serif font-black text-xl sm:text-2xl text-white">
            गैजेट ग्लो वीडियो बुलेटिन
          </h2>
        </div>

        <button
          onClick={onNavigateToVideos}
          className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
        >
          सभी वीडियो देखें →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {videos.slice(0, 3).map((vid) => (
          <div
            key={vid.id}
            onClick={() => setActiveVideo(vid)}
            className="group cursor-pointer bg-slate-800/80 rounded-lg overflow-hidden border border-slate-700 hover:border-red-500 transition-all flex flex-col justify-between"
          >
            <div className="aspect-16/9 relative overflow-hidden bg-black">
              <img
                src={vid.thumbnail}
                alt={vid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-1 fill-white" />
                </div>
              </div>
              {vid.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-[10px] font-mono px-2 py-0.5 rounded text-white">
                  {vid.duration}
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <h3 className="font-serif font-bold text-sm sm:text-base text-white leading-snug group-hover:text-red-400 transition-colors line-clamp-2 mb-3">
                {vid.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{vid.categoryName}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {vid.views.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Popup */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="w-full max-w-3xl bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white truncate pr-4">{activeVideo.title}</h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-16/9 w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
